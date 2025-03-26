const { exec } = require("child_process");

// List of scripts to run
const scripts = [
  "node txt_dataval.js",
  "node txt_dataval_rep.js",
  // "node txt_dataval_add.js",
  "node val_rep.js",
  "node txt.js",
];

// Function to run scripts sequentially
function runScripts(scripts) {
  if (scripts.length === 0) return; // If no scripts left to run, stop

  const script = scripts.shift(); // Get the first script in the array

  // Execute the script
  exec(script, (err, stdout, stderr) => {
    if (err) {
      console.error(`Error executing ${script}: ${stderr}`);
      return;
    }
    console.log(`${script} output: ${stdout}`);

    // Run the next script
    runScripts(scripts); // Recursively call the function to run the next script
  });
}

// Start running the scripts
runScripts(scripts);
