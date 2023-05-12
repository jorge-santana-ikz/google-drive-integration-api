const { OAuth2, GoogleAuth } = require("googleapis").google.auth;

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

function getAuthUrl() {
  const scopes = [
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/spreadsheets",
  ];
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
  });
}

function getAccessToken(code) {
  return new Promise((resolve, reject) => {
    oauth2Client.getToken(code, (err, token) => {
      if (err) {
        reject(err);
      } else {
        resolve(token);
      }
    });
  });
}
function generateAuth() {
  return new GoogleAuth({
    keyFile: "./credentials-google.json",
    scopes: ["https://www.googleapis.com/auth/drive.file"],
  });
}

module.exports = {
  getAuthUrl,
  getAccessToken,
  generateAuth,
};
