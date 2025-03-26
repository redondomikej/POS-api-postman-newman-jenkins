const fs = require("fs");

// Function to process the data and generate the report
function generateReport() {
  // Read the extracted data file
  fs.readFile("./extracted_data.txt", "utf8", (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
      return;
    }

    // Split the data by newlines or any delimiter that separates the entries
    const entries = data.split("\n");

    // Create a new array to hold every 8th entry
    const reportEntries = [];

    // // Loop through the entries and pick every 8th one
    // for (let i = 7; i < entries.length; i += 8) {
    //   reportEntries.push(entries[i]);
    // }

    for (let i = 1; i < entries.length; i += 2) {
      reportEntries.push(entries[i]);
    }

    // // Loop through the entries and pick every 26th one
    // for (let i = 22; i < entries.length; i += 26) {
    //   reportEntries.push(entries[i]);
    // }

    // Loop through the entries and pick every 7th one
    // for (let i = 6; i < entries.length; i += 7) {
    //   reportEntries.push(entries[i]);
    // }

    // Create the report content by joining the selected entries
    const reportContent = reportEntries.join("\n");

    // Write the report content to a new file
    fs.writeFile("./extracted_dataval.txt", reportContent, (err) => {
      if (err) {
        console.error("Error writing report file:", err);
      } else {
        console.log("Report generated successfully!");
      }
    });
  });
}

// Call the function to generate the report
generateReport();
