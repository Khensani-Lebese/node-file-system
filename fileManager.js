const fs = require('fs');
const path = require('path');

// Create a new directory if it doesn't already exist
const createDirectory = (dirPath) => {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`Directory ${dirPath} created.`);
    } else {
      console.log(`Directory ${dirPath} already exists.`);
    }
  } catch (error) {
    console.error(`Error creating directory ${dirPath}:`, error);
  }
};

// Create a JSON file within the directory, if it doesn't already exist
const createJSONFile = (filePath, initialData = {}) => {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(initialData, null, 2));
      console.log(`File ${filePath} created.`);
    } else {
      console.log(`File ${filePath} already exists.`);
    }
  } catch (error) {
    console.error(`Error creating file ${filePath}:`, error);
  }
};

// Read and parse the JSON file
const readJSONFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    } else {
      console.log(`File ${filePath} does not exist.`);
      return [];
    }
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return [];
  }
};

// Update the JSON file with new data
const updateJSONFile = (filePath, newData) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(newData, null, 2));
    console.log(`File ${filePath} updated.`);
  } catch (error) {
    console.error(`Error updating file ${filePath}:`, error);
  }
};

module.exports = {
  createDirectory,
  createJSONFile,
  readJSONFile,
  updateJSONFile,
};
