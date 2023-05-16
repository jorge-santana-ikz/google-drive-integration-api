# Test Google Drive

This is a simple Node.js API that integrates with google drive and google sheets. It creates and update a google sheet on google drive.

## Prerequisites

- Node.js and npm/yarn installed on your machine

## Instalation

1. Clone the repository:

```shell
git clone https://github.com/jorge-santana-ikz/test-google-drive
cd test-google-drive
```

2. Install the dependencies:

```shell
npm install
```

or

```shell
yarn
```

3. Enable Google API
  1. Go to [Google Console](https://console.cloud.google.com) and create a new project
  2. On the sidebar, click on `APIs & Services > Library`
  3. Search for `Google Drive API` and click it
  4. click on `Enable` button
  5. go back and search for `Google Sheets API` and click it
  6. click on `Enable` button

4. Create Credentials
  1. Go to [Google Console](https://console.cloud.google.com) and create a new project
  2. On the sidebar, click on `IAM & Admin" > "Service accounts`
  3. Click on `Create service account` button
  4. Enter a name for your service account and click "Create".
  5. On the "Grant this service account access to project" page, select the role `Owner` and click "Continue".
  6. On the "Create key" page, select "JSON" as the key type and click "Create".
  7. Save the JSON key file on the `test-google-drive` directory under the name `credentials-google.json`.

## Configuration

Copy the `.env.example` file content to a file named `.env`. Inside the file, set the `OWNER_EMAIL` variable to the email of your google account:

```
OWNER_EMAIL=myemail@gmail.com
```

## Usage

1. Start the API server:

```shell
node src/index.js
```

2. Make a GET request on http://localhost:3000/update-sheet to update a sheet in your google drive. If the file do not exist, it will be created.

## Additional Configuration

You can change the port the application is running if you want by changing the `PORT` variable in `.env` file
