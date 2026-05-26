import { Router, Request, Response } from 'express';
import { executionManager } from '../execution/manager/ExecutionManager';
import { logger } from '../utils/logger';

const router = Router();

// Execute code
router.post('/', async (req: Request, res: Response) => {
  try {
    const { code, prompt, timeout } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    // Create execution session
    const session = await executionManager.createSession(code, prompt);

    // Execute code
    const result = await executionManager.execute(session.id, { code, timeout });

    res.json({
      sessionId: session.id,
      ...result,
    });
  } catch (error) {
    logger.error(`Execute error: ${error}`);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Execution failed',
    });
  }
});

// Get execution session
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const session = executionManager.getSession(id);

  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  res.json(session);
});

// Get all executions
router.get('/', (req: Request, res: Response) => {
  const sessions = executionManager.getAllSessions();
  res.json(sessions);
});

export default router;
