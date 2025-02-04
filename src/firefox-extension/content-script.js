//**********
//#region Site Scrapers Configuration
//**********

/**
 * Each scraper object:
 * - name: string
 * - match: a regex that checks window.location.hostname
 * - getEventElements(): returns a NodeList or array of DOM elements that might contain event info
 * - parseEventElement(elem): returns an object { eventTitle, eventDate, location, description, imageUrls }
 * - (optional) injectButton(elem, button): custom logic to place the "Add to DB" button in the DOM
 *
 * Below are several scraper examples (bsky, facebook, instagram, twitter). 
 * Add or remove scrapers as needed for other domains.
 */
const siteScrapers = [
  {
    name: "bsky",
    match: /bsky\.app$/,
    getEventElements() {
      // Hypothetical selector example
      return document.querySelectorAll("[data-testid='postText']");
    },
    parseEventElement(elem) {
      const resultWrapper = elem.parentElement.parentElement;
      const eventTitle = elem.innerText.trim() || "Unknown Title";
      const eventDate = elem.innerText.trim() || "Unknown Date";
      const location = elem.innerText.trim() || "Unknown Location";
      const description = elem.innerText.trim() || "N/A";
      const imgElems = resultWrapper.querySelectorAll("img");
      const imageUrls = Array.from(imgElems).map(img => img.src);
      return { eventTitle, eventDate, location, description, imageUrls };
    }
  },
  {
    name: "facebook",
    match: /facebook\.com$/,
    getEventElements() {
      return document.querySelectorAll('[data-testid="event-card"]');
    },
    parseEventElement(elem) {
      const eventTitle =
        elem.querySelector("h2")?.innerText.trim() || "Unknown Title";
      const eventDate =
        elem.querySelector(".event-date-selector")?.innerText.trim() ||
        "Unknown Date";
      const location =
        elem.querySelector(".event-location-selector")?.innerText.trim() ||
        "Unknown Location";
      const description =
        elem.querySelector(".event-description-selector")?.innerText.trim() ||
        "N/A";
      const imgElems = elem.querySelectorAll("img");
      const imageUrls = Array.from(imgElems).map(img => img.src);
      return { eventTitle, eventDate, location, description, imageUrls };
    }
  },
  {
    name: "instagram",
    match: /instagram\.com$/,
    getEventElements() {
      return document.querySelectorAll(".instagram-event-card");
    },
    parseEventElement(elem) {
      const eventTitle =
        elem.querySelector(".insta-event-title")?.textContent.trim() ||
        "Unknown Title";
      const eventDate =
        elem.querySelector(".insta-event-date")?.textContent.trim() ||
        "Unknown Date";
      const location =
        elem.querySelector(".insta-event-location")?.textContent.trim() ||
        "Unknown Location";
      const description =
        elem.querySelector(".insta-event-description")?.textContent.trim() ||
        "N/A";
      const imgElems = elem.querySelectorAll(".insta-carousel img");
      const imageUrls = Array.from(imgElems).map(img => img.src);
      return { eventTitle, eventDate, location, description, imageUrls };
    }
  },
  {
    name: "twitter",
    match: /twitter\.com$/,
    getEventElements() {
      return document.querySelectorAll(".twitter-event-card");
    },
    parseEventElement(elem) {
      const eventTitle =
        elem.querySelector(".twitter-event-title")?.textContent.trim() ||
        "Unknown Title";
      const eventDate =
        elem.querySelector(".twitter-event-date")?.textContent.trim() ||
        "Unknown Date";
      const location =
        elem.querySelector(".twitter-event-location")?.textContent.trim() ||
        "Unknown Location";
      const description =
        elem.querySelector(".twitter-event-description")?.textContent.trim() ||
        "N/A";
      const imgElems = elem.querySelectorAll("img");
      const imageUrls = Array.from(imgElems).map(img => img.src);
      return { eventTitle, eventDate, location, description, imageUrls };
    }
  }
  // ... Add additional scrapers for Google, Reddit, TikTok, etc. ...
];

//**********
//#region Helper UI Components (Buttons & Form Fields)
//**********

/**
 * Default button injection if a scraper doesn't define its own injectButton method.
 * @param {Element} elem - The DOM element representing an event card
 * @param {HTMLButtonElement} button - The "Add to DB" button
 */
function injectButtonDefault(elem, button) {
  elem.appendChild(button);
}

