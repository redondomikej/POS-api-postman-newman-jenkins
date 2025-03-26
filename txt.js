const fs = require("fs");

// Read the data from the report.txt file
fs.readFile("extracted_dataval_report.txt", "utf8", (err, data) => {
  if (err) {
    console.error("Error reading file:", err);
    return;
  }

  // Split the data into lines and parse each line into an object
  const records = data
    .split("\n")
    .map((line) => {
      const match = line.match(/uuid: (\S+), DataKey: (\S+), or_number: (\S+)/);
      return match
        ? {
            uuid: match[1],
            dataKey: match[2],
            or_number: match[3],
          }
        : null;
    })
    .filter((record) => record !== null); // Filter out any null entries (invalid lines)

  // Sort records based on or_number (assuming or_number follows a specific format)
  records.sort((a, b) => {
    const numA = parseInt(a.or_number.split("-")[1], 10); // Extract numeric part of or_number
    const numB = parseInt(b.or_number.split("-")[1], 10);
    return numA - numB;
  });

  // Start building the report
  let report = "OR Number Sequence Validation Report\n";
  report += "====================================\n\n";
  report += "Sorted Data:\n";
  records.forEach((record) => {
    report += `UUID: ${record.uuid}, DataKey: ${record.dataKey}, OR Number: ${record.or_number}\n`;
  });

  report += "\nValidation Results:\n";
  let valid = true;
  let missingNumbers = [];

  // Track the sequence
  for (let i = 1; i < records.length; i++) {
    const prevNum = parseInt(records[i - 1].or_number.split("-")[1], 10);
    const currNum = parseInt(records[i].or_number.split("-")[1], 10);

    // Check if the numbers are not sequential
    if (currNum !== prevNum + 1) {
      report += `Sequence error: ${records[i - 1].or_number} -> ${
        records[i].or_number
      }\n`;
      valid = false;

      // Check for missing numbers in between
      for (let j = prevNum + 1; j < currNum; j++) {
        missingNumbers.push(j);
      }
    }
  }

  if (valid) {
    report +=
      "\nThe OR numbers are in sequence and no skip or jumping values.\n";
  } else {
    report += "\nThere are sequence errors in the OR numbers.\n";
    if (missingNumbers.length > 0) {
      report +=
        "\nMissing OR numbers in sequence: " + missingNumbers.join(", ") + "\n";
    }
  }

  // Write the report to a .txt file
  fs.writeFile("or_number_sequence_report.txt", report, (err) => {
    if (err) {
      console.error("Error writing the report file:", err);
      return;
    }
    console.log("Report generated successfully: or_number_sequence_report.txt");
  });
});
