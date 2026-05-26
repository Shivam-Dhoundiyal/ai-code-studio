import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { config } from 'dotenv';
import apiRoutes from './routes/index';
import { WebSocketManager } from './websocket/WebSocketManager';
import { executionManager } from './execution/manager/ExecutionManager';
import { logger } from './utils/logger';

// Load environment variables
config({ path: '.env.local' });

const PORT = process.env.BACKEND_PORT || 3001;
const app = express();
const server = createServer(app);

// Middleware
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// WebSocket setup
const wsManager = new WebSocketManager(server);

// Subscribe execution manager to WebSocket broadcasts
const subscriptions = new Set<string>();
const originalExecute = executionManager.execute.bind(executionManager);
(executionManager as any).execute = async function (sessionId: string, ...args: any[]) {
  if (!subscriptions.has(sessionId)) {
    const unsubscribe = executionManager.subscribe(sessionId, (session) => {
      wsManager.broadcastSessionUpdate(session);
    });
    subscriptions.add(sessionId);
  }
  return originalExecute(sessionId, ...args);
};

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api', apiRoutes);

// Error handling
app.use((err: any, req: any, res: any, _next: any) => {
  logger.error(`Unhandled error: ${err.message}`);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
server.listen(PORT, () => {
  logger.info(`Backend server running on http://localhost:${PORT}`);
  logger.info(`WebSocket server running on ws://localhost:${PORT}`);
});
