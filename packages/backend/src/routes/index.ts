import { Router } from 'express';
import generateRouter from './generate';
import executeRouter from './execute';

const router = Router();

router.use('/generate', generateRouter);
router.use('/execute', executeRouter);

export default router;
