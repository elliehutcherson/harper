add_library(utils utils.cc)

add_library(player INTERFACE 
    player.h
)

add_library(stats INTERFACE 
    stats.h
)

add_library(shop shop.cc)
target_link_libraries(shop 
    Crow::Crow
)

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
    player
    stats 
    shop
)
# Add dependencies on templates and static targets
add_dependencies(${PROJECT_NAME} templates static)

# Define preprocessor macros for the directories
target_compile_definitions(${PROJECT_NAME} PRIVATE 
    CROW_TEMPLATES_DIR="${CMAKE_CURRENT_BINARY_DIR}/src/templates/"
    CROW_STATIC_DIR="${CMAKE_CURRENT_BINARY_DIR}/src/static/"
)