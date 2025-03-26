const fs = require("fs");
const path = require("path");

// const inputFilePath = path.join(__dirname, "uuid_ornumber.txt");
const inputFilePath = path.join(__dirname, "extracted_dataval_report.txt");
const outputFilePath = path.join(__dirname, "outputreport.txt");

// Read the file
fs.readFile(inputFilePath, "utf8", (err, data) => {
  if (err) {
    console.error("Error reading file:", err);
    return;
  }

  const lines = data
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line);

  const uuidSet = new Set();
  const orNumberSet = new Set();
  const duplicateUUIDs = [];
  const duplicateOrNumbers = [];
  const parsedData = [];

  lines.forEach((line) => {
    const match = line.match(/uuid:\s*([\w-]+),\s*or_number:\s*([\d-]+)/);
    if (match) {
      const uuid = match[1];
      const orNumber = match[2];

      // Check for duplicate UUID
      if (uuidSet.has(uuid)) {
        duplicateUUIDs.push(uuid);
      } else {
        uuidSet.add(uuid);
      }

      // Check for duplicate OR Number
      if (orNumberSet.has(orNumber)) {
        duplicateOrNumbers.push(orNumber);
      } else {
        orNumberSet.add(orNumber);
      }

      parsedData.push({ uuid, orNumber });
    }
  });

  // Generate report
  let reportContent = "Validation Report\n";
  reportContent += "=================\n";

  if (duplicateUUIDs.length > 0) {
    reportContent +=
      "\nDuplicate UUIDs Found:\n" + duplicateUUIDs.join("\n") + "\n";
  } else {
    reportContent += "\nNo duplicate UUIDs found.\n";
  }

  if (duplicateOrNumbers.length > 0) {
    reportContent +=
      "\nDuplicate OR Numbers Found:\n" + duplicateOrNumbers.join("\n") + "\n";
  } else {
    reportContent += "\nNo duplicate OR Numbers found.\n";
  }

  // Write report to output file
  fs.writeFile(outputFilePath, reportContent, (err) => {
    if (err) {
      console.error("Error writing report:", err);
    } else {
      console.log("Validation report saved to:", outputFilePath);
    }
  });
});
