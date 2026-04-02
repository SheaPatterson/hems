# HEMS Dispatch — X-Plane Native Plugin

Native C++ plugin for X-Plane 11/12 that reads simulator datarefs and sends telemetry to the HEMS Local Bridge v2.

Replaces the legacy Lua script (`hems-dispatch-xp.lua`) with a compiled plugin for better performance and reliability.

## Prerequisites

- CMake 3.16+
- C++17 compiler (MSVC 2019+, Clang 12+, GCC 9+)
- X-Plane SDK 4.0 — download from https://developer.x-plane.com/sdk/plugin-sdk-downloads/

## Build

```bash
# Clone or download the X-Plane SDK and note the path
# e.g. ~/XPSDK400

mkdir build && cd build
cmake -DXPLANE_SDK_PATH=/path/to/XPSDK400 ..
cmake --build . --config Release
```

### Windows (Visual Studio)

```bash
mkdir build && cd build
cmake -G "Visual Studio 17 2022" -A x64 -DXPLANE_SDK_PATH=C:\XPSDK400 ..
cmake --build . --config Release
```

### macOS

```bash
mkdir build && cd build
cmake -DXPLANE_SDK_PATH=~/XPSDK400 ..
cmake --build . --config Release
```

## Install

Copy the built plugin into your X-Plane plugins folder:

```
<X-Plane>/Resources/plugins/hems_dispatch/
├── 64/
│   └── hems_dispatch.xpl    # The compiled plugin
└── hems_bridge.ini           # Bridge connection config
```

Or use CMake install:

```bash
cmake --install . --prefix /path/to/X-Plane/Resources/plugins
```

## Configuration

Edit `hems_bridge.ini` to change the bridge connection:

```ini
[bridge]
host=localhost
port=8080
path=/telemetry
send_rate_hz=1
```

## Datarefs Read

| Dataref | Unit | Converted To |
|---|---|---|
| `sim/flightmodel/position/latitude` | degrees | degrees |
| `sim/flightmodel/position/longitude` | degrees | degrees |
| `sim/flightmodel/position/elevation` | meters | feet |
| `sim/flightmodel/position/groundspeed` | m/s | knots |
| `sim/flightmodel/position/true_psi` | degrees | degrees |
| `sim/flightmodel/position/vh_ind_fpm` | ft/min | ft/min |
| `sim/flightmodel/weight/m_fuel_total` | kg | lbs |
| `sim/flightmodel2/engines/n1_percent[0]` | % | engine status |

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
