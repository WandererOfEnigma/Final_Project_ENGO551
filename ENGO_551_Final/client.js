const WebSocket = require('ws');

// Replace 'localhost' with the IP address or hostname of your WebSocket server
const ws = new WebSocket('ws://localhost:8080');

// Event listener for WebSocket connection established
ws.on('open', function open() {
  console.log('Connected to WebSocket server');

  // Function to send asset messages to the server
  function sendAssetMessage(coordinates) {
    const assetMessage = {
      id: 'asset1', // Replace with your asset ID
      coordinates: coordinates
    };
    ws.send(JSON.stringify(assetMessage));
    console.log('Sent asset message to server:', assetMessage);
  }

  // Function to send incident messages to the server
  function sendIncidentMessage() {
    const incidentMessage = {
      id: 'incident1',
      coordinates: [-114.09, 51.08] // Example incident coordinates
    };
    ws.send(JSON.stringify(incidentMessage));
    console.log('Sent incident message to server:', incidentMessage);
  }

  // Send hello message to the server
  ws.send('Hello from IoT device');

  // Simulated GPS data from a GPS module
  const gpsModule = {
    getCoordinates: function() {
      // Simulate getting GPS coordinates (replace with actual logic)
      return [-114.05, 51.05]; // Example GPS coordinates
    }
  };

  // Send asset messages to the server periodically
  setInterval(() => {
    const coordinates = gpsModule.getCoordinates();
    sendAssetMessage(coordinates);
  }, 5000); // Adjust the interval as needed (in milliseconds)

  // Send incident messages to the server periodically
  setInterval(sendIncidentMessage, 5000); // Adjust the interval as needed (in milliseconds)
});

// Event listener for receiving messages from the server
ws.on('message', function incoming(data) {
  console.log('Received message from server:', data);
});

// Event listener for WebSocket connection closed
ws.on('close', function close() {
  console.log('Disconnected from WebSocket server');
});
