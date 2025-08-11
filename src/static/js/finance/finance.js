
class BankruptcyDashboard {
  constructor() {
    this.data = {};
    this.chart = null;
    this.allDistricts = [];
    this.filteredDistricts = [];
    this.colors = [
      "#FF6384",
      "#36A2EB",
      "#FFCE56",
      "#4BC0C0",
      "#9966FF",
      "#FF9F40",
      "#FF6384",
      "#C9CBCF",
      "#4BC0C0",
      "#FF6384",
      "#36A2EB",
      "#FFCE56",
      "#4BC0C0",
      "#9966FF",
      "#FF9F40",
    ];

    this.init();
  }

  async init() {
    try {
      await this.loadData();
      this.setupEventListeners();
      this.updateChart();
      this.hideLoading();
    } catch (error) {
      this.showError("Failed to load data: " + error.message);
    }
  }

  async loadData() {
    const fileNames = ["filed", "pending", "terminated", "filed_yoy", "pending_yoy", "terminated_yoy"];

    for (const type of fileNames) {
      const fileName = `bankruptcy_${type}.csv`;
      const apiUrl = `static/data/${fileName}`;

      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const csvData = await response.text();

        const parsed = Papa.parse(csvData, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true
        });

        this.data[type] = this.processData(parsed.data, type);
      } catch (error) {
        console.error(`Failed to load ${fileName}:`, error);
        throw new Error(`Failed to load ${fileName}: ${error.message}`);
      }
    }

    // Get all unique districts
    this.allDistricts = [...new Set(Object.values(this.data).flatMap(d =>
      d.map(row => row.district)
    ))].sort();

    this.filteredDistricts = [...this.allDistricts];
    this.populateDistrictSelect();
  }

  processData(rawData, type) {
    return rawData.map((row) => {
      const district = row["Circuit and District"];
      const processedRow = { district };

      // Extract date columns and convert to proper format
      Object.keys(row).forEach((key) => {
        const isInvalid = key === "Circuit and District" || row[key] === null || row[key] === undefined;
        if (isInvalid) return;

        // Handle different naming conventions in the files
        let dateStr = key.replace(
          `${type.charAt(0).toUpperCase() + type.slice(1)}_`,
          ""
        );

        if (dateStr.match(/\d{4}-\d{2}/)) {
          // For YoY data, allow negative values and don't enforce minimum
          if (type.includes('yoy')) {
            processedRow[dateStr] = row[key] || 0;
          } else {
            processedRow[dateStr] = Math.max(0.1, row[key] || 0.1); // Ensure positive values for log scale
          }
        }
      });

      return processedRow;
    });
  }

  populateDistrictSelect() {
    const select = document.getElementById("districtSelect");
    select.innerHTML = '<option value="">Choose a district...</option>';

    this.filteredDistricts.forEach((district) => {
      const option = document.createElement("option");
      option.value = district;
      option.textContent = district;
      select.appendChild(option);
    });
  }

  setupEventListeners() {
    document
      .getElementById("dataType")
      .addEventListener("change", () => this.updateChart());
    document
      .getElementById("viewMode")
      .addEventListener("change", () => this.handleViewModeChange());
    document
      .getElementById("districtSelect")
      .addEventListener("change", () => this.updateChart());
    document
      .getElementById("searchDistrict")
      .addEventListener("input", (e) =>
        this.handleSearch(e.target.value)
      );
  }

  handleViewModeChange() {
    const viewMode = document.getElementById("viewMode").value;
    const districtSelect = document.getElementById("districtSelect");

    if (viewMode === "single") {
      districtSelect.style.display = "block";
    } else {
      districtSelect.style.display = "none";
    }

    this.updateChart();
  }

  handleSearch(searchTerm) {
    this.filteredDistricts = this.allDistricts.filter((district) =>
      district.toLowerCase().includes(searchTerm.toLowerCase())
    );
    this.populateDistrictSelect();

    if (document.getElementById("viewMode").value !== "single") {
      this.updateChart();
    }
  }

  getDateLabels() {
    // Generate date labels from 2020-03 to 2025-06
    const dates = [];
    for (let year = 2020; year <= 2025; year++) {
      const monthsInYear = year === 2025 ? [3, 6] : [3, 6, 9, 12];
      for (const month of monthsInYear) {
        dates.push(`${year}-${month.toString().padStart(2, "0")}`);
      }
    }
    return dates;
  }

  updateChart() {
    const dataType = document.getElementById("dataType").value;
    const viewMode = document.getElementById("viewMode").value;
    const selectedDistrict =
      document.getElementById("districtSelect").value;

    const currentData = this.data[dataType];
    const dates = this.getDateLabels();

    let districtsToShow = [];

    switch (viewMode) {
      case "single":
        if (selectedDistrict) {
          districtsToShow = [selectedDistrict];
        } else {
          districtsToShow = [];
        }
        break;
      case "top10":
        // Get top 10 districts by latest value
        const latestDate = dates[dates.length - 1];
        districtsToShow = currentData
          .filter((row) => this.filteredDistricts.includes(row.district))
          .sort((a, b) => (b[latestDate] || 0) - (a[latestDate] || 0))
          .slice(0, 10)
          .map((row) => row.district);
        break;
      default:
        districtsToShow = this.filteredDistricts.slice(0, 20); // Limit to 20 for performance
        break;
    }

    const datasets = districtsToShow.map((district, index) => {
      const districtData = currentData.find(
        (row) => row.district === district
      );

      return {
        label: district,
        data: dates.map((date) =>
          districtData ? districtData[date] || null : null
        ),
        borderColor: this.colors[index % this.colors.length],
        backgroundColor: this.colors[index % this.colors.length] + "20",
        pointBackgroundColor: this.colors[index % this.colors.length],
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 4,
        fill: false,
        tension: 0.1,
      };
    });

    this.renderChart(dates, datasets);
    this.updateStats(currentData, dataType);
  }

  renderChart(dates, datasets) {
    const ctx = document
      .getElementById("bankruptcyChart")
      .getContext("2d");
    const dataType = document.getElementById("dataType").value;
    const isYoY = dataType.includes("yoy");
    const title = `Bankruptcy Filings - ${dataType.toUpperCase()} ${isYoY ? "(Linear Scale)" : "(Logarithmic Scale)"}`;
    const scaleType = isYoY ? "linear" : "logarithmic";
    const yAxisTitle = isYoY ? 'YoY Change (%)' : 'Number of Cases (Log Scale)';
    // Tooltip formatting
    const suffix = isYoY ? '%' : '';

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: dates,
        datasets: datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: title,
            font: {
              size: 16,
              weight: "bold",
            },
          },
          legend: {
            position: "top",
            labels: {
              usePointStyle: true,
              boxWidth: 6,
            },
          },
          tooltip: {
            callbacks: {
              title: function (context) {
                return `Date: ${context[0].label}`;
              },
              label: function (context) {
                return `${context.dataset.label}: ${context.parsed.y?.toLocaleString() || "No data"}${suffix}`;
              },
            },
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Date (Year-Month)",
            },
            ticks: {
              maxRotation: 45,
            },
          },
          y: {
            type: scaleType,
            title: {
              display: true,
              text: yAxisTitle,
            },
            ticks: {
              callback: function (value) {
                return value.toLocaleString();
              },
            },
          },
        },
        interaction: {
          // mode: "index",
          // intersect: false,
          mode: "point",
          intersect: true,
        },
      },
    });
  }

  updateStats(data, dataType) {
    const latestDate = this.getDateLabels().slice(-1)[0];
    const totalCurrent = data.reduce(
      (sum, row) => sum + (row[latestDate] || 0),
      0
    );
    const avgPerDistrict = totalCurrent / data.length;
    const maxDistrict = data.reduce(
      (max, row) =>
        (row[latestDate] || 0) > (max.value || 0)
          ? { district: row.district, value: row[latestDate] || 0 }
          : max,
      { district: "", value: 0 }
    );

    const statsHtml = `
      <div class="stat-card">
        <div class="stat-value">${totalCurrent.toLocaleString()}</div>
        <div class="stat-label">Total ${dataType.charAt(0).toUpperCase() + dataType.slice(1)} Cases</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${Math.round(avgPerDistrict).toLocaleString()}</div>
        <div class="stat-label">Average per District</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${maxDistrict.value.toLocaleString()}</div>
        <div class="stat-label">Highest (${maxDistrict.district})</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${data.length}</div>
        <div class="stat-label">Total Districts</div>
      </div>
    `;

    document.getElementById("stats").innerHTML = statsHtml;
    document.getElementById("stats").style.display = "grid";
  }

  hideLoading() {
    document.getElementById("loadingMessage").style.display = "none";
    document.querySelector(".chart-container").style.display = "block";
  }

  showError(message) {
    document.getElementById("errorMessage").textContent = message;
    document.getElementById("errorMessage").style.display = "block";
    document.getElementById("loadingMessage").style.display = "none";
  }
}

// Initialize the dashboard when the page loads
document.addEventListener("DOMContentLoaded", () => {
  new BankruptcyDashboard();
});