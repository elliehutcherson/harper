#include <string>

#include "crow/json.h"

namespace harper {

struct Stat {
  std::string id;
  std::string label;
  std::string value;
  crow::json::wvalue ToJson() const {
    return {{"id", id}, {"label", label}, {"value", value}};
  }
};

struct Stats {
  Stat current_sprinkles = {"stats-current-sprinkles", "Current Sprinkles", "0"};
  Stat total_sprinkles = {"stats-total-sprinkles", "Total Sprinkles", "0"};
  Stat elapsed_time = {"stats-elapsed-time", "Elapsed Time", "0"};
  Stat sprinkles_per_minute = {"stats-sprinkles-per-minute", "Sprinkles Per Minute",
                               "0"};

  std::vector<crow::json::wvalue> ToJson() const {
    return {current_sprinkles.ToJson(), total_sprinkles.ToJson(),
            elapsed_time.ToJson(), sprinkles_per_minute.ToJson()};
  }
};

} // namespace harper