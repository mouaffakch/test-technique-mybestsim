/**
 * MyBestSim - Interactive Analytics & Data Dashboard Engine
 * Handles KPI rendering, Chart.js visualisations, search/filter table explorer, and export.
 */

// Global State
const state = {
  summary: null,
  catalog: [],
  filteredCatalog: [],
  currentPage: 1,
  pageSize: 25,
  sortCol: "price",
  sortAsc: true,
  filters: {
    query: "",
    provider: "all",
    network: "all",
    topup: "all",
    maxPrice: 200,
    minData: 0
  },
  charts: {}
};

// Initialize Application
document.addEventListener("DOMContentLoaded", async () => {
  initTabs();
  initSimulator();
  await loadData();
  renderKPIs();
  renderCharts();
  initFilters();
  applyFilters();
});

// Tab Navigation
function initTabs() {
  const tabButtons = document.querySelectorAll("[data-tab-target]");
  const tabContents = document.querySelectorAll(".tab-pane");

  // Check URL hash for direct tab linking (e.g. #article or #dashboard)
  const hash = window.location.hash.replace("#", "");
  if (hash) {
    const targetPane = document.getElementById(hash);
    const targetBtn = document.querySelector(`[data-tab-target="${hash}"]`);
    if (targetPane && targetBtn) {
      tabContents.forEach(p => p.classList.add("hidden"));
      tabButtons.forEach(b => b.classList.remove("border-blue-600", "text-blue-600", "font-semibold"));
      targetPane.classList.remove("hidden");
      targetBtn.classList.add("border-blue-600", "text-blue-600", "font-semibold");
    }
  }

  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-tab-target");
      tabContents.forEach(p => p.classList.add("hidden"));
      tabButtons.forEach(b => {
        b.classList.remove("border-blue-600", "text-blue-600", "font-semibold");
        b.classList.add("text-slate-500", "border-transparent");
      });

      const activePane = document.getElementById(targetId);
      if (activePane) {
        activePane.classList.remove("hidden");
        btn.classList.add("border-blue-600", "text-blue-600", "font-semibold");
        btn.classList.remove("text-slate-500", "border-transparent");
        window.location.hash = targetId;
      }
    });
  });
}

// Fetch Precomputed Data (supports window global data for zero-CORS file:// protocol and fetch fallback)
async function loadData() {
  try {
    if (window.SUMMARY_DATA && window.CATALOG_DATA) {
      state.summary = window.SUMMARY_DATA;
      state.catalog = window.CATALOG_DATA;
    } else {
      const [summaryRes, catalogRes] = await Promise.all([
        fetch("data/summary_stats.json"),
        fetch("data/catalog.json")
      ]);
      state.summary = await summaryRes.json();
      state.catalog = await catalogRes.json();
    }
    
    state.filteredCatalog = [...state.catalog];

    // Populate Provider dropdown filter
    const provSelect = document.getElementById("filterProvider");
    if (provSelect && state.summary.providers) {
      // Clear any existing options except first
      provSelect.innerHTML = '<option value="all">Tous les fournisseurs (18)</option>';
      state.summary.providers.forEach(p => {
        const opt = document.createElement("option");
        opt.value = p.provider;
        opt.textContent = `${p.provider} (${p.total_plans} offres)`;
        provSelect.appendChild(opt);
      });
    }

    document.getElementById("loadingBanner")?.classList.add("hidden");
  } catch (err) {
    console.error("Error loading data:", err);
    const banner = document.getElementById("loadingBanner");
    if (banner) {
      banner.innerHTML = `<div class="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200">
        Erreur de chargement des données. Veuillez vérifier que les fichiers JSON ou JS sont accessibles.
      </div>`;
    }
  }
}

