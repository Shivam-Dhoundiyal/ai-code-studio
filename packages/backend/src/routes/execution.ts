import { Router, Request, Response } from 'express';
import { ExecutionManager } from '../execution/manager';
import { WebSocketManager } from '../websocket/manager';

const router = Router();
let executionManager: ExecutionManager;
let wsManager: WebSocketManager;

export const setExecutionManager = (manager: ExecutionManager) => {
  executionManager = manager;
};

export const setWebSocketManager = (manager: WebSocketManager) => {
  wsManager = manager;
};

// Mock AI code generation endpoint
router.post('/api/generate', (req: Request, res: Response) => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  // Mock response - generates simple JavaScript code
  const mockCodeMap: Record<string, string> = {
    hello: 'console.log("Hello, World!");',
    fibonacci: `
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}
console.log(fibonacci(10));
    `,
    loop: `
for (let i = 0; i < 5; i++) {
  console.log(\"Iteration: \" + i);
}
    `,
    error: `
throw new Error("This is a test error");
    `,
    math: `
const result = 2 + 2;
console.log(\"2 + 2 = \" + result);
    `,
  };

  const lowerPrompt = prompt.toLowerCase();
  let code = mockCodeMap.hello; // default

  for (const [key, value] of Object.entries(mockCodeMap)) {
    if (lowerPrompt.includes(key)) {
      code = value;
      break;
    }
  }

  res.json({ code });
});

// Execute code endpoint
router.post('/api/execute', async (req: Request, res: Response) => {
  const { code } = req.body;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Code is required' });
  }

  try {
    const session = await executionManager.executeCode({ code });
    wsManager.broadcastSession(session);

    res.json({
      sessionId: session.id,
      status: session.status,
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Execution failed',
    });
  }
});

// Get execution session status
router.get('/api/executions/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const session = executionManager.getSession(id);

  if (!session) {
    return res.status(404).json({ error: 'Execution session not found' });
  }

  res.json({
    success: session.status === 'completed' && !session.error,
    logs: session.logs,
    error: session.error,
    result: session.result,
    executionTime: session.executionTime,
    code: session.code,
    status: session.status,
  });
});

// Get all execution sessions
router.get('/api/executions', (req: Request, res: Response) => {
  const sessions = executionManager.getAllSessions();
  res.json({ sessions });
});

export default router;
