#include "absl/log/log.h"

#include "crow/app.h"
#include "crow/mustache.h" 

#include "utils.h"
#include "stats.h"

int main() {
  crow::SimpleApp app;

  std::string executable_path = GetExecutableDir();
  std::string template_path = executable_path + "/templates";
  LOG(INFO) << "Template path: " << template_path;
  // crow::mustache::set_global_base(
  //     template_path); // Set the base path for templates

  // Set up your routes and application logic
  CROW_ROUTE(app, "/")([] {
    crow::mustache::context ctx;
    // Render the template with the context
    return crow::mustache::load("home/home.html").render(ctx);
  });


  // Set up your routes and application logic
  CROW_ROUTE(app, "/donuts")([] {
    crow::mustache::context ctx;

    // Set simple values
    ctx["title"] = "Patty's Pastries";
    ctx["heading"] = "Patty's Pastries";

    // Example statistics data
    ctx["stats"] = harper::Stats().ToJson();

    // Render the template with the context
    return crow::mustache::load("donuts/index.html").render(ctx);
  });

  // Set up your routes and application logic
  CROW_ROUTE(app, "/madison")([] {
    crow::mustache::context ctx;
    // Render the template with the context
    return crow::mustache::load("madison/madison.html").render(ctx);
  });

  CROW_ROUTE(app, "/finance")([] {
    crow::mustache::context ctx;
    // Render the template with the context
    return crow::mustache::load("finance/finance.html").render(ctx);
  });

  app.port(8080).run();
  return 0;
}