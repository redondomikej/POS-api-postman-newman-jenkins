const fs = require("fs");
const path = require("path");

const outputFile = "directory_structure.txt"; // Output file name
const excludeDirs = ["node_modules", ".git"]; // Exclude node_modules

function generateStructure(dir, prefix = "") {
  let structure = "";

  const files = fs
    .readdirSync(dir)
    .filter((file) => !excludeDirs.includes(file));

  files.forEach((file, index) => {
    const filePath = path.join(dir, file);
    const isLast = index === files.length - 1;
    const connector = isLast ? "└── " : "├── ";

    structure += `${prefix}${connector}${file}\n`;

    if (fs.statSync(filePath).isDirectory()) {
      const newPrefix = prefix + (isLast ? "    " : "│   ");
      structure += generateStructure(filePath, newPrefix);
    }
  });

  return structure;
}

const rootDir = path.resolve("."); // Current directory
const structure = generateStructure(rootDir);

fs.writeFileSync(outputFile, structure, "utf-8");
console.log(`Directory structure saved to ${outputFile}`);
