const fs = require("fs");
const path = require("path");

// Function to delete the Reports folder if it exists
function deleteReportsFolder(ReportsFolderPath) {
  if (fs.existsSync(ReportsFolderPath)) {
    fs.rmSync(ReportsFolderPath, { recursive: true, force: true });
    console.log(
      `\x1b[32mDeleted existing folder: \x1b[0m \x1b[33m${ReportsFolderPath}\x1b[0m`
    );
  }
}

// Function to create the Reports folder
function createReportsFolder(ReportsFolderPath, shouldDelete = false) {
  if (shouldDelete) {
    deleteReportsFolder(ReportsFolderPath);
  }
  if (!fs.existsSync(ReportsFolderPath)) {
    fs.mkdirSync(ReportsFolderPath, { recursive: true });
    console.log(
      `\x1b[32mCreated folder: \x1b[0m \x1b[33m$${ReportsFolderPath}\x1b[0m`
    );
  } else {
    console.log(
      `\x1b[32mFolder already exists: \x1b[0m \x1b[33m$${ReportsFolderPath}\x1b[0m`
    );
  }
  return ReportsFolderPath;
}

// Function to generate a timestamp (formatted as YYYYMMDD_HHMMSS)
function generateTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `${year}${month}${day}_${hours}${minutes}${seconds}`;
}

// Function to generate a CSV file
function generateCSVReport(reportPath, summary) {
  const headers = [
    "Request Name",
    "API URL",
    "Status",
    "Status Code",
    "Request Method",
    "Response Time (ms)",
    "Response Size (bytes)",
    "Assertions Passed",
    "Assertions Failed",
    "QAA_Result",
  ];
  const rows = [];
  let totalPassed = 0;
  let totalFailed = 0;

  summary.run.executions.forEach((execution) => {
    const { item, assertions = [], request, response } = execution;

    const requestName = item.name;
    const apiUrl = request.url ? request.url.toString() : "No URL";
    const status = response ? response.status : "No response";
    const statusCode = response ? response.code : "No status code";
    const requestMethod = request.method;
    const responseTime = response ? response.responseTime : "No response time";
    const responseSize = response ? response.responseSize : "No response size";

    const passedCount = assertions.filter((a) => a.error === undefined).length;
    const failedCount = assertions.filter((a) => a.error !== undefined).length;
    // ------------------------------------------------------------------------------------------
    if (response?.stream) {
      try {
        // Parse the response stream into a JSON object
        const parsedResponseBody = JSON.parse(response.stream.toString("utf8"));
        const data = parsedResponseBody.data;

        if (data && data[0]) {
          const id = data[0]?.id; // Extract `id`
          const orNumber = data[0]?.or_number || ""; // Extract `or_number`

          if (id && orNumber) {
            const timestamp = new Date().toISOString(); // Get current timestamp
            const logData = `Timestamp: ${timestamp}, ORDER_ID: ${id}, OR_Number: ${orNumber}\n`;

            // Log data to the console and write it to a file
            console.log("Log Entry:", logData);
            fs.appendFileSync("../../extracted_data.txt", logData, {
              encoding: "utf8",
            });
          } else {
            console.warn(
              "Missing `id` or `or_number` in the data entry:",
              data
            );
          }
        } else {
          console.warn(
            "No valid data found in the response:",
            parsedResponseBody
          );
        }
      } catch (error) {
        // Detailed error handling for debugging
        console.error("Error processing response stream:", {
          message: error.message,
          stack: error.stack,
        });
      }
    } else {
      console.warn("No valid response stream found.");
    }

    if (response?.stream) {
      try {
        // Parse the response stream into a JSON object
        const parsedResponseBody = JSON.parse(response.stream.toString("utf8"));

        // Log the entire response body to the console and append it to the file
        const timestamp = new Date().toISOString(); // Get current timestamp
        const logData = `Timestamp: ${timestamp}, Response: ${JSON.stringify(
          parsedResponseBody
        )}\n`;

        // Log data to the console and write it to a file
        console.log("Log Entry:", logData);
        fs.appendFileSync("../../extracted_data.txt", logData, {
          encoding: "utf8",
        });
      } catch (error) {
        // Detailed error handling for debugging
        console.error("Error processing response stream:", {
          message: error.message,
          stack: error.stack,
        });
      }
    } else {
      console.warn("No valid response stream found.");
    }

    // ------------------------------------------------------------------------------------------

    // Determine QAA_Result
    const acceptableStatusCodes = [200, 201, 204];
    const isStatusAcceptable = acceptableStatusCodes.includes(statusCode);
    const isResponseTimeAcceptable =
      responseTime !== "No response time" && responseTime <= 50000;
    const noFailedAssertions = failedCount === 0;

    const qaaResult =
      isStatusAcceptable && isResponseTimeAcceptable && noFailedAssertions
        ? "Passed"
        : "Failed";
    if (qaaResult === "Passed") {
      totalPassed++;
    } else {
      totalFailed++;
    }
    rows.push([
      requestName,
      apiUrl,
      status,
      statusCode,
      requestMethod,
      responseTime,
      responseSize,
      passedCount,
      failedCount,
      qaaResult,
    ]);
  });

  // Combine headers and rows to create CSV content
  const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");

  // Write the CSV file
  fs.writeFileSync(reportPath, csvContent);
  console.log(
    `\x1b[32mCSV report generated: \x1b[0m \x1b[33m${reportPath}\x1b[0m`
  );

  return { totalPassed, totalFailed };
}