// Render Top KPI Cards
function renderKPIs() {
  if (!state.summary) return;
  const k = state.summary.kpis;

  animateValue("kpiTotalEsims", 0, k.total_esim_products, 1000);
  animateValue("kpiOver100", 0, k.over_100_eur_count, 1000);
  document.getElementById("kpiOver100Pct").textContent = `${k.over_100_eur_pct}% du catalogue`;

  document.getElementById("kpiPriceMin").textContent = `${k.price_range.min.toFixed(2)} €`;
  document.getElementById("kpiPriceMax").textContent = `${k.price_range.max.toFixed(2)} €`;
  document.getElementById("kpiPriceSpan").textContent = `Écart : ${k.price_range.amplitude.toFixed(2)} €`;

  document.getElementById("kpiAvgGb").textContent = `${k.data_gb_avg_finite} Go`;
  document.getElementById("kpiUnlimitedCount").textContent = `${k.unlimited_plans_count} illimités (${k.unlimited_plans_pct}%)`;

  document.getElementById("kpiAvgPrice").textContent = `${k.global_average_price.toFixed(2)} €`;
  document.getElementById("kpiMedianPrice").textContent = `Médiane : ${k.global_median_price.toFixed(2)} €`;

  document.getElementById("kpiPricePerGb").textContent = `${k.price_per_gb_avg.toFixed(2)} € / Go`;
  const weightedPrice = k.price_per_gb_weighted ? k.price_per_gb_weighted.toFixed(2) : "1.70";
  document.getElementById("kpiMedianPricePerGb").innerHTML = `Médiane : ${k.price_per_gb_median.toFixed(2)} € · <span class="text-emerald-400 font-semibold" title="Moyenne pondérée volume (total CA / total Go)">Pondéré : ${weightedPrice} €</span>`;
}

// Animate Numbers
function animateValue(id, start, end, duration) {
  const obj = document.getElementById(id);
  if (!obj) return;
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    obj.innerHTML = Math.floor(progress * (end - start) + start).toLocaleString("fr-FR");
    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      obj.innerHTML = end.toLocaleString("fr-FR");
    }
  };
  window.requestAnimationFrame(step);
}

