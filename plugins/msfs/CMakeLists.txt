cmake_minimum_required(VERSION 3.16)
project(hems_msfs_plugin VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# ==============================================================================
# MSFS SDK / SimConnect Setup
# ==============================================================================
# The MSFS SDK includes the SimConnect library. You can get it from:
#   - MSFS SDK installed via the Dev Mode in MSFS 2020/2024
#   - Default location: C:\MSFS SDK\SimConnect SDK
#   - Or download from: https://docs.flightsimulator.com/html/index.htm
#
# Set SIMCONNECT_SDK_PATH to the SimConnect SDK root folder.
# It should contain: include/SimConnect.h and lib/SimConnect.lib
#
# Example:
#   cmake -DSIMCONNECT_SDK_PATH="C:/MSFS SDK/SimConnect SDK" ..
# ==============================================================================
if(NOT DEFINED SIMCONNECT_SDK_PATH)
    set(SIMCONNECT_SDK_PATH "${CMAKE_SOURCE_DIR}/SimConnect SDK" CACHE PATH
        "Path to MSFS SimConnect SDK")
endif()

if(NOT EXISTS "${SIMCONNECT_SDK_PATH}/include/SimConnect.h")
    message(WARNING
        "SimConnect SDK not found at ${SIMCONNECT_SDK_PATH}. "
        "Install the MSFS SDK via Dev Mode in the simulator, then set "
        "-DSIMCONNECT_SDK_PATH=\"C:/MSFS SDK/SimConnect SDK\"")
endif()

# Plugin executable (Windows console app that connects to MSFS via SimConnect)
add_executable(hems_msfs_plugin
    src/hems_simconnect.cpp
)

target_include_directories(hems_msfs_plugin PRIVATE
    ${SIMCONNECT_SDK_PATH}/include
)

target_link_libraries(hems_msfs_plugin PRIVATE
    ${SIMCONNECT_SDK_PATH}/lib/SimConnect.lib
    winhttp
)

target_compile_definitions(hems_msfs_plugin PRIVATE
    _WIN32_WINNT=0x0A00
    WIN32_LEAN_AND_MEAN
    NOMINMAX
)

set_target_properties(hems_msfs_plugin PROPERTIES
    OUTPUT_NAME "HEMS_Dispatch_MSFS"
    RUNTIME_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/bin"
)

# Install into a community folder addon structure:
#   hems-dispatch/
#       HEMS_Dispatch_MSFS.exe
#       hems_bridge.ini
#       manifest.json
#       layout.json
install(TARGETS hems_msfs_plugin RUNTIME DESTINATION hems-dispatch)
install(FILES
    ${CMAKE_SOURCE_DIR}/hems_bridge.ini
    ${CMAKE_SOURCE_DIR}/manifest.json
    ${CMAKE_SOURCE_DIR}/layout.json
    DESTINATION hems-dispatch
)
