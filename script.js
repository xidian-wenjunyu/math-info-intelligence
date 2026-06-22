const speakerList = document.querySelector("#speakerList");
const searchInput = document.querySelector("#speakerSearch");
const resultCount = document.querySelector("#resultCount");
const yearFilter = document.querySelector("#yearFilter");
const pageSizeSelect = document.querySelector("#pageSize");
const prevPageButton = document.querySelector("#prevPage");
const nextPageButton = document.querySelector("#nextPage");
const pageInfo = document.querySelector("#pageInfo");
const prevReportPageButton = document.querySelector("#prevReportPage");
const nextReportPageButton = document.querySelector("#nextReportPage");
const reportPageInfo = document.querySelector("#reportPageInfo");
const reportPageSize = 10;
let tablePage = 1;
let reportPage = 1;

function statusRank(status) {
  const ranks = {
    upcoming: 0,
    ongoing: 1,
    recent: 2,
    completed: 3,
    planned: 4
  };
  return ranks[status] ?? 9;
}

function dateRank(value) {
  if (!value) return Number.POSITIVE_INFINITY;
  const stamp = Date.parse(`${value}T00:00:00`);
  return Number.isNaN(stamp) ? Number.POSITIVE_INFINITY : stamp;
}

function compareEntries(a, b) {
  const dateDiff = dateRank(b.dataset.date) - dateRank(a.dataset.date);
  if (dateDiff !== 0) return dateDiff;

  const statusDiff = statusRank(a.dataset.status) - statusRank(b.dataset.status);
  if (statusDiff !== 0) return statusDiff;

  return (a.dataset.reportId || "").localeCompare(b.dataset.reportId || "");
}

function sortReportEntries() {
  const tableBody = document.querySelector(".speaker-table tbody");
  if (!speakerList || !tableBody) return;

  const cards = [...speakerList.querySelectorAll(".speaker-card")];
  const rows = [...tableBody.querySelectorAll("tr")];

  rows.sort(compareEntries).forEach((row) => tableBody.appendChild(row));
  cards.sort(compareEntries).forEach((card) => speakerList.appendChild(card));
}

function entryMatches(entry, query, selectedYear) {
  const yearMatch = selectedYear === "all" || entry.dataset.year === selectedYear;
  const text = [
    entry.dataset.name,
    entry.dataset.affiliation,
    entry.dataset.topic,
    entry.textContent
  ].join(" ").toLowerCase();
  return yearMatch && text.includes(query);
}

function getPageSize(select) {
  const value = select ? select.value : "all";
  return value === "all" ? Infinity : Number(value);
}

function paginate(entries, page, pageSize) {
  const totalPages = pageSize === Infinity ? 1 : Math.max(1, Math.ceil(entries.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = pageSize === Infinity ? 0 : (safePage - 1) * pageSize;
  const end = pageSize === Infinity ? entries.length : start + pageSize;

  return {
    visible: new Set(entries.slice(start, end)),
    page: safePage,
    totalPages
  };
}

function updateTableResults(query, selectedYear) {
  const tableRows = [...document.querySelectorAll(".speaker-table tbody tr")];
  const pageSize = getPageSize(pageSizeSelect);
  const matches = tableRows.filter((row) => entryMatches(row, query, selectedYear));
  const result = paginate(matches, tablePage, pageSize);
  tablePage = result.page;

  tableRows.forEach((row) => {
    row.hidden = !result.visible.has(row);
  });

  if (resultCount) resultCount.textContent = `${matches.length} speaker${matches.length === 1 ? "" : "s"}`;
  if (pageInfo) pageInfo.textContent = `Page ${tablePage} / ${result.totalPages}`;
  if (prevPageButton) prevPageButton.disabled = tablePage <= 1;
  if (nextPageButton) nextPageButton.disabled = tablePage >= result.totalPages;
}

function updateReportResults(query, selectedYear) {
  const cards = [...speakerList.querySelectorAll(".speaker-card")];
  const matches = cards.filter((card) => entryMatches(card, query, selectedYear));
  const result = paginate(matches, reportPage, reportPageSize);
  reportPage = result.page;

  cards.forEach((card) => {
    card.hidden = !result.visible.has(card);
  });

  if (reportPageInfo) reportPageInfo.textContent = `Page ${reportPage} / ${result.totalPages}`;
  if (prevReportPageButton) prevReportPageButton.disabled = reportPage <= 1;
  if (nextReportPageButton) nextReportPageButton.disabled = reportPage >= result.totalPages;
}

function updateResults() {
  if (!speakerList || !searchInput) return;

  const query = searchInput.value.trim().toLowerCase();
  const selectedYear = yearFilter ? yearFilter.value : "all";

  updateTableResults(query, selectedYear);
  updateReportResults(query, selectedYear);
}

function resetAndUpdate() {
  tablePage = 1;
  reportPage = 1;
  updateResults();
}

if (searchInput) {
  sortReportEntries();
  searchInput.addEventListener("input", resetAndUpdate);
  yearFilter?.addEventListener("change", resetAndUpdate);
  pageSizeSelect?.addEventListener("change", () => {
    tablePage = 1;
    updateResults();
  });
  prevPageButton?.addEventListener("click", () => {
    tablePage = Math.max(1, tablePage - 1);
    updateResults();
  });
  nextPageButton?.addEventListener("click", () => {
    tablePage += 1;
    updateResults();
  });
  prevReportPageButton?.addEventListener("click", () => {
    reportPage = Math.max(1, reportPage - 1);
    updateResults();
  });
  nextReportPageButton?.addEventListener("click", () => {
    reportPage += 1;
    updateResults();
  });
  updateResults();
}
