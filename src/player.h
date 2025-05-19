#include <string>


namespace harper {
namespace {

std::string GenerateRandomName() {
    // Placeholder for random name generation logic
    return "Random";
}

}  // namespace

struct Player {
    std::string name = GenerateRandomName();
    uint64_t sprinkles = 0;
};



}  // namespace harper