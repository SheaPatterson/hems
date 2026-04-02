// =============================================================================
// HEMS Dispatch — Native X-Plane Plugin
// =============================================================================
// Reads simulator datarefs, performs unit conversions, and POSTs telemetry JSON
// to the Local Bridge v2 at a configurable host:port, throttled to 1 Hz.
//
// Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6
//
// Build:
//   mkdir build && cd build
//   cmake -DXPLANE_SDK_PATH=/path/to/XPSDK400 ..
//   cmake --build . --config Release
// =============================================================================

#include "XPLMPlugin.h"
#include "XPLMDataAccess.h"
#include "XPLMProcessing.h"
#include "XPLMUtilities.h"

#include <cstdio>
#include <cstring>
#include <cmath>
#include <string>
#include <fstream>
#include <sstream>
#include <chrono>

// ---------------------------------------------------------------------------
// Platform-specific HTTP helpers
// ---------------------------------------------------------------------------
#if IBM // Windows
#include <windows.h>
#include <winhttp.h>
#pragma comment(lib, "winhttp.lib")
#elif APL // macOS
#include <CoreFoundation/CoreFoundation.h>
#include <CFNetwork/CFNetwork.h>
#else // Linux
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <netdb.h>
#include <unistd.h>
#endif

// ---------------------------------------------------------------------------
// Unit conversion constants
// ---------------------------------------------------------------------------
static constexpr double METERS_TO_FEET  = 3.28084;
static constexpr double MS_TO_KNOTS     = 1.94384;
static constexpr double KG_TO_LBS       = 2.20462;
static constexpr double N1_RUNNING_THRESHOLD = 20.0;

// ---------------------------------------------------------------------------
// Bridge configuration (loaded from hems_bridge.ini)
// ---------------------------------------------------------------------------
struct BridgeConfig {
    std::string host = "localhost";
    int         port = 8080;
    std::string path = "/telemetry";
    int         send_rate_hz = 1;
};

static BridgeConfig g_config;

// ---------------------------------------------------------------------------
// Dataref handles
// ---------------------------------------------------------------------------
static XPLMDataRef g_dr_latitude    = nullptr;  // sim/flightmodel/position/latitude
static XPLMDataRef g_dr_longitude   = nullptr;  // sim/flightmodel/position/longitude
static XPLMDataRef g_dr_elevation   = nullptr;  // sim/flightmodel/position/elevation (meters)
static XPLMDataRef g_dr_groundspeed = nullptr;  // sim/flightmodel/position/groundspeed (m/s)
static XPLMDataRef g_dr_true_psi    = nullptr;  // sim/flightmodel/position/true_psi (degrees)
static XPLMDataRef g_dr_vh_ind_fpm  = nullptr;  // sim/flightmodel/position/vh_ind_fpm (ft/min)
static XPLMDataRef g_dr_fuel_kg     = nullptr;  // sim/flightmodel/weight/m_fuel_total (kg)
static XPLMDataRef g_dr_n1_percent  = nullptr;  // sim/flightmodel2/engines/n1_percent (array)

// ---------------------------------------------------------------------------
// Timing
// ---------------------------------------------------------------------------
static float g_elapsed_since_send = 0.0f;

// ---------------------------------------------------------------------------
// Forward declarations
// ---------------------------------------------------------------------------
static float FlightLoopCallback(float inElapsedSinceLastCall,
                                float inElapsedTimeSinceLastFlightLoop,
                                int   inCounter,
                                void* inRefcon);
static void  LoadConfig();
static bool  HttpPost(const std::string& host, int port,
                      const std::string& path, const std::string& body);
static std::string BuildTelemetryJson();

// =============================================================================
// Plugin lifecycle
// =============================================================================

PLUGIN_API int XPluginStart(char* outName, char* outSig, char* outDesc)
{
    std::strncpy(outName, "HEMS Dispatch Telemetry", 256);
    std::strncpy(outSig,  "com.hemsdispatch.xplane.native", 256);
    std::strncpy(outDesc, "Sends simulator telemetry to the HEMS Local Bridge v2", 256);

    // Load configuration from hems_bridge.ini
    LoadConfig();

    // Resolve datarefs
    g_dr_latitude    = XPLMFindDataRef("sim/flightmodel/position/latitude");
    g_dr_longitude   = XPLMFindDataRef("sim/flightmodel/position/longitude");
    g_dr_elevation   = XPLMFindDataRef("sim/flightmodel/position/elevation");
    g_dr_groundspeed = XPLMFindDataRef("sim/flightmodel/position/groundspeed");
    g_dr_true_psi    = XPLMFindDataRef("sim/flightmodel/position/true_psi");
    g_dr_vh_ind_fpm  = XPLMFindDataRef("sim/flightmodel/position/vh_ind_fpm");
    g_dr_fuel_kg     = XPLMFindDataRef("sim/flightmodel/weight/m_fuel_total");
    g_dr_n1_percent  = XPLMFindDataRef("sim/flightmodel2/engines/n1_percent");

    if (!g_dr_latitude || !g_dr_longitude) {
        XPLMDebugString("[HEMS] ERROR: Could not find core position datarefs.\n");
    }

    return 1; // success
}

