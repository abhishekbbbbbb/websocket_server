import { WebSocketServer } from 'ws'; // Import the WebSocketServer correctly

// Create a WebSocket server
const server = new WebSocketServer({ port: 8080 }); // Ensure the port is set correctly

// Handle WebSocket connection events
server.on('connection', (ws) => {
    console.log('New client connected!');
    console.time();

    // Send a welcome message when the client connects
    const data = { timestamp: new Date(), message: 'Welcome to the WebSocket server!' };
    ws.send(JSON.stringify(data)); // Send data as JSON string
    console.log('Sent data to client:', data);

    // Regularly send data to the client
    setInterval(() => {
        const data = { timestamp: new Date(), message: 'Hello from the server!' };
        ws.send(JSON.stringify(data)); // Send data as JSON string
        console.log('Sent data to client:', data);
    }, 10000);

    // Listen for messages from the client
    ws.on('message', (message) => {
        console.log(`Received message: ${message}`);
    });

    // Handle WebSocket close
    ws.on('close', () => {
        console.log('Client disconnected.');
        console.timeEnd();
    });
    
    // Handle WebSocket errors
    ws.on('error', (error) => {
        console.log('WebSocket error:', error);
        console.timeEnd();
    });
});

console.log('WebSocket server is running on ws://localhost:8080');