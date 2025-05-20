# https://stackoverflow.com/questions/45933732/how-to-specify-a-compiler-in-cmake
if(CMAKE_SYSTEM_NAME STREQUAL "Darwin")
  set(CMAKE_C_COMPILER /Library/Developer/CommandLineTools/usr/bin/clang)
  set(CMAKE_CXX_COMPILER /Library/Developer/CommandLineTools/usr/bin/clang++)
elseif(CMAKE_SYSTEM_NAME STREQUAL "Linux")
  set(CMAKE_C_COMPILER /usr/bin/clang)
  set(CMAKE_CXX_COMPILER /usr/bin/clang++)
endif()

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_VERBOSE_MAKEFILE ON)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)
set(CMAKE_BUILD_TYPE Debug)

cmake_minimum_required(VERSION 3.0.0)
project(harper VERSION 0.1.0)

# ## Require out-of-source builds
file(TO_CMAKE_PATH ${PROJECT_BINARY_DIR}/CMakeLists.txt LOC_PATH)

if(EXISTS ${LOC_PATH})
  message(FATAL_ERROR "You cannot build in a source directory.")
endif()

# Specify the template directory
set(TEMPLATE_DIR ${CMAKE_CURRENT_SOURCE_DIR}/src/templates)
set(STATIC_DIR ${CMAKE_CURRENT_SOURCE_DIR}/src/static)

# Find all template files
file(GLOB TEMPLATE_FILES ${TEMPLATE_DIR}/*.html)
file(GLOB STATIC_FILES ${STATIC_DIR}/*)

# Create custom targets for templates and static files
add_custom_target(templates ALL
    COMMAND ${CMAKE_COMMAND} -E make_directory ${CMAKE_CURRENT_BINARY_DIR}/src/templates
    COMMAND ${CMAKE_COMMAND} -E copy_directory ${TEMPLATE_DIR} ${CMAKE_CURRENT_BINARY_DIR}/src/templates
    DEPENDS ${TEMPLATE_FILES}
    COMMENT "Copying template files to build directory"
)

add_custom_target(static ALL
    COMMAND ${CMAKE_COMMAND} -E make_directory ${CMAKE_CURRENT_BINARY_DIR}/src/static
    COMMAND ${CMAKE_COMMAND} -E copy_directory ${STATIC_DIR} ${CMAKE_CURRENT_BINARY_DIR}/src/static
    DEPENDS ${STATIC_FILES}
    COMMENT "Copying static files to build directory"
)

# TESTONLY: When added, this target will only be built if both
# BUILD_TESTING=ON and ABSL_BUILD_TESTING=ON.
# Jesus Christ... this was a pain...
set(ABSL_FIND_GOOGLETEST OFF)
set(ABSL_USE_EXTERNAL_GOOGLETEST ON)
set(ABSL_BUILD_TEST_HELPERS ON)
set(ABSL_LOCAL_GOOGLETEST_DIR ${CMAKE_CURRENT_SOURCE_DIR}/googletest)

# Define the standalone Asio option
set(ASIO_INCLUDE_DIR ${CMAKE_CURRENT_SOURCE_DIR}/include/asio/asio/include)
option(ASIO_STANDALONE "Use standalone Asio instead of Boost.Asio" ON)

# ## Add all of the subdirectories
add_subdirectory(include/googletest)
add_subdirectory(include/abseil)
add_subdirectory(include/crow)
add_subdirectory(src)
add_subdirectory(tests)

include_directories(include/googletest)
include_directories(include/abseil)
include_directories(include/asio)
include_directories(include/crow)
include_directories(src)
include_directories(tests)


set(CPACK_PROJECT_NAME ${PROJECT_NAME})
set(CPACK_PROJECT_VERSION ${PROJECT_VERSION})
include(CPack)