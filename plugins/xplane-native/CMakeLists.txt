cmake_minimum_required(VERSION 3.16)
project(hems_xplane_plugin VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# ==============================================================================
# X-Plane SDK Setup
# ==============================================================================
# Download the X-Plane SDK 4.0 from:
#   https://developer.x-plane.com/sdk/plugin-sdk-downloads/
#
# Extract it and set XPLANE_SDK_PATH to the root of the extracted SDK folder.
# The SDK should contain: CHeaders/, Libraries/, etc.
#
# Example:
#   cmake -DXPLANE_SDK_PATH=/path/to/SDK ..
# ==============================================================================
if(NOT DEFINED XPLANE_SDK_PATH)
    set(XPLANE_SDK_PATH "${CMAKE_SOURCE_DIR}/SDK" CACHE PATH "Path to X-Plane SDK 4.0")
endif()

if(NOT EXISTS "${XPLANE_SDK_PATH}/CHeaders/XPLM/XPLMPlugin.h")
    message(WARNING
        "X-Plane SDK not found at ${XPLANE_SDK_PATH}. "
        "Download from https://developer.x-plane.com/sdk/plugin-sdk-downloads/ "
        "and set -DXPLANE_SDK_PATH=<path>")
endif()

# Plugin source
add_library(hems_xplane_plugin SHARED
    src/hems_plugin.cpp
)

target_include_directories(hems_xplane_plugin PRIVATE
    ${XPLANE_SDK_PATH}/CHeaders/XPLM
    ${XPLANE_SDK_PATH}/CHeaders/Widgets
    ${XPLANE_SDK_PATH}/CHeaders/Wrappers
)

# X-Plane plugin definitions
target_compile_definitions(hems_xplane_plugin PRIVATE
    XPLM200=1
    XPLM210=1
    XPLM300=1
    XPLM301=1
    XPLM400=1
    IBM=$<BOOL:${WIN32}>
    APL=$<BOOL:${APPLE}>
    LIN=$<AND:$<NOT:$<BOOL:${WIN32}>>,$<NOT:$<BOOL:${APPLE}>>>
)

# Platform-specific settings
if(WIN32)
    target_link_libraries(hems_xplane_plugin PRIVATE
        ${XPLANE_SDK_PATH}/Libraries/Win/XPLM_64.lib
        winhttp
    )
    set_target_properties(hems_xplane_plugin PROPERTIES
        OUTPUT_NAME "hems_dispatch"
        SUFFIX ".xpl"
        PREFIX ""
    )
elseif(APPLE)
    find_library(XPLM_LIBRARY XPLM ${XPLANE_SDK_PATH}/Libraries/Mac)
    target_link_libraries(hems_xplane_plugin PRIVATE
        ${XPLM_LIBRARY}
        "-framework CoreFoundation"
        "-framework CFNetwork"
    )
    set_target_properties(hems_xplane_plugin PROPERTIES
        OUTPUT_NAME "hems_dispatch"
        SUFFIX ".xpl"
        PREFIX ""
        LINK_FLAGS "-flat_namespace -undefined suppress"
    )
elseif(UNIX)
    set_target_properties(hems_xplane_plugin PROPERTIES
        OUTPUT_NAME "hems_dispatch"
        SUFFIX ".xpl"
        PREFIX ""
        LINK_FLAGS "-rdynamic -nodefaultlibs -undefined_warning"
    )
endif()

# Install target — copies the .xpl into a folder structure X-Plane expects:
#   <X-Plane>/Resources/plugins/hems_dispatch/
#       64/
#           win.xpl  |  mac.xpl  |  lin.xpl
#       hems_bridge.ini
install(TARGETS hems_xplane_plugin
    LIBRARY DESTINATION hems_dispatch/64
    RUNTIME DESTINATION hems_dispatch/64
)
install(FILES ${CMAKE_SOURCE_DIR}/hems_bridge.ini
    DESTINATION hems_dispatch
)
