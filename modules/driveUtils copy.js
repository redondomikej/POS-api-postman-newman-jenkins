const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");
const drive = google.drive("v3");

const SCOPES = ["https://www.googleapis.com/auth/drive.file"];
const SERVICE_ACCOUNT_FILE =
  "../collection_variables/gcc_connection/drive_cred.json"; // Ensure this path is correct

const auth = new google.auth.GoogleAuth({
  keyFile: SERVICE_ACCOUNT_FILE,
  scopes: SCOPES,
});

const service = google.drive({ version: "v3", auth });
const PARENT_FOLDER_ID = "1_5TPcCYBLEE-uEMoI0U-Z9dR8DYKKnZI";
// const LOCAL_FOLDER_PATH = path.join(__dirname, "../../Reports");

function createUniqueFolder(parentFolderId, reportsFolderPath) {
  const timestamp = new Date().toISOString().replace(/[-:.]/g, "");
  const folderName = `Upload_${path.basename(reportsFolderPath)}_${timestamp}`;

  const fileMetadata = {
    name: folderName,
    mimeType: "application/vnd.google-apps.folder",
    parents: [parentFolderId],
  };

  return service.files
    .create({
      resource: fileMetadata,
      fields: "id",
    })
    .then((response) => {
      console.log(
        `Created folder "${folderName}" with ID: ${response.data.id}`
      );
      return response.data.id;
    })
    .catch((error) => {
      console.error(
        `An error occurred while creating folder: ${error.message}`
      );
      return null;
    });
}

function uploadFiles(folderId, localFolderPath) {
  if (!fs.existsSync(localFolderPath)) {
    return Promise.reject(
      new Error(`Local folder path not found: ${localFolderPath}`)
    );
  }

  const files = fs.readdirSync(localFolderPath);

  const uploadPromises = files.map((fileName) => {
    const filePath = path.join(localFolderPath, fileName);
    const fileMetadata = {
      name: fileName,
      parents: [folderId],
    };
    const media = {
      body: fs.createReadStream(filePath),
    };

    return service.files
      .create({
        resource: fileMetadata,
        media: media,
        fields: "id",
      })
      .then((response) => {
        console.log(
          `Uploaded file ${fileName} with file ID ${response.data.id}`
        );
      })
      .catch((error) => {
        console.error(
          `An error occurred while uploading file ${fileName}: ${error.message}`
        );
      });
  });

  return Promise.all(uploadPromises);
}

// function uploadTodrive(localFolderPath) {
//   console.log("Starting Google Drive upload process...");
//   return createUniqueFolder(PARENT_FOLDER_ID, localFolderPath)
//     .then((folderId) => {
//       if (folderId) {
//         return uploadFiles(folderId, localFolderPath);
//       }
//     })
//     .then(() => console.log("Google Drive upload process completed."))
//     .catch((error) =>
//       console.error(`Error during drive upload: ${error.message}`)
//     );
// }
function uploadTodrive(localFolderPath) {
  console.log("Starting Google Drive upload process...");
  return createUniqueFolder(PARENT_FOLDER_ID, localFolderPath)
    .then((folderId) => {
      if (folderId) {
        console.log(
          "Folder created successfully on Google Drive. Folder ID:",
          folderId
        );
        // Now upload the files into this folder
        return uploadFiles(folderId, localFolderPath); // Upload files to the created folder
      }
    })
    .then(() => console.log("Google Drive upload process completed."))
    .catch((error) =>
      console.error(`Error during drive upload: ${error.message}`)
    );
}

module.exports = {
  uploadTodrive,
};
