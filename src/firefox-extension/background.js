/*** 
 * This file is the background script for the Firefox extension.
 * It listens for messages from the popup and content scripts, and
 * manages the search state and search sites.
*/

//**********
//#region Configuration Variables 
//**********

let searchSites = []
let sheetURL = ""
let webAppUrl = ""

//**********
//#region State Variables
//**********

const defaultSearchProgress = {
  siteIndex: 0,
  inProgress: false
};

//**********
//#region Functions to update configuration from local storage
//**********

function updateConfigFromStorage() {
  // Load search sites
  browser.storage.local.get("searchSites").then(result => {
    if (result.searchSites && result.searchSites.trim()) {
      searchSites = result.searchSites
        .split("\n")
        .map(line => line.trim())
        .filter(line => line.length > 0);
    } 
  });

  // Load Google Sheet URL
  browser.storage.local.get("sheetUrl").then(result => {
    if (result.sheetUrl) {
      sheetUrl = result.sheetUrl;
    }
  });

  // Load Google Apps Script URL
  browser.storage.local.get("webAppUrl").then(result => {
    if (result.webAppUrl) {
      webAppUrl = result.webAppUrl;
    }
  });
}

//**********
//#region Search state handlers
//**********

function openCurrentSearch() {
  Promise.all([
    browser.storage.local.get("searchProgress"),
    browser.storage.local.get("searchSites")
  ])
    .then(values => {
      const searchProgress = values[0].searchProgress || { ...defaultSearchProgress };
      const storedSearchSites = values[1].searchSites || "";

      if (!searchProgress.inProgress) {
        return;
      }

      const urls = storedSearchSites
        .split("\n")
        .map(u => u.trim())
        .filter(u => u.length > 0);
     
      if (searchProgress.siteIndex >= urls.length) {
        alertAllDone();
        return;
      }
      
      const searchUrl = urls[searchProgress.siteIndex];

      // Update the currently active tab
      browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
        if (tabs[0]) {
          browser.tabs.update(tabs[0].id, { url: searchUrl });
        }
      });
    }
  );
}

function startSearch() {
  const state = { siteIndex: 0, inProgress: true };
  browser.storage.local.set({ searchProgress: state }).then(() => {
    openCurrentSearch();
  });
}

function nextSite() {
  browser.storage.local.get("searchProgress").then(result => {
    let state = result.searchProgress || { ...defaultSearchProgress };
    state.siteIndex++;
    browser.storage.local.set({ searchProgress: state }).then(() => {
      openCurrentSearch();
    });
  });
}

function prevSite() {
  browser.storage.local.get("searchProgress").then(result => {
    let state = result.searchProgress || { ...defaultSearchProgress };
    if (state.siteIndex > 0) {
      state.siteIndex--;
      browser.storage.local.set({ searchProgress: state }).then(() => {
        openCurrentSearch();
      });
    }
  });
}

function finishSearch() {
  // Reset progress
  browser.storage.local.set({ searchProgress: { ...defaultSearchProgress } });
}

function alertAllDone() {
  browser.storage.local.set({ searchProgress: { ...defaultSearchProgress } });
  browser.notifications.create({
    type: "basic",
    title: "Crowdsearch",
    message: "All searches completed!"
  });
}

//**********
//#region Menu button handlers
//**********

function openSheet() {
  if (sheetURL) {
    browser.tabs.create({ url: sheetURL });
  } else {
    alert("Google Sheet URL not configured. Please set it in options.");
  }
}

function openSettings() {
  if (browser.runtime.openOptionsPage) {
    browser.runtime.openOptionsPage();
  } else {
    browser.tabs.create({ url: browser.runtime.getURL("options.html") });
  }
}

//**********
//#region Event submission handler(s)
//**********

function submitEventData(message, sender, sendResponse) {
  const eventData = message.eventData;

  fetch(webAppUrl, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify(eventData)
  })
    .then(resp => resp.text())
    .then(text => {
      // Optionally, parse the text into JSON here if needed.
      sendResponse({ success: true, data: text });
    })
    .catch(err => {
      sendResponse({ success: false, error: err.toString() });
    });
  return true;
}

//**********
//#region Message Listeners
// 
// The background script listens for messages from the popup and content scripts.
// When a message is received, it updates the search state or sends a message to the content script.
//
//**********

const eventHandlerMap = {
  submitEventData: submitEventData,
  startSearch: startSearch,
  nextSite: nextSite,
  prevSite: prevSite,
  openSheet: openSheet,
  openSettings: openSettings
};

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const handler = eventHandlerMap[message.type];
  if (handler) {
    return handler(message, sender, sendResponse);
  }
});

//**********
//#region Initialization
//**********

updateConfigFromStorage();
browser.storage.onChanged.addListener(updateConfigFromStorage);