PLUGIN_API void XPluginStop()
{
    // Nothing to clean up
}

PLUGIN_API int XPluginEnable()
{
    // Register the flight loop callback — called every frame
    XPLMRegisterFlightLoopCallback(FlightLoopCallback, -1.0f, nullptr);
    XPLMDebugString("[HEMS] Plugin enabled. Telemetry streaming started.\n");
    return 1;
}

PLUGIN_API void XPluginDisable()
{
    XPLMUnregisterFlightLoopCallback(FlightLoopCallback, nullptr);
    XPLMDebugString("[HEMS] Plugin disabled. Telemetry streaming stopped.\n");
}

PLUGIN_API void XPluginReceiveMessage(XPLMPluginID inFrom, int inMsg, void* inParam)
{
    // No inter-plugin messages handled
    (void)inFrom; (void)inMsg; (void)inParam;
}

// =============================================================================
// Flight loop — throttled to configured Hz (default 1 Hz)
// =============================================================================

static float FlightLoopCallback(float inElapsedSinceLastCall,
                                float /*inElapsedTimeSinceLastFlightLoop*/,
                                int   /*inCounter*/,
                                void* /*inRefcon*/)
{
    g_elapsed_since_send += inElapsedSinceLastCall;

    float interval = 1.0f / static_cast<float>(g_config.send_rate_hz);
    if (g_elapsed_since_send < interval) {
        return -1.0f; // call again next frame
    }
    g_elapsed_since_send = 0.0f;

    // Build and send telemetry
    std::string json = BuildTelemetryJson();
    if (!HttpPost(g_config.host, g_config.port, g_config.path, json)) {
        // Silently fail — bridge may not be running. Log once per minute at most.
        static int fail_count = 0;
        if (++fail_count % 60 == 1) {
            XPLMDebugString("[HEMS] WARNING: Could not reach bridge at ");
            XPLMDebugString((g_config.host + ":" + std::to_string(g_config.port) + "\n").c_str());
        }
    }

    return -1.0f; // call again next frame
}

// =============================================================================
// Build telemetry JSON payload
// =============================================================================

static std::string BuildTelemetryJson()
{
    // Read raw values from datarefs
    double latitude    = g_dr_latitude    ? XPLMGetDatad(g_dr_latitude)    : 0.0;
    double longitude   = g_dr_longitude   ? XPLMGetDatad(g_dr_longitude)   : 0.0;
    double elevation_m = g_dr_elevation   ? XPLMGetDatad(g_dr_elevation)   : 0.0;
    float  gs_ms       = g_dr_groundspeed ? XPLMGetDataf(g_dr_groundspeed) : 0.0f;
    float  heading     = g_dr_true_psi    ? XPLMGetDataf(g_dr_true_psi)    : 0.0f;
    float  vs_fpm      = g_dr_vh_ind_fpm  ? XPLMGetDataf(g_dr_vh_ind_fpm)  : 0.0f;
    float  fuel_kg     = g_dr_fuel_kg     ? XPLMGetDataf(g_dr_fuel_kg)     : 0.0f;

    // N1 is an array dataref — read first engine
    float n1 = 0.0f;
    if (g_dr_n1_percent) {
        float n1_arr[8] = {};
        XPLMGetDatavf(g_dr_n1_percent, n1_arr, 0, 1);
        n1 = n1_arr[0];
    }

    // Unit conversions (Req 10.4)
    double altitude_ft     = elevation_m * METERS_TO_FEET;
    double groundspeed_kts = static_cast<double>(gs_ms) * MS_TO_KNOTS;
    double fuel_lbs        = static_cast<double>(fuel_kg) * KG_TO_LBS;

    // Engine status
    const char* engine_status = (n1 > N1_RUNNING_THRESHOLD) ? "Running" : "Shutdown";

    // Build JSON string manually (no external JSON library needed)
    char buf[1024];
    std::snprintf(buf, sizeof(buf),
        "{"
        "\"latitude\":%.7f,"
        "\"longitude\":%.7f,"
        "\"altitudeFt\":%d,"
        "\"groundSpeedKts\":%d,"
        "\"headingDeg\":%d,"
        "\"verticalSpeedFtMin\":%d,"
        "\"fuelRemainingLbs\":%d,"
        "\"engineStatus\":\"%s\""
        "}",
        latitude,
        longitude,
        static_cast<int>(std::round(altitude_ft)),
        static_cast<int>(std::round(groundspeed_kts)),
        static_cast<int>(std::round(heading)),
        static_cast<int>(std::round(vs_fpm)),
        static_cast<int>(std::round(fuel_lbs)),
        engine_status
    );

    return std::string(buf);
}

