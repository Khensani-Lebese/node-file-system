const http = require('http');
const fs = require('fs');
const path = require('path');
const fileManager = require('./fileManager');

// Define the directory and JSON file paths
const dataDirectory = path.join(__dirname, 'data');
const jsonFilePath = path.join(dataDirectory, 'shoppingList.json');

// Initialize the directory and file
fileManager.createDirectory(dataDirectory);
fileManager.createJSONFile(jsonFilePath, []); // Initialize with an empty shopping list

// Helper function for handling errors
const handleError = (res, message, statusCode = 400) => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: message }));
};

// Function to generate a unique ID (using timestamp)
const generateId = () => Date.now().toString();

// Function to validate base64 image format
const isValidBase64Image = (image) => {
  return typeof image === 'string' && image.startsWith('data:image/');
};

// Function to check if a file path exists and is an image
const isValidImagePath = (filePath) => {
  const validExtensions = ['.png', '.jpg', '.jpeg', '.gif'];
  return fs.existsSync(filePath) && validExtensions.includes(path.extname(filePath).toLowerCase());
};

// Function to convert a local image file to base64 format
const convertToBase64 = (filePath) => {
  const fileBuffer = fs.readFileSync(filePath);
  const mimeType = `image/${path.extname(filePath).slice(1)}`; // Extracts extension like 'jpg' or 'png'
  return `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
};

// Create the server
const server = http.createServer((req, res) => {
  if (req.url.startsWith('/shopping-list')) {
    const method = req.method;

    if (method === 'GET') {
      // Read and return shopping list
      const data = fileManager.readJSONFile(jsonFilePath);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data)); // Send data as JSON

    } else if (method === 'POST') {
      // Add a new shopping item
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString(); // Receive data as a string
      });

      req.on('end', () => {
        try {
          const newItem = JSON.parse(body); // Parse string to JSON object
          const data = fileManager.readJSONFile(jsonFilePath);

          // Automatically generate a unique ID for the new item
          newItem.id = generateId();

          // Validate image as either base64 or local path
          if (newItem.image) {
            if (isValidBase64Image(newItem.image)) {
              // Image is valid as base64, proceed
              newItem.image = newItem.image;
            } else if (isValidImagePath(newItem.image)) {
              // Image is a valid local path, convert to base64
              newItem.image = convertToBase64(newItem.image);
            } else {
              return handleError(res, 'Image must be in base64 format or a valid local image path');
            }
          } else {
            return handleError(res, 'Image is required');
          }

          // Append the new item to the shopping list and write to file
          data.push(newItem);
          fileManager.updateJSONFile(jsonFilePath, data);

          // Respond with the new item in JSON format
          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(newItem));
          
        } catch (error) {
          console.log(error);
          handleError(res, 'Invalid JSON format');
        }
      });

    } else if (method === 'PUT' || method === 'PATCH') {
      // Update an existing shopping item
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });

      req.on('end', () => {
        try {
          const updatedItem = JSON.parse(body);
          const data = fileManager.readJSONFile(jsonFilePath);
          const itemIndex = data.findIndex(item => item.id === updatedItem.id);

          if (itemIndex !== -1) {
            // Validate image as either base64 or local path
            if (updatedItem.image) {
              if (isValidBase64Image(updatedItem.image)) {
                // Image is valid as base64, proceed
                updatedItem.image = updatedItem.image;
              } else if (isValidImagePath(updatedItem.image)) {
                // Image is a valid local path, convert to base64
                updatedItem.image = convertToBase64(updatedItem.image);
              } else {
                return handleError(res, 'Image must be in base64 format or a valid local image path');
              }
            }

            data[itemIndex] = updatedItem;
            fileManager.updateJSONFile(jsonFilePath, data);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(updatedItem));
          } else {
            handleError(res, 'Item not found', 404);
          }
        } catch (error) {
          handleError(res, 'Invalid JSON format');
        }
      });

    } else if (method === 'DELETE') {
      // Delete a shopping item
      const itemId = req.url.split('/').pop();
      const data = fileManager.readJSONFile(jsonFilePath);
      const newData = data.filter(item => item.id !== itemId);

      if (newData.length !== data.length) {
        fileManager.updateJSONFile(jsonFilePath, newData);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Item deleted successfully' }));
      } else {
        handleError(res, 'Item not found', 404);
      }
    } else {
      handleError(res, 'Invalid method', 405);
    }
  } else {
    handleError(res, 'Not found', 404);
  }
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
