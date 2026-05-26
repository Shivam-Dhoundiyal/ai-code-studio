import { Router, Request, Response } from 'express';

const router = Router();

// Mock AI code generation
router.post('/', (req: Request, res: Response) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  // Mock responses based on prompt keywords
  let code = 'console.log("Hello, World!");';

  if (prompt.toLowerCase().includes('fibonacci')) {
    code = `
const fib = (n) => {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
};

console.log('Fibonacci sequence:');
for (let i = 0; i < 10; i++) {
  console.log(fib(i));
}
    `;
  } else if (prompt.toLowerCase().includes('sum')) {
    code = `
const numbers = [1, 2, 3, 4, 5];
const sum = numbers.reduce((a, b) => a + b, 0);
console.log('Sum:', sum);
    `;
  } else if (prompt.toLowerCase().includes('factorial')) {
    code = `
const factorial = (n) => {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
};

console.log('5! =', factorial(5));
console.log('10! =', factorial(10));
    `;
  }

  res.json({ code, prompt });
});

export default router;