// =============================================================================
// Configuration loader — reads hems_bridge.ini next to the plugin .xpl
// =============================================================================

static void LoadConfig()
{
    // Try to find the config file relative to the plugin directory.
    // X-Plane plugins live in: Resources/plugins/<name>/64/<platform>.xpl
    // Config is at:            Resources/plugins/<name>/hems_bridge.ini
    char plugin_path[512] = {};
    XPLMGetPluginInfo(XPLMGetMyID(), nullptr, plugin_path, nullptr, nullptr);

    // Walk up from .../64/win.xpl to .../hems_bridge.ini
    std::string path(plugin_path);
    // Remove filename
    auto last_sep = path.find_last_of("/\\");
    if (last_sep != std::string::npos) path = path.substr(0, last_sep);
    // Go up one directory (out of 64/)
    last_sep = path.find_last_of("/\\");
    if (last_sep != std::string::npos) path = path.substr(0, last_sep);

    std::string ini_path = path + "/hems_bridge.ini";

    std::ifstream file(ini_path);
    if (!file.is_open()) {
        XPLMDebugString("[HEMS] Config not found, using defaults: ");
        XPLMDebugString((ini_path + "\n").c_str());
        return;
    }

    XPLMDebugString("[HEMS] Loading config from: ");
    XPLMDebugString((ini_path + "\n").c_str());

    std::string line;
    while (std::getline(file, line)) {
        // Skip comments and empty lines
        if (line.empty() || line[0] == '#' || line[0] == '[') continue;

        auto eq = line.find('=');
        if (eq == std::string::npos) continue;

        std::string key = line.substr(0, eq);
        std::string val = line.substr(eq + 1);

        // Trim whitespace
        while (!key.empty() && key.back() == ' ') key.pop_back();
        while (!val.empty() && val.front() == ' ') val.erase(val.begin());

        if (key == "host")          g_config.host = val;
        else if (key == "port")     g_config.port = std::stoi(val);
        else if (key == "path")     g_config.path = val;
        else if (key == "send_rate_hz") g_config.send_rate_hz = std::stoi(val);
    }

    char msg[256];
    std::snprintf(msg, sizeof(msg), "[HEMS] Bridge target: %s:%d%s @ %dHz\n",
                  g_config.host.c_str(), g_config.port, g_config.path.c_str(),
                  g_config.send_rate_hz);
    XPLMDebugString(msg);
}


// =============================================================================
// HTTP POST — platform-specific implementations
// =============================================================================

#if IBM // Windows — WinHTTP

static bool HttpPost(const std::string& host, int port,
                     const std::string& path, const std::string& body)
{
    HINTERNET hSession = WinHttpOpen(L"HEMS-XPlane/1.0",
                                     WINHTTP_ACCESS_TYPE_DEFAULT_PROXY,
                                     WINHTTP_NO_PROXY_NAME,
                                     WINHTTP_NO_PROXY_BYPASS, 0);
    if (!hSession) return false;

    // Set timeouts: resolve=2s, connect=2s, send=2s, receive=2s
    WinHttpSetTimeouts(hSession, 2000, 2000, 2000, 2000);

    // Convert host to wide string
    int wlen = MultiByteToWideChar(CP_UTF8, 0, host.c_str(), -1, nullptr, 0);
    std::wstring whost(wlen, L'\0');
    MultiByteToWideChar(CP_UTF8, 0, host.c_str(), -1, &whost[0], wlen);

    HINTERNET hConnect = WinHttpConnect(hSession, whost.c_str(),
                                        static_cast<INTERNET_PORT>(port), 0);
    if (!hConnect) { WinHttpCloseHandle(hSession); return false; }

    // Convert path to wide string
    wlen = MultiByteToWideChar(CP_UTF8, 0, path.c_str(), -1, nullptr, 0);
    std::wstring wpath(wlen, L'\0');
    MultiByteToWideChar(CP_UTF8, 0, path.c_str(), -1, &wpath[0], wlen);

    HINTERNET hRequest = WinHttpOpenRequest(hConnect, L"POST", wpath.c_str(),
                                            nullptr, WINHTTP_NO_REFERER,
                                            WINHTTP_DEFAULT_ACCEPT_TYPES, 0);
    if (!hRequest) {
        WinHttpCloseHandle(hConnect);
        WinHttpCloseHandle(hSession);
        return false;
    }

    const wchar_t* headers = L"Content-Type: application/json\r\n";
    BOOL result = WinHttpSendRequest(hRequest, headers, -1L,
                                     (LPVOID)body.c_str(),
                                     static_cast<DWORD>(body.size()),
                                     static_cast<DWORD>(body.size()), 0);

    if (result) {
        WinHttpReceiveResponse(hRequest, nullptr);
    }

    WinHttpCloseHandle(hRequest);
    WinHttpCloseHandle(hConnect);
    WinHttpCloseHandle(hSession);
    return result != FALSE;
}

