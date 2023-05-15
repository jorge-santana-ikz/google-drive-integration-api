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
  const mimeType = "pplication/vnd.google-apps.spreadsheet";
  const fileName = "test";

  // Get the ID of the Excel sheet you
  try {
    // Get the ID of the Excel sheet you want to update from the Google Drive API
    const fileResponse = await drive.files.list({
      q: `mimeType='${mimeType}' and trashed=false and name='${fileName}'`,
      fields: "nextPageToken, files(id, name)",
      spaces: "drive",
    });

    // Update the Excel sheet using the Google Sheets API
    const sheetRange = "Sheet1";
    const resource = {
      values: [
        ["Name", "Age"],
        ["John", "30"],
        ["Jane", "25"],
      ],
    };

    let fileId;
    if (fileResponse.data.files?.length) {
      fileId = fileResponse.data.files[0].id;
    } else {
      const createResponse = drive.files.create({
        resource: {
          name: fileName,
          mimeType,
        },
        fields: "id",
      });
      fileId = createResponse.data.id;
    }

    const result = await sheets.spreadsheets.create({
      resource: {
        properties: {
          title: "test",
        },
      },
      fields: "spreadsheetId",
    });
    const updateResponse = await sheets.spreadsheets.values.update({
      spreadsheetId: result.data.spreadsheetId,
      range: sheetRange,
      valueInputOption: "USER_ENTERED",
      resource,
    });
    console.log({ updateResponseData: updateResponse.data });
    const updatedValues = updateResponse.data.updatedCells;
    res.send(`Updated ${updatedValues} cells in the Excel sheet.`);
  } catch (error) {
    console.error(error);
    res.send("Error updating Excel sheet.");
  }
});

module.exports = router;