/**
 * Creates the "Add to DB" button that, when clicked, opens an editable form so the user
 * can override event details before submission.
 * @param {Element} eventElem - The DOM element representing an event
 * @param {Function} parseFn - Function to parse event data from eventElem
 * @returns {HTMLButtonElement}
 */
function createAddButton(eventElem, parseFn) {
  const btn = document.createElement("button");
  btn.classList.add("crowdsearch-btn");
  btn.innerText = "Add to DB";
  btn.style.padding = "4px 8px";
  btn.style.margin = "4px";
  btn.style.backgroundColor = "#4CAF50";
  btn.style.color = "#fff";
  btn.style.border = "none";
  btn.style.cursor = "pointer";
  btn.style.zIndex = "999999999";

  btn.addEventListener(
    "click",
    (event) => {
      // Prevent clicks from bubbling up to parent elements
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      // Hide add buttons while parsing
      const addBtns = document.querySelectorAll(".crowdsearch-btn");
      addBtns.forEach(btn => (btn.style.display = "none"));

      // Parse
      const parsed = parseFn(eventElem);

      // Show add buttons again
      addBtns.forEach(btn => (btn.style.display = "block"));

      // Open form
      openEventForm(parsed, btn);
    },
    true
  );

  return btn;
}

/**
 * Utility function to update the original "Add" button’s style
 * based on submission status.
 *
 * @param {HTMLButtonElement} btn - The original "Add to DB" button
 * @param {("default"|"submitting"|"success"|"failed")} state
 * @param {string} [errorMessage] - Optional message to display on error.
 */
function updateAddButtonState(btn, state, errorMessage) {
  switch (state) {
    case "default":
      btn.disabled = false;
      btn.innerText = "Add to DB";
      btn.style.backgroundColor = "#4CAF50"; // green
      btn.style.color = "#fff";
      break;
    case "submitting":
      btn.disabled = true;
      btn.innerText = "Submitting...";
      btn.style.backgroundColor = "#607D8B"; // grayish
      btn.style.color = "#fff";
      break;
    case "success":
      btn.disabled = true;
      btn.innerText = "Submitted";
      btn.style.backgroundColor = "#388E3C"; // darker green
      btn.style.color = "#fff";
      break;
    case "failed":
      btn.disabled = false;
      btn.innerText = errorMessage || "Failed. Retry?";
      btn.style.backgroundColor = "#f44336"; // red
      btn.style.color = "#fff";
      break;
  }
}

/**
 * Helper to create a labeled text field.
 * @param {string} labelText
 * @param {string} defaultValue
 * @returns {Object} { label, input, value }
 */
function createTextField(labelText, defaultValue) {
  const label = document.createElement("div");
  label.innerText = labelText;
  label.style.marginTop = "10px";

  const input = document.createElement("input");
  input.type = "text";
  input.value = defaultValue;
  input.style.width = "100%";
  input.style.marginBottom = "5px";

  return {
    label,
    input,
    get value() {
      return input.value;
    }
  };
}

/**
 * Helper to create a labeled textarea.
 * @param {string} labelText
 * @param {string} defaultValue
 * @returns {Object} { label, textarea, value }
 */
function createTextArea(labelText, defaultValue) {
  const label = document.createElement("div");
  label.innerText = labelText;
  label.style.marginTop = "10px";

  const textarea = document.createElement("textarea");
  textarea.style.width = "100%";
  textarea.style.height = "60px";
  textarea.value = defaultValue;

  return {
    label,
    textarea,
    get value() {
      return textarea.value;
    }
  };
}

//**********
//#region Event Form Logic
//**********

/**
 * Injects or updates a <style> tag that applies our modal styles.
 * We use !important to prevent site-level CSS from interfering.
 */