#elif APL // macOS — CFNetwork

static bool HttpPost(const std::string& host, int port,
                     const std::string& path, const std::string& body)
{
    std::string url = "http://" + host + ":" + std::to_string(port) + path;

    CFStringRef urlStr = CFStringCreateWithCString(kCFAllocatorDefault,
                                                   url.c_str(),
                                                   kCFStringEncodingUTF8);
    CFURLRef cfUrl = CFURLCreateWithString(kCFAllocatorDefault, urlStr, nullptr);
    CFRelease(urlStr);
    if (!cfUrl) return false;

    CFStringRef method = CFSTR("POST");
    CFHTTPMessageRef request = CFHTTPMessageCreateRequest(kCFAllocatorDefault,
                                                          method, cfUrl,
                                                          kCFHTTPVersion1_1);
    CFRelease(cfUrl);
    if (!request) return false;

    CFDataRef bodyData = CFDataCreate(kCFAllocatorDefault,
                                      reinterpret_cast<const UInt8*>(body.c_str()),
                                      static_cast<CFIndex>(body.size()));
    CFHTTPMessageSetBody(request, bodyData);
    CFRelease(bodyData);

    CFHTTPMessageSetHeaderFieldValue(request,
                                     CFSTR("Content-Type"),
                                     CFSTR("application/json"));

    CFReadStreamRef stream = CFReadStreamCreateForHTTPRequest(kCFAllocatorDefault,
                                                              request);
    CFRelease(request);
    if (!stream) return false;

    bool ok = CFReadStreamOpen(stream);
    if (ok) {
        // Read a small response to complete the request
        UInt8 buf[256];
        CFReadStreamRead(stream, buf, sizeof(buf));
    }
    CFReadStreamClose(stream);
    CFRelease(stream);
    return ok;
}

#else // Linux — raw sockets

static bool HttpPost(const std::string& host, int port,
                     const std::string& path, const std::string& body)
{
    struct addrinfo hints = {}, *res = nullptr;
    hints.ai_family = AF_INET;
    hints.ai_socktype = SOCK_STREAM;

    std::string port_str = std::to_string(port);
    if (getaddrinfo(host.c_str(), port_str.c_str(), &hints, &res) != 0) {
        return false;
    }

    int sock = socket(res->ai_family, res->ai_socktype, res->ai_protocol);
    if (sock < 0) { freeaddrinfo(res); return false; }

    // Set socket timeout to 2 seconds
    struct timeval tv;
    tv.tv_sec = 2;
    tv.tv_usec = 0;
    setsockopt(sock, SOL_SOCKET, SO_SNDTIMEO, &tv, sizeof(tv));
    setsockopt(sock, SOL_SOCKET, SO_RCVTIMEO, &tv, sizeof(tv));

    if (connect(sock, res->ai_addr, res->ai_addrlen) < 0) {
        close(sock);
        freeaddrinfo(res);
        return false;
    }
    freeaddrinfo(res);

    // Build HTTP request
    std::ostringstream req;
    req << "POST " << path << " HTTP/1.1\r\n"
        << "Host: " << host << ":" << port << "\r\n"
        << "Content-Type: application/json\r\n"
        << "Content-Length: " << body.size() << "\r\n"
        << "Connection: close\r\n"
        << "\r\n"
        << body;

    std::string request = req.str();
    send(sock, request.c_str(), request.size(), 0);

    // Read response (we don't need it, just drain)
    char buf[256];
    recv(sock, buf, sizeof(buf), 0);

    close(sock);
    return true;
}

#endif
