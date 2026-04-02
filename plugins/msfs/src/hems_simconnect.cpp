// =============================================================================
// HEMS Dispatch — MSFS SimConnect Plugin
// =============================================================================
// Connects to MSFS via SimConnect, reads SimVars, and POSTs telemetry JSON
// to the Local Bridge v2 at a configurable host:port, throttled to 1 Hz.
//
// Requirements: 11.1, 11.2, 11.3, 11.4, 11.5
//
// Build (Windows only — SimConnect is Windows-only):
//   mkdir build && cd build
//   cmake -G "Visual Studio 17 2022" -A x64 ^
//         -DSIMCONNECT_SDK_PATH="C:\MSFS SDK\SimConnect SDK" ..
//   cmake --build . --config Release
// =============================================================================

#define WIN32_LEAN_AND_MEAN
#define NOMINMAX
#include <windows.h>
#include <winhttp.h>
#include <SimConnect.h>

#include <cstdio>
#include <cstring>
#include <cmath>
#include <string>
#include <fstream>
#include <sstream>
#include <chrono>
#include <thread>

#pragma comment(lib, "winhttp.lib")

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
// SimConnect data definition
// ---------------------------------------------------------------------------
enum DATA_DEFINE_ID {
    DEFINITION_TELEMETRY = 0
};

enum DATA_REQUEST_ID {
    REQUEST_TELEMETRY = 0
};