function injectModalStyles() {
  // If our styles are already on the page, skip re-injecting
  if (document.getElementById("crowdsearch-modal-style")) return;

  const styleTag = document.createElement("style");
  styleTag.id = "crowdsearch-modal-style";
  styleTag.textContent = `
    .crowdsearch-overlay {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 100% !important;
      background-color: rgba(0, 0, 0, 0.7) !important;
      z-index: 999999999 !important;

      /* Center the modal in the viewport */
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    }

    .crowdsearch-modal {
      background: #fff !important;
      padding: 16px !important;
      border-radius: 8px !important;

      /* Let the modal size itself around its contents */
      width: auto !important;
      min-width: 400px !important; /* or 300px if you'd prefer narrower */
      max-width: 90vw !important;

      /* Remove internal scrollbars */
      height: auto !important;
      max-height: none !important;
      overflow: visible !important;

      box-sizing: border-box !important;
      color: #000 !important;
      font-family: Arial, sans-serif !important;
      font-size: 14px !important;
    }

    /* Remove extra space on the top label */
    .crowdsearch-modal label:first-of-type {
      margin-top: 0 !important;
    }

    /* Ensure consistent styling for form elements */
    .crowdsearch-modal label,
    .crowdsearch-modal input,
    .crowdsearch-modal textarea,
    .crowdsearch-modal button {
      display: block !important;
      width: 100% !important;
      margin-top: 6px !important;
      font-family: Arial, sans-serif !important;
      color: #000 !important;
    }

    /* Force light backgrounds (overriding any Dark Mode) */
    .crowdsearch-modal input,
    .crowdsearch-modal textarea {
      background-color: #fff !important;
      border: 1px solid #ccc !important;
      padding: 6px !important;
    }

    .crowdsearch-modal button {
      width: auto !important;
      cursor: pointer !important;
      padding: 8px 12px !important;
      border: none !important;
      background-color: #4CAF50 !important;
      color: #fff !important;
      margin-bottom: 0 !important; /* So buttons can sit side by side */
    }

    .crowdsearch-modal button:hover {
      background-color: #45a049 !important;
    }

    /* Buttons row: side by side, right-aligned */
    .crowdsearch-btn-row {
      display: flex !important;
      justify-content: flex-end !important;
      gap: 10px !important;
      margin-top: 12px !important;
    }

    .crowdsearch-error {
      color: red !important;
      margin-top: 10px !important;
      display: none !important;
    }
  `;
  document.head.appendChild(styleTag);
}

/**
 * Renders a popup form allowing the user to edit event details, then
 * submit them to the Google Apps Script.
 *
 * @param {Object} initialData - The parsed event data from the DOM.
 * @param {HTMLButtonElement} originalButton - The "Add to Database" button to update on success/fail.
 */
function openEventForm(initialData = {}, originalButton) {
  injectModalStyles();

  // Create overlay
  const overlay = document.createElement("div");
  overlay.className = "crowdsearch-overlay";

  // Create form container
  const formContainer = document.createElement("div");
  formContainer.className = "crowdsearch-modal";

  // Form fields
  const titleField = createTextField("Event Title", initialData.eventTitle || "");
  const dateField = createTextField("Event Date", initialData.eventDate || "");
  const locationField = createTextField("Location", initialData.location || "");
  const descField = createTextArea("Description", initialData.description || "");
  const imageLines = (initialData.imageUrls || []).join("\n");
  const imagesField = createTextArea("Image URLs (one per line)", imageLines);

  // A container to show error messages (instead of alert)
  const errorMsg = document.createElement("div");
  errorMsg.className = "crowdsearch-error";

  // Buttons row
  const btnRow = document.createElement("div");
  btnRow.className = "crowdsearch-btn-row";

  const submitBtn = document.createElement("button");
  submitBtn.innerText = "Submit";

  submitBtn.addEventListener("click", () => {
    // Hide any old error
    errorMsg.style.display = "none";
    errorMsg.innerText = "";

    const finalEventData = {
      eventTitle: titleField.value.trim(),
      eventDate: dateField.value.trim(),
      location: locationField.value.trim(),
      description: descField.value.trim(),
      imageUrls: imagesField.value
        .split("\n")
        .map(line => line.trim())
        .filter(line => line.length > 0),
      sourcePage: window.location.hostname,
      sourceLink: window.location.href
    };

    // Disable submit, show "Submitting..." text in the form
    submitBtn.disabled = true;
    submitBtn.innerText = "Submitting...";

    // Also reflect "Submitting..." on the original button
    updateAddButtonState(originalButton, "submitting");

    // Submit the data to the Google Apps Script endpoint
    browser.runtime
      .sendMessage({
        type: "submitEventData",
        eventData: finalEventData
      })
      .then(response => {
        if (response.success) {
          try {
            const data = JSON.parse(response.data);
            if (data.status === "success") {
              // Submission succeeded
              submitBtn.innerText = "Success!";
              submitBtn.style.backgroundColor = "#4CAF50";
  
              // Update original button to success state
              updateAddButtonState(originalButton, "success");
  
              // Close the form after a short delay or immediately
              setTimeout(() => {
                if (overlay.parentNode) {
                  document.body.removeChild(overlay);
                }
              }, 800);
  
            } else {
              // Script returned an error status
              throw new Error(data.message || "Unknown error from server");
            }
          } catch (err) {
            // JSON parse error or server error message
            handleError(err.toString());
          }
        } else {
          // response.success is false => fetch or network error
          throw new Error(response.error);
        }
      })
      .catch(err => {
        handleError(err.toString());
      });
  });

  const cancelBtn = document.createElement("button");
  cancelBtn.innerText = "Cancel";
  cancelBtn.addEventListener("click", () => {
    document.body.removeChild(overlay);
  });

  btnRow.appendChild(submitBtn);
  btnRow.appendChild(cancelBtn);

  // Helper function to handle errors gracefully
  function handleError(message) {
    // Re-enable the submit button in the form
    submitBtn.disabled = false;
    submitBtn.innerText = "Submit";
    submitBtn.style.backgroundColor = "";

    // Show error message in the form
    errorMsg.innerText = message;
    errorMsg.style.display = "block";

    // Mark the original button as failed (and allow retries)
    updateAddButtonState(originalButton, "failed", "Failed");
  }

  // Add fields to form container
  formContainer.appendChild(titleField.label);
  formContainer.appendChild(titleField.input);
  formContainer.appendChild(dateField.label);
  formContainer.appendChild(dateField.input);
  formContainer.appendChild(locationField.label);
  formContainer.appendChild(locationField.input);
  formContainer.appendChild(descField.label);
  formContainer.appendChild(descField.textarea);
  formContainer.appendChild(imagesField.label);
  formContainer.appendChild(imagesField.textarea);
  formContainer.appendChild(btnRow);

  overlay.appendChild(formContainer);
  document.body.appendChild(overlay);
}

