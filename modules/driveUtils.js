const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");

// Function to get a readable formatted timestamp
function getFormattedTimestamp() {
  const now = new Date();
  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const day = daysOfWeek[now.getDay()];
  const date = now.getDate().toString().padStart(2, "0");
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const year = now.getFullYear();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const millisec = now.getMilliseconds().toString().padStart(3, "0");

  // Format: SAT_09-07-2024_Time_15_45_123 (Example)
  return `${day}_${month}-${date}-${year}_Time_${hours}_${minutes}_${millisec}`;
}

const SCOPES = ["https://www.googleapis.com/auth/drive.file"];
const SERVICE_ACCOUNT_FILE =
  "../collection_variables/gcc_connection/drive_cred.json"; // Ensure this path is correct

const auth = new google.auth.GoogleAuth({
  keyFile: SERVICE_ACCOUNT_FILE,
  scopes: SCOPES,
});

const service = google.drive({ version: "v3", auth });
const PARENT_FOLDER_ID = "1_5TPcCYBLEE-uEMoI0U-Z9dR8DYKKnZI"; // Ensure this is the correct folder ID

// Step 1: Create a unique folder on Google Drive with a readable timestamp
function createUniqueFolder(parentFolderId, reportsFolderPath) {
  const timestamp = getFormattedTimestamp();
  const folderName = `Upload_${path.basename(reportsFolderPath)}_${timestamp}`;

  const fileMetadata = {
    name: folderName,
    mimeType: "application/vnd.google-apps.folder",
    parents: [parentFolderId], // Make sure the folder is created under the parent folder
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
      return response.data.id; // Return the folder ID
    })
    .catch((error) => {
      console.error(
        `An error occurred while creating folder: ${error.message}`
      );
      return null;
    });
}

// Step 2: Upload files into the created folder on Google Drive
function uploadFilesToFolder(driveFolderId, reportsFolderPath) {
  if (!fs.existsSync(reportsFolderPath)) {
    return Promise.reject(
      new Error(`Local folder path not found: ${reportsFolderPath}`)
    );
  }

  const files = fs.readdirSync(reportsFolderPath); // Read files from the local reports folder

  const uploadPromises = files.map((fileName) => {
    const filePath = path.join(reportsFolderPath, fileName);
    const fileMetadata = {
      name: fileName,
      parents: [driveFolderId], // Upload each file to the newly created folder
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
          `Uploaded file ${fileName} to folder with ID ${driveFolderId}`
        );
      })
      .catch((error) => {
        console.error(`Error uploading file ${fileName}: ${error.message}`);
      });
  });

  return Promise.all(uploadPromises); // Wait for all uploads to complete
}

// Step 3: Main function to create a folder and upload files to it
function uploadFolderAndFilesToDrive(reportsFolderPath) {
  console.log("Starting Google Drive upload process...");

  // First, create the folder on Google Drive
  return createUniqueFolder(PARENT_FOLDER_ID, reportsFolderPath)
    .then((folderId) => {
      if (folderId) {
        console.log(
          "Folder created successfully on Google Drive. Folder ID:",
          folderId
        );

        // Then, upload all files into the newly created folder
        return uploadFilesToFolder(folderId, reportsFolderPath);
      }
    })
    .then(() => console.log("Google Drive upload process completed."))
    .catch((error) => {
      console.error(`Error during drive upload: ${error.message}`);
    });
}

module.exports = {
  uploadFolderAndFilesToDrive,
};
