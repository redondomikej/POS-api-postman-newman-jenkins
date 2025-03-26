const fs = require("fs");
const path = require("path");

const filesToDelete = [
  "./extracted_dataval.txt",
  "./extracted_dataval_report.txt",
  "./extracted_data.txt",
  "./outputreport.txt",
];

filesToDelete.forEach((file) => {
  const filePath = path.resolve(__dirname, file);
  fs.unlink(filePath, (err) => {
    if (err) {
      if (err.code === "ENOENT") {
        console.log(`File not found: ${filePath}`);
      } else {
        console.error(`Error deleting file: ${filePath}`, err);
      }
    } else {
      console.log(`Deleted: ${filePath}`);
    }
  });
});
