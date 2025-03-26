const fs = require("fs");
const path = require("path");

const inputFilePath = path.join(__dirname, "./extracted_dataval.txt"); // Input file
const outputFilePath = path.join(__dirname, "./extracted_dataval_report.txt"); // Output file

// Regular expressions to extract uuid, or_number, and DataKey
const uuidRegex = /"uuid"\s*:\s*"([^"]+)"/;
const orNumberRegex = /"or_number"\s*:\s*("?([^",}]*)"?)/; // Handles both quoted and null values
const dataKeyRegex = /DataKey:\s*([^,]+)/; // Extracts the value after "DataKey:" until the next comma

fs.readFile(inputFilePath, "utf8", (err, data) => {
  if (err) {
    console.error("Error reading input file:", err);
    return;
  }

  // Split into lines
  const lines = data.split("\n");
  const extractedData = [];

  lines.forEach((line) => {
    const uuidMatch = line.match(uuidRegex);
    const orNumberMatch = line.match(orNumberRegex);
    const dataKeyMatch = line.match(dataKeyRegex);

    const uuid = uuidMatch ? uuidMatch[1] : "No Data";
    const orNumber = orNumberMatch ? orNumberMatch[2] : "No Data"; // Keeps original value if found
    const dataKey = dataKeyMatch ? dataKeyMatch[1].trim() : "No Data";

    extractedData.push(
      `uuid: ${uuid}, DataKey: ${dataKey}, or_number: ${orNumber}`
    );
  });

  // Write extracted data to output file
  fs.writeFile(outputFilePath, extractedData.join("\n"), "utf8", (err) => {
    if (err) {
      console.error("Error writing output file:", err);
    } else {
      console.log("Extraction completed successfully.");
    }
  });
});
