const fs = require("fs");
const path = require("path");

// Define the path to your JSON file
const filePath = path.resolve(
  __dirname,
  "../../collection_variables/data_files/data_variables/data_file.json"
);

// Read the JSON file
fs.readFile(filePath, "utf8", (err, jsonString) => {
  if (err) {
    console.log("Error reading file:", err);
    return;
  }
  try {
    // Parse the JSON data
    const data = JSON.parse(jsonString);

    // Get the keys (object names) and log them
    const keys = Object.keys(data);
    keys.forEach((key) => {
      console.log(key);
    });
  } catch (err) {
    console.log("Error parsing JSON:", err);
  }
});
