import { WebSocketServer, WebSocket } from 'ws';
import { Server as HTTPServer } from 'http';
import { ExecutionSession } from '../execution/types';
import { executionManager } from '../execution/manager/ExecutionManager';
import { logger } from '../utils/logger';

interface ClientContext {
  ws: WebSocket;
  subscriptions: Set<string>; // sessionIds
}

export class WebSocketManager {
  private wss: WebSocketServer;
  private clients = new Map<WebSocket, ClientContext>();

  constructor(server: HTTPServer) {
    this.wss = new WebSocketServer({ server, path: '/api/ws' });
    this.setupHandlers();
  }

  private setupHandlers(): void {
    this.wss.on('connection', (ws: WebSocket) => {
      logger.info('[WebSocket] Client connected');

      const context: ClientContext = {
        ws,
        subscriptions: new Set(),
      };

      this.clients.set(ws, context);

      ws.on('message', (data: string) => {
        this.handleMessage(ws, data, context);
      });

      ws.on('close', () => {
        this.handleClose(ws, context);
      });

      ws.on('error', (error) => {
        logger.error(`[WebSocket] Error: ${error.message}`);
      });
    });
  }

  private handleMessage(ws: WebSocket, data: string, context: ClientContext): void {
    try {
      const message = JSON.parse(data);
      const { type, sessionId } = message;

      if (type === 'subscribe') {
        context.subscriptions.add(sessionId);
        logger.info(`[WebSocket] Client subscribed to session: ${sessionId}`);

        // Send current session state
        const session = executionManager.getSession(sessionId);
        if (session) {
          this.sendToClient(ws, {
            type: 'execution:state',
            session,
          });
        }
      } else if (type === 'unsubscribe') {
        context.subscriptions.delete(sessionId);
        logger.info(`[WebSocket] Client unsubscribed from session: ${sessionId}`);
      }
    } catch (error) {
      logger.error(`[WebSocket] Failed to parse message: ${error}`);
      this.sendToClient(ws, {
        type: 'error',
        message: 'Invalid message format',
      });
    }
  }

  private handleClose(ws: WebSocket, context: ClientContext): void {
    logger.info(`[WebSocket] Client disconnected`);
    this.clients.delete(ws);
  }

  /**
   * Broadcast session update to subscribed clients
   */
  broadcastSessionUpdate(session: ExecutionSession): void {
    for (const [ws, context] of this.clients.entries()) {
      if (context.subscriptions.has(session.id) && ws.readyState === WebSocket.OPEN) {
        this.sendToClient(ws, {
          type: 'execution:update',
          session,
        });
      }
    }
  }

  /**
   * Send message to specific client
   */
  private sendToClient(ws: WebSocket, message: unknown): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }
}
