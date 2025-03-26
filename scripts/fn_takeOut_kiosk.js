const myModule = require("../modules/newman module");
const driveUtils = require("../modules/driveUtils");
const newman = require("newman");
const path = require("path");

const reportsFolderPath = path.join(__dirname, "../../Reports_kiosk_takeout");
const shouldDelete = true;

myModule.createReportsFolder(reportsFolderPath, shouldDelete);

const timestamp = myModule.generateTimestamp();
const reportFilename = `report_${timestamp}.html`;
const csvReportFilename = `report_${timestamp}.csv`;
const summaryReportFilename = `summary_report_${timestamp}.txt`;

const htmlReportPath = path.join(reportsFolderPath, reportFilename);
const csvReportPath = path.join(reportsFolderPath, csvReportFilename);
const summaryReportPath = path.join(reportsFolderPath, summaryReportFilename);
const collectionPath = path.join(
  __dirname,
  "../collection_variables/api_collection/02_E2E_KIOSK_EVO_Takeout.json"
);
const environmentPath = path.join(
  __dirname,
  "../collection_variables/api_collection/api_environment.json"
);
// Get the Newman configuration from module.js
const newmanConfig = myModule.getNewmanConfig(
  collectionPath,
  environmentPath,
  htmlReportPath
);

console.log(
  `Running Newman with collection: ${newmanConfig.collection.info.name}`
);

newman.run(newmanConfig, (err, summary) => {
  if (err) {
    console.error("\x1b[31mCollection run failed\x1b[0m", err);
  } else {
    console.log(`\x1b[32mCollection run completed successfully.\x1b[0m`);
    console.log(`Report generated: \x1b[33m${htmlReportPath}\x1b[0m`);
    console.log(`CSV report generated: \x1b[33m${csvReportPath}\x1b[0m`);
    console.log(
      `Summary report generated: \x1b[33m${summaryReportPath}\x1b[0m`
    );

    const { totalPassed, totalFailed } = myModule.generateCSVReport(
      csvReportPath,
      summary
    );
    myModule.generateSummaryReport(
      summaryReportPath,
      totalPassed,
      totalFailed,
      summary
    );

    driveUtils
      .uploadFolderAndFilesToDrive(reportsFolderPath)
      .then(() => console.log(`Drive upload completed.`))
      .catch((error) =>
        console.error(`Error during drive upload: ${error.message}`)
      );
  }
});
