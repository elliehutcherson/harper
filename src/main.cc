#include "absl/log/log.h"
#include "crow.h"
#include "utils.h"

#include "crow/mustache.h" // Include the templating engine

int main() {
  crow::SimpleApp app;

  std::string executable_path = GetExecutableDir();
  std::string template_path = executable_path + "/templates";
  LOG(INFO) << "Template path: " << template_path;
  crow::mustache::set_global_base(
      template_path); // Set the base path for templatesj

  // Set up your routes and application logic
  CROW_ROUTE(app, "/")([] {
    crow::mustache::context ctx;

    // Set simple values
    ctx["title"] = "Patty's Pastries";
    ctx["heading"] = "Patty's Pastries";

    // Example statistics data
    std::vector<crow::json::wvalue> stats;
    stats.push_back({{"label", "Donuts in bank"}, {"value", "1,245"}});
    stats.push_back({{"label", "Donuts baked"}, {"value", "87"}});
    stats.push_back({{"label", "Donuts per second"}, {"value", "124"}});
    stats.push_back({{"label", "Run time"}, {"value", "52 seconds"}});
    stats.push_back({{"label", "Game version"}, {"value", "0.1.0"}});
    ctx["stats"] = std::move(stats);

    // Shop list
    std::vector<crow::json::wvalue> shop;

    // Basic equipment (realistic)
    shop.push_back(
        {{"name", "Rolling Pin"},
         {"price", "24.99"},
         {"description", "Start with basic dough rolling for simple pastries"},
         {"percentage", 85}});
    shop.push_back({{"name", "Pastry Cutter Set"},
                     {"price", "32.50"},
                     {"description", "Precise shapes for different pastries"},
                     {"percentage", 78}});
    shop.push_back({{"name", "Proofing Cabinet"},
                     {"price", "149.99"},
                     {"description", "Better rise for breads and pastries"},
                     {"percentage", 92}});
    shop.push_back(
        {{"name", "Pastry Laminator"},
         {"price", "299.95"},
         {"description", "Perfect for croissants and other layered pastries"},
         {"percentage", 65}});
    shop.push_back(
        {{"name", "Steam Injection Oven"},
         {"price", "750.00"},
         {"description", "Professional-quality crusts and textures"},
         {"percentage", 88}});
    shop.push_back({{"name", "Decorating Station"},
                     {"price", "124.99"},
                     {"description", "Fancy finishes and glazes"},
                     {"percentage", 72}});
    shop.push_back({{"name", "Artisanal Kitchen"},
                     {"price", "1,299.00"},
                     {"description", "Small-batch specialty shop"},
                     {"percentage", 95}});
    shop.push_back({{"name", "Patisserie"},
                     {"price", "4,500.00"},
                     {"description",
                      "Hire expert pastry chefs for multiple production lines"},
                     {"percentage", 60}});

    // Advanced equipment (getting more elaborate)
    shop.push_back({{"name", "Boulangerie Chain"},
                     {"price", "12,000.00"},
                     {"description", "Open specialty shops across the city"},
                     {"percentage", 55}});
    shop.push_back(
        {{"name", "Pastry Academy"},
         {"price", "25,000.00"},
         {"description", "Train master bakers to improve quality and speed"},
         {"percentage", 48}});
    shop.push_back({{"name", "Flash-Freezing Technology"},
                     {"price", "38,500.00"},
                     {"description", "Preserve freshness for global shipping"},
                     {"percentage", 42}});
    shop.push_back(
        {{"name", "Mega Bakery Complex"},
         {"price", "120,000.00"},
         {"description", "Industrial-scale production of all varieties"},
         {"percentage", 37}});
    shop.push_back({{"name", "Regional Distribution Centers"},
                     {"price", "250,000.00"},
                     {"description", "Fresh baked goods delivered everywhere"},
                     {"percentage", 33}});
    shop.push_back(
        {{"name", "Pastry Skyscraper"},
         {"price", "1.2M"},
         {"description", "Vertical integration from grain silos to packaging"},
         {"percentage", 28}});

    // Fantasy/sci-fi equipment (increasingly absurd)
    shop.push_back({{"name", "Floating Bakery Islands"},
                     {"price", "4.5M"},
                     {"description", "Oceanic pastry production complexes"},
                     {"percentage", 24}});
    shop.push_back(
        {{"name", "Stratospheric Ovens"},
         {"price", "12M"},
         {"description", "Harness the sun's direct heat for perfect baking"},
         {"percentage", 20}});
    shop.push_back({{"name", "Molecular Pastry Assemblers"},
                     {"price", "50M"},
                     {"description", "Build pastries atom by atom"},
                     {"percentage", 17}});
    shop.push_back(
        {{"name", "Flavor Dimension Gateway"},
         {"price", "250M"},
         {"description", "Import exotic tastes from alternate realities"},
         {"percentage", 14}});
    shop.push_back({{"name", "Temporal Proofing Chambers"},
                     {"price", "1B"},
                     {"description", "Dough rises for centuries in minutes"},
                     {"percentage", 12}});
    shop.push_back({{"name", "Dough Terraforming"},
                     {"price", "10B"},
                     {"description",
                      "Convert entire planets into giant pastry environments"},
                     {"percentage", 10}});
    shop.push_back(
        {{"name", "Quantum Croissant Entanglement"},
         {"price", "100B"},
         {"description",
          "One bite affects all identical pastries across the multiverse"},
         {"percentage", 8}});
    shop.push_back(
        {{"name", "Yeast Sentience"},
         {"price", "1T"},
         {"description", "Self-evolving bread organisms that bake themselves"},
         {"percentage", 6}});
    shop.push_back(
        {{"name", "The Great British Bake Off Singularity"},
         {"price", "10T"},
         {"description", "Reality show contestants from across time compete to "
                         "increase your production"},
         {"percentage", 4}});
    shop.push_back(
        {{"name", "Pastry Transcendence"},
         {"price", "100T"},
         {"description", "Elevate baked goods to a higher plane of existence"},
         {"percentage", 3}});
    shop.push_back(
        {{"name", "Universal Proving"},
         {"price", "1Q"},
         {"description",
          "The expansion of the universe is actually just your dough rising"},
         {"percentage", 2}});
    shop.push_back({{"name", "Baker's Godhood"},
                     {"price", "∞"},
                     {"description", "Reshape reality where physics follows "
                                     "the laws of patisserie instead"},
                     {"percentage", 1}});

    ctx["shop"] = std::move(shop);

    // Render the template with the context
    return crow::mustache::load("index.html").render(ctx);
  });

  app.port(8080).run();
  return 0;
}