const express = require("express");
const { google } = require("googleapis");
const auth = require("./auth");

const router = express.Router();

router.get("/update-sheet", async (_req, res) => {
  const authClient = new auth.generateAuth();
  const drive = google.drive({ version: "v3", auth: authClient });
  const sheets = google.sheets({ version: "v4", auth: authClient });
  const mimeType = "application/vnd.google-apps.spreadsheet";
  const fileName = "test4";

  // Get the ID of the Excel sheet you
  try {
    // Get the ID of the Excel sheet you want to update from the Google Drive API
    const fileResponse = await drive.files.list({
      q: `mimeType='${mimeType}' and trashed=false and name='${fileName}'`,
      // fields: "nextPageToken, files(id, name)",
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
      const {
        data: { spreadsheetId },
      } = await sheets.spreadsheets.create({
        resource: {
          properties: {
            title: fileName,
          },
        },
        fields: "spreadsheetId",
      });
      fileId = spreadsheetId;
      await Promise.all([
        drive.permissions.create({
          resource: {
            type: "anyone",
            role: "reader",
          },
          fileId,
        }),
        drive.permissions.create({
          resource: {
            type: "user",
            role: "writer",
            emailAddress: process.env.OWNER_EMAIL,
          },
          fileId,
        }),
      ]);
    }
    const updateResponse = await sheets.spreadsheets.values.append({
      spreadsheetId: fileId,
      range: sheetRange,
      valueInputOption: "USER_ENTERED",
      resource,
    });
    const updatedValues = updateResponse.data.updates.updatedCells;
    res.send(`Updated ${updatedValues} cells in the Excel sheet.`);
  } catch (error) {
    console.error(error);
    res.send("Error updating Excel sheet.");
  }
});

module.exports = router;
