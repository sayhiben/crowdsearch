function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("Sheet1");
    const imageUrlsJson = JSON.stringify(data.imageUrls || []);

    // Append row
    const newRow = [
      new Date(),
      data.eventTitle || "",
      data.eventDate || "",
      data.location || "",
      data.description || "",
      imageUrlsJson,
      data.sourcePage || "",
      data.sourceLink || ""
    ];
    sheet.appendRow(newRow);

    // Construct JSON response
    Logger.log("creating success json")
    const successJson = JSON.stringify({ status: "success" });
    Logger.log(successJson)

    // Build the output with correct MIME & CORS
    return ContentService.createTextOutput(successJson).setMimeType(ContentService.MimeType.JSON)

  } catch (error) {
    // Return an error JSON
    Logger.log("creating errjson")
    const errJson = JSON.stringify({ status: "error", message: error.toString() });
    Logger.log(error)
    return ContentService.createTextOutput(errJson).setMimeType(ContentService.MimeType.JSON);
  }
}