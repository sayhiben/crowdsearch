# Crowdsearch Firefox Extension

A Firefox extension that helps users quickly collect event details from multiple websites and store them in a shared Google Sheet. Crowdsearch is intended to crowdsource recurring searches for concerts, protests, conferences, and other scheduled events.

---

## Project Description

**Crowdsearch** allows a group of users to gather details about upcoming events across supported sites:
- `bsky.app`

When you visit a search results page (e.g., searching for a specific hashtag, location, or keyword about events), the extension inserts an **"Add to DB"** button next to each recognized result. Clicking the button opens a small form to confirm or edit the event’s details before submitting them to a Google Sheet, which multiple people can access to track and promote the events together.

**Key Features**:
- Maintains a list of search result URLs, so you can open them one at a time.
- Inserts "Add to DB" buttons for each recognized event or post.
- Offers a modal form to review or edit the event’s details before submission.
- Submits the event data to a shared Google Sheet via a Google Apps Script web app.

---

## Installation (Contributing to a Shared Sheet)

If **someone else** has already set up the Crowdsearch extension and a **shared Google Sheet**, follow these steps to **install the extension** and start contributing:

1. **Obtain the XPI (Firefox Extension Package)**  
   Ask the project maintainer to provide you with the `.xpi` file for the extension or a link to install the extension from an add-on distribution channel.

2. **Install the Extension in Firefox**  
   - Open Firefox and go to `about:addons`.  
   - Click on the gear icon (⚙) in the top-right corner.  
   - Choose **“Install Add-on From File…”** (or a similarly labeled option).  
   - Select the `crowdsearch.xpi` file.  
   - When prompted, click **“Add”** to confirm installation.

3. **Open the Extension Popup**  
   - In the Firefox toolbar, look for the **Crowdsearch** icon (it may be tucked under the extension/puzzle icon if you have multiple add-ons).  
   - Click on it to open the **Crowdsearch** popup.

4. **Add the Shared Configuration**  
   - Ask the project maintainer for the **shared configuration** (Google Sheet URL, Google Apps Script Web App URL, and list of search URLs).  
   - Once you have these, click **“Settings”** in the extension’s popup.  
   - Paste the shared **Google Sheet URL** and **Web App URL** into the appropriate fields.  
   - Paste the list of search URLs into the appropriate field.
   - Click **“Save”**.

That’s it! You’re now ready to **Start Searching** (using the extension) and start adding events to the shared Google Sheet.

---

## Installation (Setting Up Your Own Google Sheet)

If you’d like to **host your own version** of the spreadsheet and script (for a private group or personal use), follow these steps:

1. **Create a New Google Sheet**  
   - Go to [Google Sheets](https://docs.google.com/spreadsheets/) and create a new, blank spreadsheet.  
   - If not already named this, rename the first sheet (bottom tab) to **“Sheet1”** (the extension assumes that name by default; may become configurable in the future).

2. **Open Apps Script**  
   - In the Google Sheet, go to **Extensions** > **Apps Script**.  
   - Delete any placeholder code, then paste in the contents of `src/google-apps-script/webApp.js`.  
   - Make sure your function is named `doPost(e)`.

3. **Deploy as a Web App**  
   - In the Apps Script editor, click **Deploy** > **New deployment**.  
   - For “Select type,” choose **Web app**.  
   - Set “Execute the app as” to **you**.  
   - Set “Who has access” to **Anyone** (or “Anyone with the link”) if you want others to be able to submit data.  
   - Click **Deploy**, then copy the **Web App URL** that’s generated.

4. **Set the Sheet URL and Web App URL in the Extension**  
   - Install the Crowdsearch Firefox extension (see **Steps 1-2** in the [Contributing to a Shared Sheet](#installation-contributing-to-a-shared-sheet) section).  
   - Once installed, open the **Crowdsearch** popup and click **“Settings.”**  
   - Paste your **Google Sheet’s Edit URL** into the **“Google Sheet URL”** field.  
     - This is typically:  
       `https://docs.google.com/spreadsheets/d/<YourSheetID>/edit`  
   - Paste your newly deployed **Web App URL** into the **“Google Apps Script Web App URL”** field.  
     - This looks like:  
       `https://script.google.com/macros/s/<YourScriptID>/exec`  
   - Add one or more **Search Sites** URLs, one per line. (Example below)  
     ```
     https://bsky.app/search?q=my+event
     https://www.google.com/search?q=my+event
     https://reddit.com/search?q=my+event
     ```  
   - Click **“Save”**.

5. **Test It Out**  
   - Return to the extension’s popup, and click **“Start Searching”** to begin.  
   - You should be able to open each site in turn and use the **“Add to DB”** buttons to submit events to your newly created Google Sheet.

---

## How to Use the Extension

Here’s a quick guide on **everyday usage**:

1. **Add your Search URLs**  
   - In the **Crowdsearch** popup, click **“Settings.”**  
   - In the **Search Sites** text area, paste each search results page URL on a new line.  
   - Example:  
     ```
     https://bsky.app/search?q=yourSearchQuery
     https://www.facebook.com/search/events/?q=yourSearchQuery
     https://www.reddit.com/search/?q=yourSearchQuery
     ```
   - Click **“Save.”**

2. **Start a Search**  
   - From the extension popup, click **“Start Searching”**.
   - The extension will open (or update) the active tab to the **first** site in your list.  

3. **Add Events to the Database (Google Sheet)**  
   - On each page, the extension attempts to find any post or event listing.  
   - You’ll see an **“Add to DB”** button appear next to recognized posts/events. 
   - Click **“Add to DB.”**.
     - A modal popup form will appear.  
     - Review or edit the **Title**, **Date**, **Location**, **Description**, and **Image URLs**.  
     - When ready, click **“Submit.”**  
   - The **original button** will change to **“Submitting…”**, then **“Submitted.”**

4. **Navigate Through Your List**  
   - In the **Crowdsearch** popup, you’ll see buttons for **“Next Site”**, **“Prev Site”**, etc.  
   - Click **“Next Site”** to move on to the next URL in your list.  
   - Once you reach the **final site** in your list, clicking **“Next Site”** will **Finish** the search, resetting the process.  

5. **Manually Add an Event**  
   - Sometimes you might be on a site that the extension doesn’t automatically detect (or you just want to add something manually).  
   - Open the **Crowdsearch** popup and click **“Manually Add Event.”**  
   - A blank form will appear, letting you fill out the details from scratch.  

6. **View or Edit the Google Sheet**  
   - From the extension popup, click **“Open Sheet”** to open the **Google Sheet** you specified in your settings.  
   - There you can view the submitted events, or share it with teammates.

---

## Contributing to the Project (Development Setup)

If you’d like to improve or customize this extension, you can **clone** and **build** it locally:

1. **Clone This Repository**  
   ```bash
   git clone https://github.com/sayhiben/crowdsearch.git
   cd crowdsearch
   ```
2. Load the Extension Temporarily in Firefox
    - Open Firefox and go to about:debugging#/runtime/this-firefox.
	  -	Click “Load Temporary Add-on…”.
	  -	Select the src/firefox-extension/manifest.json file in the cloned folder.
	  -	This loads the extension in a temporary, developer mode. Any changes you make can be reloaded here.
3. Testing Changes
    - After making edits, return to the about:debugging tab and click “Reload” under your extension’s listing.
    - Alternatively, remove it and re-add it.
4. Suggesting or Submitting Changes
    - If you see a bug or have a feature request, open an issue.
    - Pull requests are welcome! Please branch off main (or the designated stable branch).