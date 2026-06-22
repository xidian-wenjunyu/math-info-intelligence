const speakerList = document.querySelector("#speakerList");
const searchInput = document.querySelector("#speakerSearch");
const resultCount = document.querySelector("#resultCount");
const yearFilter = document.querySelector("#yearFilter");
const pageSizeSelect = document.querySelector("#pageSize");
const prevPageButton = document.querySelector("#prevPage");
const nextPageButton = document.querySelector("#nextPage");
const pageInfo = document.querySelector("#pageInfo");
const tableRows = [...document.querySelectorAll(".speaker-table tbody tr")];
let currentPage = 1;

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
  if (!value) return Number.NEGATIVE_INFINITY;
  const stamp = Date.parse(`${value}T00:00:00`);
  return Number.isNaN(stamp) ? Number.NEGATIVE_INFINITY : stamp;
}

function compareEntries(a, b) {
  const statusDiff = statusRank(a.dataset.status) - statusRank(b.dataset.status);
  if (statusDiff !== 0) return statusDiff;

  const dateDiff = dateRank(b.dataset.date) - dateRank(a.dataset.date);
  if (dateDiff !== 0) return dateDiff;

  return (a.dataset.reportId || "").localeCompare(b.dataset.reportId || "");
}

function sortReportEntries() {
  const tableBody = document.querySelector(".speaker-table tbody");
  const cards = [...speakerList.querySelectorAll(".speaker-card")];
  const rows = [...tableBody.querySelectorAll("tr")];

  rows.sort(compareEntries).forEach((row) => tableBody.appendChild(row));
  cards.sort(compareEntries).forEach((card) => speakerList.appendChild(card));
}

function updateResults() {
  if (!speakerList || !searchInput) return;

  const query = searchInput.value.trim().toLowerCase();
  const cards = [...speakerList.querySelectorAll(".speaker-card")];
  const selectedYear = yearFilter ? yearFilter.value : "all";
  const pageSizeValue = pageSizeSelect ? pageSizeSelect.value : "all";
  const pageSize = pageSizeValue === "all" ? Infinity : Number(pageSizeValue);

  const matches = cards.filter((card) => {
    const yearMatch = selectedYear === "all" || card.dataset.year === selectedYear;
    const text = [
      card.dataset.name,
      card.dataset.affiliation,
      card.dataset.topic,
      card.textContent
    ].join(" ").toLowerCase();
    return yearMatch && text.includes(query);
  });

  const totalPages = pageSize === Infinity ? 1 : Math.max(1, Math.ceil(matches.length / pageSize));
  currentPage = Math.min(currentPage, totalPages);
  const start = pageSize === Infinity ? 0 : (currentPage - 1) * pageSize;
  const end = pageSize === Infinity ? matches.length : start + pageSize;
  const visibleIds = new Set(matches.slice(start, end).map((card) => card.dataset.reportId));

  cards.forEach((card) => {
    card.hidden = !visibleIds.has(card.dataset.reportId);
  });

  tableRows.forEach((row) => {
    const text = [
      row.dataset.name,
      row.dataset.affiliation,
      row.dataset.topic,
      row.textContent
    ].join(" ").toLowerCase();
    const yearMatch = selectedYear === "all" || row.dataset.year === selectedYear;
    const match = yearMatch && text.includes(query);
    row.hidden = !match || !visibleIds.has(row.dataset.reportId);
  });

  if (resultCount) {
    resultCount.textContent = `${matches.length} speaker${matches.length === 1 ? "" : "s"}`;
  }
  if (pageInfo) pageInfo.textContent = `Page ${currentPage} / ${totalPages}`;
  if (prevPageButton) prevPageButton.disabled = currentPage <= 1;
  if (nextPageButton) nextPageButton.disabled = currentPage >= totalPages;
}

function resetAndUpdate() {
  currentPage = 1;
  updateResults();
}

if (searchInput) {
  sortReportEntries();
  searchInput.addEventListener("input", resetAndUpdate);
  yearFilter?.addEventListener("change", resetAndUpdate);
  pageSizeSelect?.addEventListener("change", resetAndUpdate);
  prevPageButton?.addEventListener("click", () => {
    currentPage = Math.max(1, currentPage - 1);
    updateResults();
  });
  nextPageButton?.addEventListener("click", () => {
    currentPage += 1;
    updateResults();
  });
  updateResults();
}