// Struct matching the SimConnect data definition — order must match AddToDataDefinition calls
struct SimTelemetry {
    double latitude;          // PLANE LATITUDE          (degrees)
    double longitude;         // PLANE LONGITUDE         (degrees)
    double altitude_ft;       // PLANE ALTITUDE          (feet)
    double ground_speed_kts;  // GROUND VELOCITY         (knots)
    double heading_deg;       // HEADING INDICATOR       (degrees)
    double vertical_speed;    // VERTICAL SPEED          (ft/min)
    double fuel_total_gal;    // FUEL TOTAL QUANTITY     (gallons)
    double eng_n1;            // ENG N1 RPM:1            (percent)
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
static constexpr double GALLONS_TO_LBS = 6.7;  // Jet-A approx density
static constexpr double N1_RUNNING_THRESHOLD = 20.0;

// ---------------------------------------------------------------------------
// Globals
// ---------------------------------------------------------------------------
static HANDLE g_hSimConnect = nullptr;
static bool   g_connected   = false;
static bool   g_quit        = false;

static SimTelemetry g_latest_telemetry = {};
static bool         g_telemetry_ready  = false;

// ---------------------------------------------------------------------------
// Forward declarations
// ---------------------------------------------------------------------------
static void CALLBACK SimConnectDispatchProc(SIMCONNECT_RECV* pData, DWORD cbData, void* pContext);
static void LoadConfig(const std::string& exe_dir);
static bool HttpPost(const std::string& host, int port,
                     const std::string& path, const std::string& body);
static std::string BuildTelemetryJson(const SimTelemetry& t);
static std::string GetExeDirectory();

// =============================================================================
// Main entry point
// =============================================================================

int main()
{
    printf("=== HEMS Dispatch — MSFS SimConnect Plugin ===\n");
    printf("Connecting to MSFS...\n\n");

    // Load config from same directory as the exe
    std::string exe_dir = GetExeDirectory();
    LoadConfig(exe_dir);

    printf("Bridge target: %s:%d%s @ %dHz\n",
           g_config.host.c_str(), g_config.port,
           g_config.path.c_str(), g_config.send_rate_hz);

    // Attempt to connect to SimConnect
    HRESULT hr = SimConnect_Open(&g_hSimConnect, "HEMS Dispatch", nullptr, 0, 0, 0);
    if (FAILED(hr)) {
        printf("ERROR: Could not connect to MSFS. Is the simulator running?\n");
        printf("Press Enter to exit...\n");
        getchar();
        return 1;
    }

    printf("Connected to MSFS via SimConnect.\n");
    g_connected = true;

    // Register data definition for telemetry SimVars (Req 11.2)
    SimConnect_AddToDataDefinition(g_hSimConnect, DEFINITION_TELEMETRY,
        "PLANE LATITUDE", "degrees", SIMCONNECT_DATATYPE_FLOAT64);
    SimConnect_AddToDataDefinition(g_hSimConnect, DEFINITION_TELEMETRY,
        "PLANE LONGITUDE", "degrees", SIMCONNECT_DATATYPE_FLOAT64);
    SimConnect_AddToDataDefinition(g_hSimConnect, DEFINITION_TELEMETRY,
        "PLANE ALTITUDE", "feet", SIMCONNECT_DATATYPE_FLOAT64);
    SimConnect_AddToDataDefinition(g_hSimConnect, DEFINITION_TELEMETRY,
        "GROUND VELOCITY", "knots", SIMCONNECT_DATATYPE_FLOAT64);
    SimConnect_AddToDataDefinition(g_hSimConnect, DEFINITION_TELEMETRY,
        "HEADING INDICATOR", "degrees", SIMCONNECT_DATATYPE_FLOAT64);
    SimConnect_AddToDataDefinition(g_hSimConnect, DEFINITION_TELEMETRY,
        "VERTICAL SPEED", "feet per minute", SIMCONNECT_DATATYPE_FLOAT64);
    SimConnect_AddToDataDefinition(g_hSimConnect, DEFINITION_TELEMETRY,
        "FUEL TOTAL QUANTITY", "gallons", SIMCONNECT_DATATYPE_FLOAT64);
    SimConnect_AddToDataDefinition(g_hSimConnect, DEFINITION_TELEMETRY,
        "ENG N1 RPM:1", "percent", SIMCONNECT_DATATYPE_FLOAT64);

    // Request telemetry data every sim frame
    SimConnect_RequestDataOnSimObject(g_hSimConnect, REQUEST_TELEMETRY,
        DEFINITION_TELEMETRY, SIMCONNECT_OBJECT_ID_USER,
        SIMCONNECT_PERIOD_SIM_FRAME, 0, 0, 0, 0);

    printf("Telemetry streaming started. Press Ctrl+C to stop.\n\n");

    // Set up console Ctrl+C handler
    SetConsoleCtrlHandler([](DWORD type) -> BOOL {
        if (type == CTRL_C_EVENT || type == CTRL_CLOSE_EVENT) {
            g_quit = true;
            return TRUE;
        }
        return FALSE;
    }, TRUE);

    // Main loop — dispatch SimConnect messages and send telemetry at configured Hz
    auto last_send = std::chrono::steady_clock::now();
    int send_interval_ms = 1000 / g_config.send_rate_hz;

    while (!g_quit) {
        // Process SimConnect messages (non-blocking)
        SimConnect_CallDispatch(g_hSimConnect, SimConnectDispatchProc, nullptr);

        auto now = std::chrono::steady_clock::now();
        auto elapsed = std::chrono::duration_cast<std::chrono::milliseconds>(now - last_send);

        if (g_telemetry_ready && elapsed.count() >= send_interval_ms) {
            last_send = now;

            std::string json = BuildTelemetryJson(g_latest_telemetry);
            if (!HttpPost(g_config.host, g_config.port, g_config.path, json)) {
                static int fail_count = 0;
                if (++fail_count % 60 == 1) {
                    printf("WARNING: Could not reach bridge at %s:%d\n",
                           g_config.host.c_str(), g_config.port);
                }
            }
        }

        // Sleep briefly to avoid busy-waiting (~60Hz poll)
        std::this_thread::sleep_for(std::chrono::milliseconds(16));
    }

    // Cleanup
    printf("\nDisconnecting from MSFS...\n");
    SimConnect_Close(g_hSimConnect);
    printf("Done.\n");
    return 0;
}

// =============================================================================
// SimConnect dispatch callback — receives data from the sim
// =============================================================================

static void CALLBACK SimConnectDispatchProc(SIMCONNECT_RECV* pData, DWORD cbData, void* pContext)
{
    (void)cbData; (void)pContext;

    switch (pData->dwID) {
    case SIMCONNECT_RECV_ID_SIMOBJECT_DATA: {
        auto* pObjData = static_cast<SIMCONNECT_RECV_SIMOBJECT_DATA*>(pData);
        if (pObjData->dwRequestID == REQUEST_TELEMETRY) {
            auto* telemetry = reinterpret_cast<SimTelemetry*>(&pObjData->dwData);
            g_latest_telemetry = *telemetry;
            g_telemetry_ready = true;
        }
        break;
    }
    case SIMCONNECT_RECV_ID_QUIT:
        printf("MSFS is shutting down.\n");
        g_quit = true;
        break;
    case SIMCONNECT_RECV_ID_EXCEPTION: {
        auto* pExc = static_cast<SIMCONNECT_RECV_EXCEPTION*>(pData);
        printf("SimConnect exception: %lu\n", pExc->dwException);
        break;
    }
    default:
        break;
    }
}

// =============================================================================
// Build telemetry JSON payload (matches TelemetryData interface)
// =============================================================================

static std::string BuildTelemetryJson(const SimTelemetry& t)
{
    // MSFS SimVars already return altitude in feet, speed in knots, VS in ft/min.
    // Only fuel needs conversion: gallons → lbs (Jet-A ~6.7 lbs/gal)
    double fuel_lbs = t.fuel_total_gal * GALLONS_TO_LBS;

    const char* engine_status = (t.eng_n1 > N1_RUNNING_THRESHOLD) ? "Running" : "Shutdown";

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
        t.latitude,
        t.longitude,
        static_cast<int>(std::round(t.altitude_ft)),
        static_cast<int>(std::round(t.ground_speed_kts)),
        static_cast<int>(std::round(t.heading_deg)),
        static_cast<int>(std::round(t.vertical_speed)),
        static_cast<int>(std::round(fuel_lbs)),
        engine_status
    );

    return std::string(buf);
}


// =============================================================================
// Configuration loader — reads hems_bridge.ini next to the exe
// =============================================================================

static void LoadConfig(const std::string& exe_dir)
{
    std::string ini_path = exe_dir + "\\hems_bridge.ini";

    std::ifstream file(ini_path);
    if (!file.is_open()) {
        printf("Config not found at %s, using defaults.\n", ini_path.c_str());
        return;
    }

    printf("Loading config from: %s\n", ini_path.c_str());

    std::string line;
    while (std::getline(file, line)) {
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
}

// =============================================================================
// Get directory of the running executable
// =============================================================================

static std::string GetExeDirectory()
{
    char path[MAX_PATH] = {};
    GetModuleFileNameA(nullptr, path, MAX_PATH);
    std::string s(path);
    auto pos = s.find_last_of("\\/");
    return (pos != std::string::npos) ? s.substr(0, pos) : ".";
}

// =============================================================================
// HTTP POST via WinHTTP (Windows only)
// =============================================================================

static bool HttpPost(const std::string& host, int port,
                     const std::string& path, const std::string& body)
{
    HINTERNET hSession = WinHttpOpen(L"HEMS-MSFS/1.0",
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
