-- HEMS TACTICAL UPLINK v5.4 (Debug Edition)
-- Requirement: FlyWithLua
-- Location: X-Plane/Resources/plugins/FlyWithLua/Scripts/

local socket = require("socket")

-- CONFIGURATION
local HOST = "127.0.0.1"
local PORT = 8080
local UPDATE_INTERVAL = 1.0 -- Packet every second
local last_run = 0

-- DATAREFS
dataref("alt_msl", "sim/flightmodel/position/elevation")
dataref("gs_ms", "sim/flightmodel/position/groundspeed")
dataref("hdg_true", "sim/flightmodel/position/true_psi")
dataref("lat", "sim/flightmodel/position/latitude")
dataref("lon", "sim/flightmodel/position/longitude")
dataref("fuel_kg", "sim/flightmodel/weight/m_fuel_total")

function send_hems_telemetry()
    local now = os.clock()
    if now - last_run < UPDATE_INTERVAL then return end
    last_run = now

    local payload = string.format(
        '{"latitude":%f,"longitude":%f,"altitudeFt":%d,"groundSpeedKts":%d,"headingDeg":%d,"fuelRemainingLbs":%d}',
        lat, lon, math.floor(alt_msl * 3.28084), math.floor(gs_ms * 1.94384), math.floor(hdg_true), math.floor(fuel_kg * 2.20462)
    )

    local tcp = socket.tcp()
    tcp:settimeout(0.05)
    
    local success, err = tcp:connect(HOST, PORT)
    
    if success then
        local http_request = 
            "POST /telemetry HTTP/1.1\r\n" ..
            "Host: " .. HOST .. "\r\n" ..
            "Content-Type: application/json\r\n" ..
            "Content-Length: " .. #payload .. "\r\n" ..
            "Connection: close\r\n\r\n" ..
            payload
        
        tcp:send(http_request)
        tcp:close()
        -- Uncomment below to see logs in X-Plane Dev Console
        -- logMsg("HEMS: Uplink OK")
    else
        -- If it fails, we print to the console
        logMsg("HEMS UPLINK ERROR: " .. tostring(err))
    end
end

do_often("send_hems_telemetry()")