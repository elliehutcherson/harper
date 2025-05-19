#include "shop.h"

#include <cstdint>
#include <vector>

namespace harper {

const std::vector<Shop> *GetShop() {
  static std::vector<Shop> shop;
  static bool initialized = false;
  if (initialized) {
    return &shop;
  }
  initialized = true;

  shop.push_back(
      Shop{.id = 0,
           .name = "Rolling Pin",
           .description = "Start with basic dough rolling for simple pastries",
           .price = 2499,
           .sprinkles_per_cycle = 0.85,
           .cycles_per_minute = 1});
  shop.push_back(Shop{.id = 1,
                      .name = "Pastry Cutter Set",
                      .description = "Precise shapes for different pastries",
                      .price = 3250,
                      .sprinkles_per_cycle = 1.2,
                      .cycles_per_minute = 0.75});
  shop.push_back(Shop{.id = 2,
                      .name = "Proofing Cabinet",
                      .description = "Better rise for breads and pastries",
                      .price = 14999,
                      .sprinkles_per_cycle = 1.5,
                      .cycles_per_minute = 0.5});
  shop.push_back(
      Shop{.id = 3,
           .name = "Pastry Laminator",
           .description = "Perfect for croissants and other layered pastries",
           .price = 29995,
           .sprinkles_per_cycle = 2.0,
           .cycles_per_minute = 0.25});
  shop.push_back(Shop{.id = 4,
                      .name = "Steam Injection Oven",
                      .description = "Professional-quality crusts and textures",
                      .price = 75000,
                      .sprinkles_per_cycle = 2.5,
                      .cycles_per_minute = 0.1});
  shop.push_back(Shop{.id = 5,
                      .name = "Decorating Station",
                      .description = "Fancy finishes and glazes",
                      .price = 12499,
                      .sprinkles_per_cycle = 3.0,
                      .cycles_per_minute = 0.05});
  shop.push_back(Shop{.id = 6,
                      .name = "Artisanal Kitchen",
                      .description = "Small-batch specialty shop",
                      .price = 129900,
                      .sprinkles_per_cycle = 4.0,
                      .cycles_per_minute = 0.01});
  shop.push_back(Shop{
      .id = 7,
      .name = "Patisserie",
      .description = "Hire expert pastry chefs for multiple production lines",
      .price = 450000,
      .sprinkles_per_cycle = 5.0,
      .cycles_per_minute = 0.005});
  shop.push_back(Shop{.id = 8,
                      .name = "Boulangerie Chain",
                      .description = "Open specialty shops across the city",
                      .price = 1200000,
                      .sprinkles_per_cycle = 6.0,
                      .cycles_per_minute = 0.002});
  shop.push_back(
      Shop{.id = 9,
           .name = "Pastry Academy",
           .description = "Train master bakers to improve quality and speed",
           .price = 2500000,
           .sprinkles_per_cycle = 7.0,
           .cycles_per_minute = 0.001});
  shop.push_back(Shop{.id = 10,
                      .name = "Flash-Freezing Technology",
                      .description = "Preserve freshness for global shipping",
                      .price = 3850000,
                      .sprinkles_per_cycle = 8.0,
                      .cycles_per_minute = 0.0005});
  shop.push_back(
      Shop{.id = 11,
           .name = "Mega Bakery Complex",
           .description = "Industrial-scale production of all varieties",
           .price = 12000000,
           .sprinkles_per_cycle = 9.0,
           .cycles_per_minute = 0.0001});
  shop.push_back(Shop{.id = 12,
                      .name = "Regional Distribution Centers",
                      .description = "Fresh baked goods delivered everywhere",
                      .price = 25000000,
                      .sprinkles_per_cycle = 10.0,
                      .cycles_per_minute = 0.00005});
  shop.push_back(
      Shop{.id = 13,
           .name = "Pastry Skyscraper",
           .description = "Vertical integration from grain silos to packaging",
           .price = 120000000,
           .sprinkles_per_cycle = 11.0,
           .cycles_per_minute = 0.00001});
  shop.push_back(Shop{.id = 14,
                      .name = "Floating Bakery Islands",
                      .description = "Oceanic pastry production complexes",
                      .price = 450000000,
                      .sprinkles_per_cycle = 12.0,
                      .cycles_per_minute = 0.000005});
  shop.push_back(
      Shop{.id = 15,
           .name = "Stratospheric Ovens",
           .description = "Harness the sun's direct heat for perfect baking",
           .price = 1200000000,
           .sprinkles_per_cycle = 13.0,
           .cycles_per_minute = 0.000001});
  shop.push_back(Shop{.id = 16,
                      .name = "Molecular Pastry Assemblers",
                      .description = "Build pastries atom by atom",
                      .price = 5000000000,
                      .sprinkles_per_cycle = 14.0,
                      .cycles_per_minute = 0.0000005});
  shop.push_back(
      Shop{.id = 17,
           .name = "Flavor Dimension Gateway",
           .description = "Import exotic tastes from alternate realities",
           .price = 25000000000,
           .sprinkles_per_cycle = 15.0,
           .cycles_per_minute = 0.0000001});
  shop.push_back(Shop{.id = 18,
                      .name = "Temporal Proofing Chambers",
                      .description = "Dough rises for centuries in minutes",
                      .price = 100000000000,
                      .sprinkles_per_cycle = 16.0,
                      .cycles_per_minute = 0.00000005});
  shop.push_back(Shop{
      .id = 19,
      .name = "Dough Terraforming",
      .description = "Convert entire planets into giant pastry environments",
      .price = 1000000000000,
      .sprinkles_per_cycle = 17.0,
      .cycles_per_minute = 0.00000001});
  shop.push_back(
      Shop{.id = 20,
           .name = "Quantum Croissant Entanglement",
           .description =
               "One bite affects all identical pastries across the multiverse",
           .price = 10000000000000,
           .sprinkles_per_cycle = 18.0,
           .cycles_per_minute = 0.000000005});
  shop.push_back(
      Shop{.id = 21,
           .name = "Yeast Sentience",
           .description = "Self-evolving bread organisms that bake themselves",
           .price = 100000000000000,
           .sprinkles_per_cycle = 19.0,
           .cycles_per_minute = 0.000000001});
  shop.push_back(Shop{.id = 22,
                      .name = "The Great British Bake Off Singularity",
                      .description =
                          "Reality show contestants from across time "
                          "compete to increase your production",
                      .price = 1000000000000000,
                      .sprinkles_per_cycle = 20.0,
                      .cycles_per_minute = 0.0000000005});
  shop.push_back(
      Shop{.id = 23,
           .name = "Pastry Transcendence",
           .description = "Elevate baked goods to a higher plane of existence",
           .price = 10000000000000000,
           .sprinkles_per_cycle = 21.0,
           .cycles_per_minute = 0.0000000001});
  shop.push_back(Shop{
      .id = 24,
      .name = "Universal Proving",
      .description =
          "The expansion of the universe is actually just your dough rising",
      .price = 100000000000000000,
      .sprinkles_per_cycle = 22.0,
      .cycles_per_minute = 0.00000000005});
  shop.push_back(Shop{.id = 25,
                      .name = "Baker's Godhood",
                      .description =
                          "Reshape reality where physics follows the "
                          "laws of patisserie instead",
                      .price = 1000000000000000000,
                      .sprinkles_per_cycle = 23.0,
                      .cycles_per_minute = 0.00000000001});
  return &shop;
}

std::vector<crow::json::wvalue> GetShopJson() {
  const std::vector<Shop> *shops = GetShop();
  std::vector<crow::json::wvalue> shop_json;
  for (const Shop& shop : *shops) {
    shop_json.push_back(shop.ToJson());
  }
  return shop_json;
}

} // namespace harper
