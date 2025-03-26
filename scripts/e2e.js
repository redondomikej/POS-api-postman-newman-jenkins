const myModule = require("../modules/newman_aggr_module");
const newman = require("newman");
const path = require("path");
const fs = require("fs");

// Load JSON data
const datafilePath = path.join(
  __dirname,
  "../collection_variables/data_files/data_variables/datafile.json"
);
const datafile = JSON.parse(fs.readFileSync(datafilePath, "utf-8"));

// Loop through all the keys in the JSON file
Object.keys(datafile).forEach((dataKey) => {
  const shouldDelete = false;
  const timestamp = myModule.generateTimestamp();
  const reportsFolderPath = path.join(
    __dirname,
    `../Reports_${dataKey}_${timestamp}`
  );
  myModule.createReportsFolder(reportsFolderPath, shouldDelete);

  const reportFilename = `report_${timestamp}.html`;
  const csvReportFilename = `report_${timestamp}.csv`;
  const summaryReportFilename = `summary_report_${timestamp}.txt`;

  const htmlReportPath = path.join(reportsFolderPath, reportFilename);
  const csvReportPath = path.join(reportsFolderPath, csvReportFilename);
  const summaryReportPath = path.join(reportsFolderPath, summaryReportFilename);
  const collectionPath = path.join(
    __dirname,
    "../collection_variables/api_collection/e2e dynamic new.json"
  );
  const environmentPath = path.join(
    __dirname,
    "../collection_variables/Environments/aggr_env.json"
  );

  // Get the Newman configuration from module.js
  const newmanConfig = myModule.getNewmanConfig(
    collectionPath,
    environmentPath,
    datafilePath,
    htmlReportPath,
    dataKey
  );

  console.log(
    `Running Newman for dataKey: ${dataKey} with collection: ${newmanConfig.collection.info.name}`
  );

  newman.run(newmanConfig, (err, summary) => {
    if (err) {
      console.error(`\x1b[31mCollection run failed for ${dataKey}\x1b[0m`, err);
    } else {
      console.log(
        `\x1b[32mCollection run completed successfully for ${dataKey}.\x1b[0m`
      );
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
    }
  });
});
