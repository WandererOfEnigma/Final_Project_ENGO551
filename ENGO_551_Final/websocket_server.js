const WebSocket = require('ws');

// Create a WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

// Event listener for WebSocket server listening
wss.on('listening', () => {
  console.log('WebSocket server is listening on port 8080');
});

// Event listener for WebSocket connection established
wss.on('connection', (ws) => {
  console.log('Client connected');

  // Event listener for messages from the client
  ws.on('message', (message) => {
    console.log(`Received message from client: ${message}`);
  });

  // Event listener for WebSocket connection closed
  ws.on('close', () => {
    console.log('Client disconnected');
  });

  // Send a message to the client
  ws.send('Hello, client! Welcome to the WebSocket server.');
});
