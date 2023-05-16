const { GoogleAuth } = require("googleapis").google.auth;

function generateAuth() {
  return new GoogleAuth({
    keyFile: "./credentials-google.json",
    scopes: [
      "https://www.googleapis.com/auth/drive.file",
      "https://www.googleapis.com/auth/spreadsheets",
    ],
  });
}

module.exports = {
  generateAuth,
};
