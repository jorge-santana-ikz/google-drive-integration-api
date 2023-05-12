const express = require("express");
const { google } = require("googleapis");
const auth = require("./auth");

const router = express.Router();

router.get("/auth", (req, res) => {
  const authUrl = auth.getAuthUrl();
  res.redirect(authUrl);
});

router.get("/oauth2callback", async (req, res) => {
  const { code } = req.query;
  const token = await auth.getAccessToken(code);
  res.redirect("/update-sheet?access_token=" + token.access_token);
});

router.get("/update-sheet", async (req, res) => {
  const authClient = new auth.generateAuth();
  const drive = google.drive({ version: "v3", auth: authClient });
  const sheets = google.sheets({ version: "v4", auth: authClient });

  // Get the ID of the Excel sheet you
  try {
    // Get the ID of the Excel sheet you want to update from the Google Drive API
    const fileResponse = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false and name='Your Excel Sheet Name'",
      fields: "nextPageToken, files(id, name)",
      spaces: "drive",
    });
    const fileId = fileResponse.data.files[0].id;

    // Update the Excel sheet using the Google Sheets API
    const sheetRange = "Sheet1!A1:B2";
    const sheetValues = [
      ["Name", "Age"],
      ["John", 30],
      ["Jane", 25],
    ];
    const updateRequest = {
      range: sheetRange,
      values: sheetValues,
      includeValuesInResponse: true,
      responseValueRenderOption: "FORMATTED_VALUE",
      responseDateTimeRenderOption: "SERIAL_NUMBER",
    };
    const updateResponse = sheets.spreadsheets.values.update({
      spreadsheetId: fileId,
      range: sheetRange,
      valueInputOption: "USER_ENTERED",
      requestBody: updateRequest,
    });
    const updatedValues = updateResponse.data.updatedData.values;
    res.send(`Updated ${updatedValues.length} rows in the Excel sheet.`);
  } catch (error) {
    console.error(error);
    res.send("Error updating Excel sheet.");
  }
});

module.exports = router;
