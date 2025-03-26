const fs = require("fs");
const axios = require("axios");
const path = require("path");

function runApiAndSaveResponse() {
  axios
    .post("https://qa-parrotapiv2.serino.com/api/v1/auth/login", {
      username: "qa-kuyaj_admin@yopmail.com",
      password: "5&JeqXPn",
      terminal_id: "45",
    })
    .then((response) => {
      const responseData = response.data;

      // Define the path to save the JSON file
      const outputPath = path.join(__dirname, "../../report/response.json");

      // Save the response data as a JSON file in the ../../report directory
      fs.writeFileSync(
        outputPath,
        JSON.stringify(responseData, null, 2),
        "utf-8"
      );

      console.log(`Response saved as ${outputPath}`);
    })
    .catch((error) => {
      console.error("Error during API request:", error);
    });
}

function extractAndSaveRequestData() {
  // Define the path to the API collection file
  const collectionPath = path.join(
    __dirname,
    "../collection_variables/api_collection/OMS_V2_API_100_Create_Order.json"
  );

  // Read and parse the API collection file
  fs.readFile(collectionPath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading the API collection file:", err);
      return;
    }

    try {
      const apiCollection = JSON.parse(data);

      // Extract request data (assuming the structure contains 'item' array with 'request' objects)
      const requestData = apiCollection.item.map((item) => item.request);

      // Define the path to save the extracted request data
      const outputPath = path.join(
        __dirname,
        "../../report/extracted_requests.json"
      );

      // Save the extracted request data as a JSON file in the ../../report directory
      fs.writeFileSync(
        outputPath,
        JSON.stringify(requestData, null, 2),
        "utf-8"
      );

      console.log(`Extracted request data saved as ${outputPath}`);
    } catch (parseError) {
      console.error("Error parsing the API collection file:", parseError);
    }
  });
}

function extractBodyRawAndSave() {
  const collectionPath = path.join(
    __dirname,
    "../collection_variables/api_collection/OMS_V2_API_100_Create_Order.json"
  );

  fs.readFile(collectionPath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading the API collection file:", err);
      return;
    }

    try {
      const apiCollection = JSON.parse(data);

      // Extract the body.raw data
      const bodyRaw = apiCollection.item[0].request.body.raw;

      // Parse the raw JSON string into a JavaScript object
      const parsedBodyRaw = JSON.parse(bodyRaw);

      const outputPath = path.join(
        __dirname,
        "../../report/extracted_body_raw.json"
      );

      fs.writeFileSync(
        outputPath,
        JSON.stringify(parsedBodyRaw, null, 2),
        "utf-8"
      );

      console.log(`Extracted body.raw data saved as ${outputPath}`);
    } catch (parseError) {
      console.error("Error parsing the API collection file:", parseError);
    }
  });
}
module.exports = {
  runApiAndSaveResponse,
  extractAndSaveRequestData,
  extractBodyRawAndSave,
};
