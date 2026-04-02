# HEMS Dispatch — MSFS SimConnect Plugin

Windows application that connects to Microsoft Flight Simulator via SimConnect, reads SimVars, and sends telemetry to the HEMS Local Bridge v2.

## Prerequisites

- Windows 10/11 (SimConnect is Windows-only)
- CMake 3.16+
- Visual Studio 2019+ (MSVC C++17)
- MSFS SDK with SimConnect — install via Dev Mode in MSFS 2020/2024
  - Default path: `C:\MSFS SDK\SimConnect SDK`
  - Docs: https://docs.flightsimulator.com/html/index.htm

## Build

```bash
mkdir build && cd build
cmake -G "Visual Studio 17 2022" -A x64 ^
      -DSIMCONNECT_SDK_PATH="C:\MSFS SDK\SimConnect SDK" ..
cmake --build . --config Release
```

The output binary is at `build/bin/Release/HEMS_Dispatch_MSFS.exe`.

## Install as Community Folder Addon

Copy the following structure into your MSFS Community folder:

```
Community/
└── hems-dispatch/
    ├── HEMS_Dispatch_MSFS.exe
    ├── hems_bridge.ini
    ├── manifest.json
    └── layout.json
```

Or use CMake install:

```bash
cmake --install . --prefix "C:\Users\<you>\AppData\Local\Packages\...\Community"
```

## Usage

1. Start MSFS and load into a flight
2. Start the Local Bridge v2 (`localhost:8080`)
3. Run `HEMS_Dispatch_MSFS.exe` — it connects to MSFS automatically
4. Telemetry streams to the bridge at 1Hz

Press `Ctrl+C` to stop the plugin.

## Configuration

Edit `hems_bridge.ini` to change the bridge connection:

```ini
[bridge]
host=localhost
port=8080
path=/telemetry
send_rate_hz=1
```

## SimVars Read

| SimVar | Unit | Notes |
|---|---|---|
| `PLANE LATITUDE` | degrees | Direct from sim |
| `PLANE LONGITUDE` | degrees | Direct from sim |
| `PLANE ALTITUDE` | feet | Already in feet |
| `GROUND VELOCITY` | knots | Already in knots |
| `HEADING INDICATOR` | degrees | Magnetic heading |
| `VERTICAL SPEED` | ft/min | Already in ft/min |
| `FUEL TOTAL QUANTITY` | gallons | Converted to lbs (×6.7) |
| `ENG N1 RPM:1` | percent | Used for engine status |

## Telemetry Payload

The plugin POSTs JSON to the bridge at the configured rate (default 1Hz):

```json
{
  "latitude": 40.4406,
  "longitude": -79.9959,
  "altitudeFt": 2500,
  "groundSpeedKts": 120,
  "headingDeg": 270,
  "verticalSpeedFtMin": 500,
  "fuelRemainingLbs": 1200,
  "engineStatus": "Running"
}
```

Engine status is `"Running"` when N1 > 20%, otherwise `"Shutdown"`.
