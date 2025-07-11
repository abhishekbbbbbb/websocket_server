const WebSocket = require('ws');
const http = require('http');
const url = require('url');
const { performance } = require('perf_hooks');

const PORT = 8080;
let clientSocket = null;
let connectedAt = null;
let connectedAtPerf = null;
let durationInterval = null;

// Create HTTP server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);

  // Heartbeat POST endpoint
  if (parsedUrl.pathname === '/heartbeat' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      console.log(`[${new Date().toISOString()}] Heartbeat received`);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
    });
    return;
  }

  // Fallback for other routes
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not Found' }));
});

// WebSocket server
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  clientSocket = ws;
  connectedAt = new Date();
  connectedAtPerf = performance.now();

  console.log(`[${connectedAt.toISOString()}] Client connected`);

  // Start logging duration every second
  durationInterval = setInterval(() => {
    const seconds = ((performance.now() - connectedAtPerf) / 1000).toFixed(2);
    console.log(`⏳ Connection duration: ${seconds} seconds`);
  }, 1000);

  // Send welcome message
  ws.send(JSON.stringify({
    type: 'welcome',
    message: 'Welcome! You are connected.',
    timestamp: connectedAt.toISOString(),
  }));

  // Send message after 1 minute
  // Send a message every 1 minute
const messageInterval = setInterval(() => {
  if (clientSocket && clientSocket.readyState === WebSocket.OPEN) {
    const msg = {
      type: 'server_message',
      message: 'This is a repeated message from the server every 1 minute.',
      timestamp: new Date().toISOString(),
    };
    clientSocket.send(JSON.stringify(msg));
    console.log(`[${msg.timestamp}] Sent recurring message to client`);
  }
}, 60000);

ws.on('message', (message) => {

    const parsed = JSON.parse(message);
    console.log(`[${new Date().toISOString()}] 📩 Received from client:`, parsed);
});     


  // On client disconnect
  ws.on('close', () => {
    const disconnectedAt = new Date();
    const duration = ((performance.now() - connectedAtPerf) / 1000).toFixed(2);
    console.log(`[${disconnectedAt.toISOString()}] Client disconnected`);
    console.log(`⏱️ Connection lasted: ${duration} seconds`);

    // Stop duration logging
    clearInterval(durationInterval);
    clearInterval(messageInterval);
    durationInterval = null;

    clientSocket = null;
  });

  // Error handling
  ws.on('error', (err) => {
    console.error(`[${new Date().toISOString()}] WebSocket error:`, err);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`[${new Date().toISOString()}] Server running on port ${PORT}`);
  console.log(`Heartbeat endpoint: POST http://localhost:${PORT}/heartbeat`);
});
