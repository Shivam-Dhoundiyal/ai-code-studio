import express from 'express';
import http from 'http';
import cors from 'cors';
import { ExecutionManager } from './execution/manager';
import { WebSocketManager } from './websocket/manager';
import executionRoutes, {
  setExecutionManager,
  setWebSocketManager,
} from './routes/execution';

const app = express();
const server = http.createServer(app);
const port = parseInt(process.env.BACKEND_PORT || '3001');

// Middleware
app.use(express.json());
app.use(cors());

// Initialize managers
const executionManager = new ExecutionManager();
const wsManager = new WebSocketManager(server);

// Set managers for routes
setExecutionManager(executionManager);
setWebSocketManager(wsManager);

// Routes
app.use(executionRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(
  (err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
);

server.listen(port, () => {
  console.log(`✓ Backend server running on http://localhost:${port}`);
  console.log(`✓ WebSocket available at ws://localhost:${port}/api/ws`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
