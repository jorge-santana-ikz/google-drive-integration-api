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
  const mimeType = "application/vnd.google-apps.spreadsheet";
  const fileName = "test4";

  // Get the ID of the Excel sheet you
  try {
    // Get the ID of the Excel sheet you want to update from the Google Drive API
    const fileResponse = await drive.files.list({
      q: `mimeType='${mimeType}' and trashed=false and name='${fileName}'`,
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
    let permissionList;
    if (fileResponse.data.files?.length) {
      fileId = fileResponse.data.files[0].id;
      const {
        data: { permissions },
      } = await drive.permissions.list({
        fileId,
        fields: "permissions(id, type, role, emailAddress, pendingOwner)",
        supportsAllDrives: true,
      });
      permissionList = permissions;
      if (
        !permissions.some(
          ({ type, emailAddress }) =>
            type === "user" && emailAddress === process.env.OWNER_EMAIL
        )
      )
        await drive.files.delete({ fileId });
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
      const [{ data }] = await Promise.all([
        drive.permissions.create({
          requestBody: {
            type: "user",
            role: "writer",
            pendingOwner: true,
            emailAddress: process.env.OWNER_EMAIL,
          },
          fields: "id, role, emailAddress, pendingOwner",
          fileId,
        }),
        drive.permissions.create({
          resource: {
            type: "anyone",
            role: "reader",
          },
          fileId,
        }),
      ]);
      permissionList = [data];
    }
    await Promise.all(
      permissionList
        .filter(
          ({ emailAddress, role, pendingOwner }) =>
            emailAddress === process.env.OWNER_EMAIL &&
            role !== "owner" &&
            !pendingOwner
        )
        .map(async ({ id: permissionId }) =>
          drive.permissions.update({
            fileId,
            permissionId,
            requestBody: {
              role: "writer",
              pendingOwner: true,
            },
          })
        )
    );

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
