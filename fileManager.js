const fs = require('fs');
const path = require('path');

// Create a new directory
const createDirectory = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Directory ${dirPath} created.`);
  } else {
    console.log(`Directory ${dirPath} already exists.`);
  }
};

// Create a JSON file within the directory
const createJSONFile = (filePath, initialData = {}) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(initialData, null, 2));
    console.log(`File ${filePath} created.`);
  } else {
    console.log(`File ${filePath} already exists.`);
  }
};

// Read and parse the JSON file
const readJSONFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath);
    console.log(data);
    
    return JSON.parse(data);
  } else {
    console.log(`File ${filePath} does not exist.`);
    return null;
  }
};

// Update the JSON file with new data
const updateJSONFile = (filePath, newData) => {
  fs.writeFileSync(filePath, JSON.stringify(newData, null, 2));
  console.log(`File ${filePath} updated.`);
};

module.exports = {
  createDirectory,
  createJSONFile,
  readJSONFile,
  updateJSONFile,
};
