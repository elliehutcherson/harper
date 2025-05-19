#include <cstdint>
#include <string>

#include "crow/json.h"

namespace harper {

struct Shop {
  uint64_t id = 0;
  std::string name;
  std::string description;
  uint64_t price = 0;
  double sprinkles_per_cycle = 0;
  float cycles_per_minute = 0;
  uint64_t count = 0;

  std::string price_string() const {
    if (price == 0) {
      return "Free";
    } else if (price < 1000) {
      return std::to_string(price);
    } else if (price < 1000000) {
      return std::to_string(price / 1000) + " Thousand";
    } else if (price < 1000000000) {
      return std::to_string(price / 1000000) + " Million";
    } else if (price < 1000000000000) {
      return std::to_string(price / 1000000000) + " Billion";
    } else if (price < 1000000000000000) {
      return std::to_string(price / 1000000000000) + " Trillion";
    } else if (price < 1000000000000000000) {
      return std::to_string(price / 1000000000000000000) + " Quadrillion";
    }
    return std::to_string(price / 1000000000000) + " Quintillion";
  }

  crow::json::wvalue ToJson() const {
    return {{"id", id},
            {"name", name},
            {"description", description},
            {"price", price},
            {"price_string", price_string()},
            {"sprinkles_per_cycle", sprinkles_per_cycle},
            {"cycles_per_minute", cycles_per_minute},
            {"count", count}};
  }
};

const std::vector<Shop> *GetShop();

std::vector<crow::json::wvalue> GetShopJson();

}  // namespace harper