// Render Interactive Chart.js Visualisations
function renderCharts() {
  if (!state.summary) return;

  // Shared dark chart theme
  const darkGrid  = "rgba(255,255,255,0.05)";
  const darkTick  = "#475569";
  const tooltipBg = "#1e2130";
  const tooltipBorder = "rgba(255,255,255,0.08)";

  // Chart 1: Provider Volume (Horizontal Bar)
  const ctxProviders = document.getElementById("chartProviders")?.getContext("2d");
  if (ctxProviders) {
    const labels = state.summary.providers.map(p => p.provider);
    const data = state.summary.providers.map(p => p.total_plans);
    const maxVal = Math.max(...data);

    state.charts.providers = new Chart(ctxProviders, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [{
          label: "Nombre d'offres",
          data: data,
          backgroundColor: data.map(v => {
            const ratio = v / maxVal;
            return `rgba(59,130,246,${0.4 + ratio * 0.55})`;
          }),
          borderColor: "rgba(96,165,250,0.5)",
          borderWidth: 1,
          borderRadius: 6
        }]
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: tooltipBg,
            borderColor: tooltipBorder,
            borderWidth: 1,
            titleColor: "#f1f5f9",
            bodyColor: "#94a3b8",
            callbacks: {
              afterLabel: function(context) {
                const prov = state.summary.providers[context.dataIndex];
                return [
                  `Part de catalogue : ${prov.pct_catalog}%`,
                  `Prix moyen : ${prov.avg_price.toFixed(2)} €`,
                  `Volume moyen : ${prov.avg_gb.toFixed(1)} Go`,
                  `Forfaits illimités : ${prov.unlimited_plans}`
                ];
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: darkGrid },
            ticks: { color: darkTick },
            title: { display: true, text: "Nombre de produits répertoriés", color: darkTick }
          },
          y: { grid: { display: false }, ticks: { color: darkTick } }
        }
      }
    });
  }

  // Chart 2: Price per GB Benchmark by Provider (with Mix Bias Annotation)
  const ctxPpg = document.getElementById("chartPricePerGb")?.getContext("2d");
  if (ctxPpg) {
    const sortedByPpg = [...state.summary.providers].sort((a, b) => a.avg_price_per_gb - b.avg_price_per_gb);
    state.charts.ppg = new Chart(ctxPpg, {
      type: "bar",
      data: {
        labels: sortedByPpg.map(p => p.provider),
        datasets: [{
          label: "Prix moyen par Go (€/Go)",
          data: sortedByPpg.map(p => p.avg_price_per_gb),
          backgroundColor: sortedByPpg.map(p =>
            p.avg_price_per_gb < 3.0 ? "rgba(16,185,129,0.85)" :
            p.avg_price_per_gb < 3.3 ? "rgba(59,130,246,0.8)" :
            "rgba(245,158,11,0.8)"
          ),
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: tooltipBg, borderColor: tooltipBorder, borderWidth: 1,
            titleColor: "#f1f5f9", bodyColor: "#94a3b8",
            callbacks: {
              label: (ctx) => `Prix moyen au Go : ${ctx.raw.toFixed(2)} €/Go`,
              afterLabel: () => [
                "ℹ️ Effet de mix catalogue : À offre identique (même pays/Go/durée),",
                "tous les fournisseurs sont à ±0.5% de la médiane !"
              ]
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: "Coût moyen en € / Go", color: darkTick },
            grid: { color: darkGrid }, ticks: { color: darkTick }
          },
          x: {
            ticks: { autoSkip: false, maxRotation: 45, minRotation: 45, color: darkTick },
            grid: { display: false }
          }
        }
      }
    });
  }

  // Chart 3: Network Distribution (4G vs 5G) with Simpson's Paradox Insight
  const ctxNetwork = document.getElementById("chartNetwork")?.getContext("2d");
  if (ctxNetwork) {
    const net = state.summary.network;
    state.charts.network = new Chart(ctxNetwork, {
      type: "doughnut",
      data: {
        labels: ["4G LTE", "5G Haute Vitesse"],
        datasets: [{
          data: [net.count_4g, net.count_5g],
          backgroundColor: ["#3b82f6", "#a855f7"],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "68%",
        plugins: {
          legend: { position: "bottom", labels: { color: "#64748b", padding: 12, font: { size: 11 } } },
          tooltip: {
            backgroundColor: tooltipBg, borderColor: tooltipBorder, borderWidth: 1,
            titleColor: "#f1f5f9", bodyColor: "#94a3b8",
            callbacks: {
              label: (ctx) => {
                const is4G = ctx.dataIndex === 0;
                const count = is4G ? net.count_4g : net.count_5g;
                const pct   = is4G ? net.pct_4g   : net.pct_5g;
                const unlimPct = is4G ? (net.unlimited_pct_4g || 7.6) : (net.unlimited_pct_5g || 22.9);
                const avgFinite = is4G ? (net.avg_price_finite_4g || 24.73) : (net.avg_price_finite_5g || 24.39);
                return [
                  `${ctx.label}: ${count.toLocaleString()} (${pct}%)`,
                  `• Part d'illimités : ${unlimPct}%`,
                  `• Prix moyen (offres finies) : ${avgFinite.toFixed(2)} €`,
                  is4G ? "• Base stable de volume" : "• 3x plus d'illimités (explique le surcoût brut)"
                ];
              }
            }
          }
        }
      }
    });
  }

  // Chart 4: Top-Up Availability
  const ctxTopUp = document.getElementById("chartTopUp")?.getContext("2d");
  if (ctxTopUp) {
    const tu = state.summary.top_up;
    state.charts.topup = new Chart(ctxTopUp, {
      type: "doughnut",
      data: {
        labels: ["Rechargeable", "Usage unique"],
        datasets: [{
          data: [tu.count_yes, tu.count_no],
          backgroundColor: ["#10b981", "#334155"],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "68%",
        plugins: {
          legend: { position: "bottom", labels: { color: "#64748b", padding: 12, font: { size: 11 } } },
          tooltip: {
            backgroundColor: tooltipBg, borderColor: tooltipBorder, borderWidth: 1,
            titleColor: "#f1f5f9", bodyColor: "#94a3b8",
            callbacks: {
              label: (ctx) => {
                const isYes = ctx.dataIndex === 0;
                const count = isYes ? tu.count_yes : tu.count_no;
                const pct   = isYes ? tu.pct_yes   : tu.pct_no;
                const avg   = isYes ? tu.avg_price_yes : tu.avg_price_no;
                return `${ctx.label}: ${count.toLocaleString()} (${pct}%) — Prix moy: ${avg.toFixed(2)} €`;
              }
            }
          }
        }
      }
    });
  }

  // Chart 5: Price Distribution Buckets
  const ctxPriceBuckets = document.getElementById("chartPriceBuckets")?.getContext("2d");
  if (ctxPriceBuckets) {
    const buckets = state.summary.price_distribution;
    state.charts.priceBuckets = new Chart(ctxPriceBuckets, {
      type: "bar",
      data: {
        labels: buckets.map(b => b.bucket),
        datasets: [{
          label: "Nombre d'offres",
          data: buckets.map(b => b.count),
          backgroundColor: ["rgba(96,165,250,0.5)","rgba(59,130,246,0.65)","rgba(37,99,235,0.8)","rgba(29,78,216,0.9)","rgba(239,68,68,0.8)"],
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: tooltipBg, borderColor: tooltipBorder, borderWidth: 1,
            titleColor: "#f1f5f9", bodyColor: "#94a3b8",
            callbacks: { label: (ctx) => `${ctx.raw} offres (${buckets[ctx.dataIndex].pct}%)` }
          }
        },
        scales: {
          y: {
            grid: { color: darkGrid }, ticks: { color: darkTick },
            title: { display: true, text: "Nombre de forfaits", color: darkTick }
          },
          x: { grid: { display: false }, ticks: { color: darkTick } }
        }
      }
    });
  }

  // Chart 6: Validity Days
  const ctxValidity = document.getElementById("chartValidity")?.getContext("2d");
  if (ctxValidity) {
    const val = state.summary.validity;
    state.charts.validity = new Chart(ctxValidity, {
      type: "bar",
      data: {
        labels: val.map(v => v.label),
        datasets: [
          {
            type: "bar",
            label: "Volume d'offres",
            data: val.map(v => v.count),
            backgroundColor: "rgba(59,130,246,0.6)",
            yAxisID: "yVolume",
            borderRadius: 6
          },
          {
            type: "line",
            label: "Prix moyen (€)",
            data: val.map(v => v.avg_price),
            borderColor: "#f59e0b",
            backgroundColor: "rgba(245,158,11,0.15)",
            yAxisID: "yPrice",
            tension: 0.3,
            borderWidth: 2.5,
            pointRadius: 4,
            pointBackgroundColor: "#f59e0b"
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: "#64748b", font: { size: 11 } } },
          tooltip: { backgroundColor: tooltipBg, borderColor: tooltipBorder, borderWidth: 1, titleColor: "#f1f5f9", bodyColor: "#94a3b8" }
        },
        scales: {
          yVolume: {
            type: "linear", position: "left",
            title: { display: true, text: "Nombre d'offres", color: darkTick },
            grid: { color: darkGrid }, ticks: { color: darkTick }
          },
          yPrice: {
            type: "linear", position: "right",
            title: { display: true, text: "Prix moyen (€)", color: darkTick },
            grid: { display: false }, ticks: { color: darkTick }
          },
          x: { grid: { display: false }, ticks: { color: darkTick } }
        }
      }
    });
  }
}

// Interactive Filter Setup
function initFilters() {
  const searchInput = document.getElementById("searchInput");
  const filterProvider = document.getElementById("filterProvider");
  const filterNetwork = document.getElementById("filterNetwork");
  const filterTopup = document.getElementById("filterTopup");
  const filterMaxPrice = document.getElementById("filterMaxPrice");
  const maxPriceVal = document.getElementById("maxPriceVal");
  const resetBtn = document.getElementById("resetFiltersBtn");
  const exportBtn = document.getElementById("exportCsvBtn");
  const pageSizeSelect = document.getElementById("pageSizeSelect");

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      state.filters.query = e.target.value.toLowerCase().trim();
      state.currentPage = 1;
      applyFilters();
    });
  }

  if (filterProvider) {
    filterProvider.addEventListener("change", (e) => {
      state.filters.provider = e.target.value;
      state.currentPage = 1;
      applyFilters();
    });
  }

  if (filterNetwork) {
    filterNetwork.addEventListener("change", (e) => {
      state.filters.network = e.target.value;
      state.currentPage = 1;
      applyFilters();
    });
  }

  if (filterTopup) {
    filterTopup.addEventListener("change", (e) => {
      state.filters.topup = e.target.value;
      state.currentPage = 1;
      applyFilters();
    });
  }

  if (filterMaxPrice) {
    filterMaxPrice.addEventListener("input", (e) => {
      state.filters.maxPrice = parseFloat(e.target.value);
      if (maxPriceVal) maxPriceVal.textContent = `${state.filters.maxPrice} €`;
      state.currentPage = 1;
      applyFilters();
    });
  }

  if (pageSizeSelect) {
    pageSizeSelect.addEventListener("change", (e) => {
      state.pageSize = parseInt(e.target.value, 10);
      state.currentPage = 1;
      renderTable();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      state.filters = {
        query: "",
        provider: "all",
        network: "all",
        topup: "all",
        maxPrice: 200,
        minData: 0
      };
      if (searchInput) searchInput.value = "";
      if (filterProvider) filterProvider.value = "all";
      if (filterNetwork) filterNetwork.value = "all";
      if (filterTopup) filterTopup.value = "all";
      if (filterMaxPrice) {
        filterMaxPrice.value = 200;
        if (maxPriceVal) maxPriceVal.textContent = "200 €";
      }
      state.currentPage = 1;
      applyFilters();
    });
  }

  if (exportBtn) {
    exportBtn.addEventListener("click", exportFilteredCsv);
  }

  // Column header sorting
  document.querySelectorAll("[data-sort-col]").forEach(th => {
    th.addEventListener("click", () => {
      const col = th.getAttribute("data-sort-col");
      if (state.sortCol === col) {
        state.sortAsc = !state.sortAsc;
      } else {
        state.sortCol = col;
        state.sortAsc = true;
      }
      sortCatalog();
      renderTable();
    });
  });
}

