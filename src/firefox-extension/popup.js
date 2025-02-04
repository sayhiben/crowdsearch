// popup.js
document.addEventListener("DOMContentLoaded", () => {
  // Update UI to reflect current progress
  updateUI();

  document.getElementById("start-search").addEventListener("click", () => {
    browser.runtime.sendMessage({ type: "startSearch" });
    window.close();
  });

  document.getElementById("next-site").addEventListener("click", async () => {
    const { searchProgress } = await browser.storage.local.get("searchProgress");
    const index = (searchProgress && searchProgress.siteIndex) || 0;

    const { searchSites } = await browser.storage.local.get("searchSites");
    const sites = (searchSites || "")
      .split("\n")
      .map(u => u.trim())
      .filter(u => u.length > 0);

    // If already on the last site, finishing will reset progress
    if (searchProgress && searchProgress.inProgress && index >= sites.length - 1) {
      browser.runtime.sendMessage({ type: "finishSearch" });
      window.close();
    } else {
      browser.runtime.sendMessage({ type: "nextSite" });
      window.close();
    }
  });

  document.getElementById("prev-site").addEventListener("click", () => {
    browser.runtime.sendMessage({ type: "prevSite" });
    window.close();
  });

  document.getElementById("manual-add").addEventListener("click", () => {
    browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
      if (tabs[0]) {
        browser.tabs.sendMessage(tabs[0].id, { type: "openManualAdd" });
      }
    });
    window.close();
  });

  document.getElementById("open-sheet").addEventListener("click", () => {
    browser.runtime.sendMessage({ type: "openSheet" });
    window.close();
  });

  document.getElementById("settings").addEventListener("click", () => {
    browser.runtime.sendMessage({ type: "openSettings" });
    window.close();
  });
});

/**
 * Updates the popup UI to show the user's progress, and enable/disable buttons.
 */
async function updateUI() {
  let [{ searchProgress }, { searchSites }] = await Promise.all([
    browser.storage.local.get("searchProgress"),
    browser.storage.local.get("searchSites")
  ]);

  const statusEl = document.getElementById("status");
  const prevBtn = document.getElementById("prev-site");
  const nextBtn = document.getElementById("next-site");

  // Parse the search sites from storage (multiline -> array)
  const sites = (searchSites || "")
    .split("\n")
    .map(url => url.trim())
    .filter(url => url.length > 0);

  // No active search?
  if (!searchProgress || !searchProgress.inProgress) {
    statusEl.textContent = "No search in progress";
    prevBtn.disabled = true;
    nextBtn.disabled = true;
    return;
  }

  const index = searchProgress.siteIndex || 0;
  const total = sites.length;

  statusEl.textContent = `Search Page ${index + 1} of ${total}`;

  // Disable prev if index == 0
  prevBtn.disabled = (index === 0);

  // If at the last index, next button is "Finish"
  if (index === total - 1) {
    nextBtn.textContent = "Finish";
  } else {
    nextBtn.textContent = "Next Site";
  }
}