//**********
//#region Main Injection & Observation
//**********

/**
 * Locates the scraper that matches the current domain, or returns null if none match.
 * @returns {Object|null}
 */
function findSiteScraper() {
  const hostname = window.location.hostname;
  for (let scraper of siteScrapers) {
    if (scraper.match.test(hostname)) {
      return scraper;
    }
  }
  return null;
}

/**
 * Injects "Add" buttons for all event elements found by the scraper.
 * @param {Object} scraper - The matched scraper for this domain
 */
function injectEventButtons(scraper) {
  const eventElems = scraper.getEventElements();
  if (!eventElems || eventElems.length === 0) return;

  eventElems.forEach(elem => {
    // Ensure we don't add multiple buttons to the same element
    if (!elem.dataset.addedButton) {
      const addBtn = createAddButton(elem, scraper.parseEventElement);
      if (typeof scraper.injectButton === "function") {
        scraper.injectButton(elem, addBtn);
      } else {
        injectButtonDefault(elem, addBtn);
      }
      elem.dataset.addedButton = "true";
    }
  });
}

/**
 * Starts a MutationObserver to continuously watch for new event elements
 * that might appear on dynamic/infinite scroll pages.
 * @param {Object} scraper - The matched scraper for this domain
 */
function startMutationObserver(scraper) {
  const observer = new MutationObserver(() => {
    injectEventButtons(scraper);
  });
  observer.observe(document.body, { childList: true, subtree: true });
  // Optionally store 'observer' if you need to disconnect later
}

/**
 * Main initialization for the content script.
 * 1) Find the matching scraper for this domain (if any).
 * 2) Start a MutationObserver to catch newly inserted elements.
 * 3) Inject a "Manually Add Event" button so the user can create an event from scratch.
 */
function initContentScript() {
  const scraper = findSiteScraper();

  if (!scraper) {
    console.log("No matching scraper found for this domain.");
    return;
  }

  // Start observer for dynamic content
  startMutationObserver(scraper);

  // Initial button injection (for existing elements)
  injectEventButtons(scraper);
}

//**********
//#region Runtime Message Listener
//**********

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "openManualAdd") {
    openEventForm({
      eventTitle: "",
      eventDate: "",
      location: "",
      description: "",
      imageUrls: []
    });
    sendResponse({ success: true });
  }
});

//**********
//#region Entry Point
//**********

initContentScript();