// Apply Filters to Catalog
function applyFilters() {
  const { query, provider, network, topup, maxPrice } = state.filters;

  state.filteredCatalog = state.catalog.filter(item => {
    // Search query
    if (query) {
      const matchText = `${item.sku} ${item.prov} ${item.name} ${item.country} ${item.cc}`.toLowerCase();
      if (!matchText.includes(query)) return false;
    }

    // Provider
    if (provider !== "all" && item.prov !== provider) return false;

    // Network
    if (network !== "all" && item.net !== network) return false;

    // Top-up
    if (topup !== "all" && item.topup !== topup) return false;

    // Max Price
    if (item.price > maxPrice) return false;

    return true;
  });

  sortCatalog();
  renderTable();
}

// Sort Catalog
function sortCatalog() {
  const col = state.sortCol;
  const asc = state.sortAsc;

  state.filteredCatalog.sort((a, b) => {
    let valA = a[col];
    let valB = b[col];

    // Handle null data_gb (unlimited)
    if (col === "gb") {
      valA = valA === null ? 9999 : valA;
      valB = valB === null ? 9999 : valB;
    }

    if (valA === undefined || valA === null) return 1;
    if (valB === undefined || valB === null) return -1;

    if (typeof valA === "string") {
      return asc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return asc ? valA - valB : valB - valA;
  });
}

// Render Table Page
function renderTable() {
  const tbody = document.getElementById("catalogTableBody");
  const countLabel = document.getElementById("tableFilteredCount");
  const paginationControls = document.getElementById("paginationControls");

  if (!tbody) return;

  const total = state.filteredCatalog.length;
  if (countLabel) {
    countLabel.textContent = `${total.toLocaleString("fr-FR")} offre${total > 1 ? "s" : ""} trouvée${total > 1 ? "s" : ""} sur ${state.catalog.length.toLocaleString("fr-FR")}`;
  }

  if (total === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center py-16 text-slate-500">
      <div class="text-4xl mb-3">🔍</div>
      <div class="text-sm font-semibold text-slate-400">Aucun forfait ne correspond à vos critères.</div>
      <p class="text-xs mt-1 text-slate-600">Ajustez vos filtres ou réinitialisez la recherche.</p>
    </td></tr>`;
    if (paginationControls) paginationControls.innerHTML = "";
    return;
  }

  const startIdx = (state.currentPage - 1) * state.pageSize;
  const endIdx = Math.min(startIdx + state.pageSize, total);
  const pageItems = state.filteredCatalog.slice(startIdx, endIdx);

  tbody.innerHTML = pageItems.map(item => {
    const isUnlimited = item.gb === null;
    const isOver100 = item.price > 100;
    const is5G = item.net === "5G";
    const isTopup = item.topup === "oui";

    return `
      <tr class="text-sm transition-colors">
        <td class="py-3 px-4 font-mono text-xs text-slate-600">${escapeHtml(item.sku)}</td>
        <td class="py-3 px-4">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full shrink-0 ${isUnlimited ? 'bg-purple-500' : 'bg-blue-500'}"></span>
            <span class="font-semibold text-slate-200">${escapeHtml(item.prov)}</span>
          </div>
        </td>
        <td class="py-3 px-4">
          <div class="font-medium text-slate-200">${escapeHtml(item.country)}</div>
          <div class="text-xs text-slate-600">${escapeHtml(item.name)}</div>
        </td>
        <td class="py-3 px-4">
          ${isUnlimited
            ? `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-400 border border-purple-500/20">Illimité</span>`
            : `<span class="font-bold text-slate-200">${item.gb} Go</span>`
          }
        </td>
        <td class="py-3 px-4 text-slate-400 text-xs">${item.days}j</td>
        <td class="py-3 px-4 font-bold ${isOver100 ? 'text-amber-400' : 'text-slate-100'}">
          ${item.price.toFixed(2)} €
          ${isOver100 ? '<span class="ml-1 text-[10px] bg-amber-500/15 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/20 font-normal">Premium</span>' : ''}
        </td>
        <td class="py-3 px-4">
          <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${is5G ? 'bg-purple-500/15 text-purple-400 border border-purple-500/20' : 'bg-slate-500/15 text-slate-400 border border-slate-500/20'}">
            ${item.net}
          </span>
        </td>
        <td class="py-3 px-4">
          <span class="inline-flex items-center gap-1.5 text-xs font-medium ${isTopup ? 'text-emerald-400' : 'text-slate-600'}">
            <span class="w-1.5 h-1.5 rounded-full ${isTopup ? 'bg-emerald-500' : 'bg-slate-600'}"></span>
            ${isTopup ? 'Rechargeable' : 'Usage unique'}
          </span>
        </td>
      </tr>
    `;
  }).join("");

  renderPagination(total);
}

// Render Pagination Buttons
function renderPagination(total) {
  const container = document.getElementById("paginationControls");
  if (!container) return;

  const totalPages = Math.ceil(total / state.pageSize);
  if (totalPages <= 1) {
    container.innerHTML = "";
    return;
  }

  let html = `<div class="flex items-center gap-1 text-xs">`;
  
  // Previous button
  html += `<button class="px-3 py-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40" 
    ${state.currentPage === 1 ? 'disabled' : ''} onclick="goToPage(${state.currentPage - 1})">Précédent</button>`;

  // Page Numbers
  const maxButtons = 5;
  let startPage = Math.max(1, state.currentPage - 2);
  let endPage = Math.min(totalPages, startPage + maxButtons - 1);
  if (endPage - startPage < maxButtons - 1) {
    startPage = Math.max(1, endPage - maxButtons + 1);
  }

  for (let p = startPage; p <= endPage; p++) {
    html += `<button class="px-3 py-1.5 rounded ${p === state.currentPage ? 'bg-blue-600 text-white font-semibold' : 'border border-slate-200 text-slate-700 hover:bg-slate-50'}" onclick="goToPage(${p})">${p}</button>`;
  }

  // Next button
  html += `<button class="px-3 py-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40" 
    ${state.currentPage === totalPages ? 'disabled' : ''} onclick="goToPage(${state.currentPage + 1})">Suivant</button>`;

  html += `<span class="ml-2 text-slate-400 text-xs">Page ${state.currentPage} sur ${totalPages}</span></div>`;
  container.innerHTML = html;
}

window.goToPage = function(page) {
  const totalPages = Math.ceil(state.filteredCatalog.length / state.pageSize);
  if (page >= 1 && page <= totalPages) {
    state.currentPage = page;
    renderTable();
  }
};

// Export Filtered Table to CSV
function exportFilteredCsv() {
  if (state.filteredCatalog.length === 0) {
    alert("Aucune donnée à exporter.");
    return;
  }

  const headers = ["SKU", "Fournisseur", "Produit", "Code Pays", "Destination", "Data (Go)", "Affichage", "Validité (Jours)", "Prix (EUR)", "Réseau", "Rechargeable"];
  const rows = state.filteredCatalog.map(item => [
    item.sku,
    item.prov,
    `"${item.name.replace(/"/g, '""')}"`,
    item.cc,
    `"${item.country.replace(/"/g, '""')}"`,
    item.gb !== null ? item.gb : "Illimité",
    `"${item.disp.replace(/"/g, '""')}"`,
    item.days,
    item.price.toFixed(2),
    item.net,
    item.topup
  ]);

  const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `mybestsim_export_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Cruise Simulator Logic
function initSimulator() {
  const btn = document.getElementById("simCalculateBtn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const dest = document.getElementById("simDest")?.value || "med";
    const seaNeed = document.getElementById("simSeaNeed")?.value || "no";
    const duration = document.getElementById("simDuration")?.value || "7";
    const resultBox = document.getElementById("simResult");

    if (!resultBox) return;

    let recTitle = "";
    let recBadge = "";
    let recDesc = "";
    let recPrice = "";
    let recProvider = "";
    let warning = "";

    if (seaNeed === "yes") {
      recTitle = "Formule Haute Mer & Escales Hybride";
      recBadge = "Connexion Partout (Au Large + Terre)";
      recProvider = "GigSky Cruise + Land";
      recPrice = duration === "7" ? "Env. 35 € - 45 €" : "Env. 60 € - 85 €";
      recDesc = "Idéal si vous devez impérativement recevoir vos e-mails professionnels ou rester en contact avec vos proches pendant la navigation en haute mer. Fonctionne sur le réseau satellite maritime (WMS / Cellular at Sea de +200 navires) ET sur les antennes 4G/5G des ports d'escale.";
      warning = "Bien plus avantageux que le Wi-Fi paquebot vendu à 20-30 €/jour par personne, et 100x moins cher que le roaming maritime sauvage de votre opérateur classique !";
    } else {
      recTitle = "Formule Escales Malin & Économique (Top Recommandation)";
      recBadge = "100% Escales 4G/5G Sans Stress";
      recProvider = dest === "caraibes" ? "Airalo / Saily (Pack Caraïbes)" : "Airalo Eurolink / Saily Europe";
      recPrice = duration === "7" ? "Env. 7 € - 14 €" : "Env. 15 € - 24 €";
      recDesc = "La stratégie des croisiéristes avertis ! Vous profitez d'une 4G/5G ultra-rapide dès que le bateau approche des côtes et durant toutes vos excursions au port. En mer, mettez votre téléphone en mode avion et profitez des spectacles, piscines et de la déconnexion.";
      warning = "Pensez à désactiver l'itinérance sur votre SIM française dès que le navire quitte le quai pour bloquer tout piratage maritime !";
    }

    resultBox.innerHTML = `
      <div class="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl shadow-sm animate-fade-in">
        <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
          <span class="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">${recBadge}</span>
          <span class="text-sm font-semibold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">${recPrice}</span>
        </div>
        <h4 class="text-xl font-bold text-slate-900 mb-2">${recTitle}</h4>
        <div class="text-blue-900 font-semibold mb-3 flex items-center gap-2">
          <span>Opérateur recommandé :</span> 
          <span class="underline decoration-blue-500 font-bold text-blue-700">${recProvider}</span>
        </div>
        <p class="text-slate-700 text-sm mb-4 leading-relaxed">${recDesc}</p>
        <div class="p-3 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg text-amber-900 text-xs mb-4">
          <strong>Astuce MyBestSim :</strong> ${warning}
        </div>
        <a href="#dashboard" onclick="filterCatalogByProvider('${recProvider.split(' ')[0]}')" class="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow transition-all">
          Voir les offres ${recProvider.split(' ')[0]} disponibles
        </a>
      </div>
    `;
    resultBox.classList.remove("hidden");
  });
}

window.filterCatalogByProvider = function(provName) {
  const provSelect = document.getElementById("filterProvider");
  if (provSelect) {
    provSelect.value = provName;
    state.filters.provider = provName;
    applyFilters();
    // switch to dashboard tab
    const dashBtn = document.querySelector('[data-tab-target="dashboard"]');
    if (dashBtn) dashBtn.click();
  }
};

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
