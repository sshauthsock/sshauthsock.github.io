import { createElement } from "../utils.js";
import { STATS_MAPPING } from "../constants.js";

export function createStatFilter(container, allSpirits, onFilterChange) {
  const filterWrapper = createElement("div", "stat-filter-container");

  const statFilter = createElement("select", "stat-filter", {
    id: "statFilter",
  });
  statFilter.appendChild(
    createElement("option", "", { value: "", text: "능력치 필터" })
  );

  const clearBtn = createElement("button", "clear-filter-btn", {
    text: "초기화",
  });
  clearBtn.style.display = "none";

  populateStatOptions(statFilter, allSpirits);

  const handleFilterChange = function () {
    const selectedStat = this.value;
    clearBtn.style.display = selectedStat ? "block" : "none";
    onFilterChange(selectedStat);
  };

  const handleClearClick = () => {
    statFilter.value = "";
    clearBtn.style.display = "none";
    onFilterChange("");
  };

  statFilter.addEventListener("change", handleFilterChange);
  clearBtn.addEventListener("click", handleClearClick);

  filterWrapper.append(statFilter, clearBtn);
  container.appendChild(filterWrapper);

  const cleanup = () => {
    statFilter.removeEventListener("change", handleFilterChange);
    clearBtn.removeEventListener("click", handleClearClick);
    filterWrapper.remove();
  };

  return { statFilter, clearBtn, cleanup };
}

function populateStatOptions(selectElement, spirits) {
  const allStats = new Set();
  spirits.forEach((s) =>
    s.stats.forEach((stat) => {
      if (stat.bindStat) {
        Object.keys(stat.bindStat).forEach((key) => allStats.add(key));
      }
      if (stat.registrationStat) {
        Object.keys(stat.registrationStat).forEach((key) => allStats.add(key));
      }
    })
  );

  [...allStats].sort().forEach((key) =>
    selectElement.appendChild(
      createElement("option", "", {
        value: key,
        text: STATS_MAPPING[key] || key,
      })
    )
  );
}
