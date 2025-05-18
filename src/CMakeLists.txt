add_library(utils utils.cc)

add_executable(${PROJECT_NAME} main.cc)
target_link_libraries(${PROJECT_NAME} 
    absl::base
    absl::flags
    absl::flags_parse
    absl::log
    absl::log_initialize
    absl::status
    absl::strings
    absl::str_format
    Crow::Crow
    utils
)
# Add dependency on templates
add_dependencies(${PROJECT_NAME} templates)
# Add dependency on static files
add_dependencies(${PROJECT_NAME} static)

# Define a preprocessor macro for the template directory
target_compile_definitions(${PROJECT_NAME} PRIVATE 
    CROW_TEMPLATES_DIR="${CMAKE_CURRENT_BINARY_DIR}/src/templates/"
)

# Define a preprocessor macro for the static directory
target_compile_definitions(${PROJECT_NAME} PRIVATE 
    CROW_STATIC_DIR="${CMAKE_CURRENT_BINARY_DIR}/src/static/"
)