const http = require('http');
const fileManager = require('./fileManager');
const path = require('path');

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

// Create the server
const server = http.createServer((req, res) => {
  if (req.url.startsWith('/shopping-list')) {
    const method = req.method;

    if (method === 'GET') {
      // Read and return shopping list
      const data = fileManager.readJSONFile(jsonFilePath);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
      
    } else if (method === 'POST') {
      // Add a new shopping item
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', () => {
        const newItem = JSON.parse(body);
        const data = fileManager.readJSONFile(jsonFilePath);
        
        // Automatically generate a unique ID for the new item
        newItem.id = generateId();

        // Check if the image field is present and valid (URL or base64 string)
        if (!newItem.image || typeof newItem.image !== 'string') {
          return handleError(res, 'Image is required and must be a string');
        }

        data.push(newItem);
        fileManager.updateJSONFile(jsonFilePath, data);
        
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(newItem));
      });
      
    } else if (method === 'PUT' || method === 'PATCH') {
      // Update an existing shopping item
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', () => {
        const updatedItem = JSON.parse(body);
        const data = fileManager.readJSONFile(jsonFilePath);
        const itemIndex = data.findIndex(item => item.id === updatedItem.id);
        
        if (itemIndex !== -1) {
          data[itemIndex] = updatedItem;
          fileManager.updateJSONFile(jsonFilePath, data);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(updatedItem));
        } else {
          handleError(res, 'Item not found', 404);
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
