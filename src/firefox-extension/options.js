document.getElementById("save").addEventListener("click", () => {
  const sheetUrl = document.getElementById("sheet-url").value.trim();
  const webAppUrl = document.getElementById("webapp-url").value.trim();
  const searchSites = document.getElementById("search-sites").value.trim();

  if (!sheetUrl) {
    alert("Please enter a valid Google Sheet URL.");
    return;
  }
  if (!webAppUrl) {
    alert("Please enter a valid Google Apps Script Web App URL.");
    return;
  }
  if (!searchSites) {
    alert("Please enter at least one search site.");
    return;
  }
  
  browser.storage.local.set({
    sheetUrl: sheetUrl,
    webAppUrl: webAppUrl,
    searchSites: searchSites
  }).then(() => {
    alert("Settings saved.");
  });
});