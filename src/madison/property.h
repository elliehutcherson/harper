#include <memory>
#include <string>

#include "absl/container/btree_map.h"
#include "absl/container/flat_hash_map.h"
#include "absl/container/flat_hash_set.h"
#include "absl/log/log.h"
#include "absl/status/statusor.h"

struct Property {
  struct Coordinates {
    double x = 0.0;
    double y = 0.0;
  };
  int id = 0;
  std::string address;
  std::string class_type;
  int year_built = 0;
  Coordinates coordinates;
};

class PropertyState {
public:
  struct Options {
    bool allow_duplicates = false;
  };

  struct Search {
    std::optional<std::pair<int, int>> x_range;
    std::optional<std::pair<int, int>> y_range;
    std::optional<std::pair<int, int>> year_range;
  };

  absl::flat_hash_set<int> PropertyIdsByX(int lo, int hi) const {
    absl::flat_hash_set<int> ids;
    auto it = x_to_properties_.lower_bound(lo);
    while (it != x_to_properties_.end() && it->first < hi) {
      ids.insert(it->second->id);
      ++it;
    }
    return ids;
  }

  absl::flat_hash_set<int> PropertyIdsByY(int lo, int hi) const {
    absl::flat_hash_set<int> ids;
    auto it = y_to_properties_.lower_bound(lo);
    while (it != y_to_properties_.end() && it->first < hi) {
      ids.insert(it->second->id);
      ++it;
    }
    return ids;
  }

  absl::flat_hash_set<int> PropertyIdsByYear(int lo, int hi) const {
    absl::flat_hash_set<int> ids;
    auto it = year_to_properties_.lower_bound(lo);
    while (it != year_to_properties_.end() && it->first < hi) {
      ids.insert(it->second->id);
      ++it;
    }
    return ids;
  }

  absl::StatusOr<std::vector<Property *>> GetProperties(Search search) const {
    std::vector<Property *> result;

    std::optional<absl::flat_hash_set<int>> x_ids;
    if (search.x_range) {
      x_ids = PropertyIdsByX(search.x_range->first, search.x_range->second);
    }

    std::optional<absl::flat_hash_set<int>> y_ids;
    if (search.y_range) {
      y_ids = PropertyIdsByY(search.y_range->first, search.y_range->second);
    }

    std::optional<absl::flat_hash_set<int>> year_ids;
    if (search.year_range) {
      year_ids = PropertyIdsByYear(search.year_range->first,
                                   search.year_range->second);
    }

    std::optional<absl::flat_hash_set<int>> filtered_ids =
        GetFilteredIds(x_ids, y_ids);
    filtered_ids = GetFilteredIds(filtered_ids, year_ids);
    for (int id : *filtered_ids) {
      auto it = properties_.find(id);
      if (it != properties_.end()) {
        result.push_back(it->second.get());
      } else {
        LOG(WARNING) << "Property not found: " << id;
      }
    }

    return result;
  }

  std::optional<absl::flat_hash_set<int>>
  GetFilteredIds(std::optional<absl::flat_hash_set<int>> &left,
                 std::optional<absl::flat_hash_set<int>> &right) const {
    if (!left) {
      return right;
    } else if (!right) {
      return left;
    }

    absl::flat_hash_set<int> intersection;
    for (int id : *left) {
      if (right->contains(id)) {
        intersection.insert(id);
      }
    }

    return intersection;
  }

private:
  absl::btree_map<double, Property *> x_to_properties_;
  absl::btree_map<double, Property *> y_to_properties_;
  absl::btree_map<double, Property *> year_to_properties_;
  absl::flat_hash_map<int, std::unique_ptr<Property>> properties_;
};