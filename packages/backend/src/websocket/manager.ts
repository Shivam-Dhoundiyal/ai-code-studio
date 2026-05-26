import { WebSocketServer, WebSocket } from 'ws';
import { Server as HTTPServer } from 'http';
import { ExecutionLog, ExecutionSession } from '../execution/types';

export interface WebSocketMessage {
  type: 'subscribe' | 'unsubscribe' | 'execution:started' | 'execution:log' | 'execution:error' | 'execution:completed';
  sessionId?: string;
  data?: Record<string, unknown>;
}

export class WebSocketManager {
  private wss: WebSocketServer;
  private subscriptions: Map<string, Set<WebSocket>> = new Map();

  constructor(server: HTTPServer) {
    this.wss = new WebSocketServer({ server, path: '/api/ws' });

    this.wss.on('connection', (ws) => {
      console.log('WebSocket client connected');

      ws.on('message', (data) => {
        try {
          const message: WebSocketMessage = JSON.parse(data.toString());
          this.handleMessage(ws, message);
        } catch (error) {
          ws.send(
            JSON.stringify({
              type: 'error',
              error: 'Invalid message format',
            })
          );
        }
      });

      ws.on('close', () => {
        console.log('WebSocket client disconnected');
        this.cleanupSubscriptions(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    });
  }

  private handleMessage(ws: WebSocket, message: WebSocketMessage): void {
    if (message.type === 'subscribe' && message.sessionId) {
      this.subscribe(message.sessionId, ws);
    } else if (message.type === 'unsubscribe' && message.sessionId) {
      this.unsubscribe(message.sessionId, ws);
    }
  }

  subscribe(sessionId: string, ws: WebSocket): void {
    if (!this.subscriptions.has(sessionId)) {
      this.subscriptions.set(sessionId, new Set());
    }
    this.subscriptions.get(sessionId)!.add(ws);
  }

  unsubscribe(sessionId: string, ws: WebSocket): void {
    const subscribers = this.subscriptions.get(sessionId);
    if (subscribers) {
      subscribers.delete(ws);
      if (subscribers.size === 0) {
        this.subscriptions.delete(sessionId);
      }
    }
  }

  private cleanupSubscriptions(ws: WebSocket): void {
    for (const [, subscribers] of this.subscriptions) {
      subscribers.delete(ws);
    }
  }

  broadcastSessionEvent(
    sessionId: string,
    eventType: 'started' | 'log' | 'error' | 'completed',
    data: Record<string, unknown>
  ): void {
    const subscribers = this.subscriptions.get(sessionId);
    if (!subscribers || subscribers.size === 0) return;

    const message = JSON.stringify({
      type: `execution:${eventType}`,
      sessionId,
      data,
    });

    subscribers.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }

  broadcastSession(session: ExecutionSession): void {
    this.broadcastSessionEvent(session.id, 'started', {
      id: session.id,
      status: session.status,
    });
  }

  broadcastLog(sessionId: string, log: ExecutionLog): void {
    this.broadcastSessionEvent(sessionId, 'log', log);
  }

  broadcastError(sessionId: string, error: string): void {
    this.broadcastSessionEvent(sessionId, 'error', { error });
  }

  broadcastCompleted(
    sessionId: string,
    status: string,
    executionTime: number,
    logs: ExecutionLog[]
  ): void {
    this.broadcastSessionEvent(sessionId, 'completed', {
      status,
      executionTime,
      logs,
    });
  }
}