// Function to extract the base URL from the API URL
function extractBaseUrl(apiUrl) {
  try {
    const url = new URL(apiUrl);
    return `${url.protocol}//${url.hostname}`;
  } catch (error) {
    console.error("Invalid URL provided:", apiUrl, error);
    return "Unknown Base URL";
  }
}

// Function to generate a summary report
function generateSummaryReport(
  summaryReportPath,
  totalPassed,
  totalFailed,
  summary
) {
  // Extract the base URLs from all requests
  const baseUrls = new Set(
    summary.run.executions.map((execution) => {
      const apiUrl = execution.request.url.toString();
      return extractBaseUrl(apiUrl);
    })
  );

  // Extract the environment from the first request's API URL
  const apiUrl = summary.run.executions[0].request.url.toString();
  const baseUrl = extractBaseUrl(apiUrl);

  // Determine the environment based on the API URL
  const environment = (() => {
    if (baseUrl.includes("dev")) return "Development";
    if (baseUrl.includes("qa")) return "QA";
    if (baseUrl.includes("uat")) return "UAT";
    if (baseUrl.includes("prod")) return "Production";
    return "Unknown";
  })();
  const startRunTime = new Date(summary.run.timings.started);
  const endRunTime = new Date(summary.run.timings.completed);
  const totalRunDuration = endRunTime - startRunTime; // in milliseconds
  const totalDataReceived = summary.run.executions.reduce(
    (total, execution) => {
      return total + (execution.response ? execution.response.responseSize : 0);
    },
    0
  );
  const averageResponseTime =
    summary.run.executions.reduce((total, execution) => {
      return total + (execution.response ? execution.response.responseTime : 0);
    }, 0) / summary.run.executions.length;

  // Summary Report
  const summaryReport = `
Summary Report:
- Environment: ${environment}
- BE Services: ${Array.from(baseUrls).join(", ")}
- Total Passed: ${totalPassed}
- Total Failed: ${totalFailed}
- Start Run Date and Time: ${startRunTime.toISOString()}
- End Run Date and Time: ${endRunTime.toISOString()}

Performance Report:
- Environment: ${environment}
- BE Services: ${Array.from(baseUrls).join(", ")}
- Total Passed: ${totalPassed}
- Total Failed: ${totalFailed}
- Start Run Date and Time: ${startRunTime.toISOString()}
- End Run Date and Time: ${endRunTime.toISOString()}
- Total Run Duration: ${(totalRunDuration / 1000).toFixed(2)} seconds
- Total Data Received: ${(totalDataReceived / 1024).toFixed(2)} KB
- Average Response Time: ${averageResponseTime.toFixed(2)} ms
`;

  // Save the report to a file
  fs.writeFileSync(summaryReportPath, summaryReport);
  console.log(
    `\x1b[32mSummary report generated: \x1b[0m \x1b[33m${summaryReportPath}\x1b[0m`
  );
}

function getNewmanConfig(
  collectionPath,
  environmentPath,
  datafile,
  htmlReportPath,
  dataKey
) {
  // Load the datafile JSON
  const fullData = require(datafile); // Load the entire JSON file

  // Check if dataKey exists
  if (!fullData[dataKey]) {
    throw new Error(`Data key "${dataKey}" not found in datafile.`);
  }

  // Convert the selected data into an array for Newman
  const selectedData = [fullData[dataKey]]; // Wrap the object in an array

  return {
    collection: require(collectionPath),
    environment: require(environmentPath),
    iterationData: selectedData, // This is now an array
    reporters: ["htmlextra", "progress"],
    reporter: {
      htmlextra: {
        export: htmlReportPath,
      },
    },
  };
}

module.exports = {
  createReportsFolder,
  generateTimestamp,
  generateCSVReport,
  generateSummaryReport,
  getNewmanConfig,
};
