# AI Code Studio

A production-grade, mobile-first AI-powered code execution platform. Generate code from prompts, execute it in a secure sandbox, and see results in real-time — all from your phone or desktop.

## 🎯 MVP Features

- **Prompt-to-Code:** Generate code from prompts using AI
- **Secure Sandbox:** Isolated execution with timeout protection
- **Live Output:** WebSocket-powered real-time execution logs
- **Mobile-First:** Fully responsive dark UI optimized for phones
- **Terminal UI:** Clean terminal-style output console
- **Code Editor:** Monaco editor with syntax highlighting
- **Execution History:** Track prompts and results

## 🏗️ Architecture

```
ai-code-studio/
├── packages/
│   ├── backend/          # Express + TypeScript
│   │   ├── src/
│   │   │   ├── server.ts          # Express setup
│   │   │   ├── config/            # Configuration
│   │   │   ├── execution/         # Sandbox & runner
│   │   │   ├── providers/         # AI provider abstraction
│   │   │   ├── ws/                # WebSocket handlers
│   │   │   ├── routes/            # API routes
│   │   │   └── utils/             # Utilities
│   │   └── package.json
│   ├── frontend/         # Next.js + Tailwind
│   │   ├── src/
│   │   │   ├── app/               # App Router
│   │   │   ├── components/        # React components
│   │   │   ├── hooks/             # Custom hooks
│   │   │   ├── services/          # API services
│   │   │   └── styles/            # Global styles
│   │   └── package.json
│   └── shared/           # Shared types & utils
│       ├── src/
│       │   ├── types.ts           # Shared TypeScript types
│       │   └── constants.ts       # Shared constants
│       └── package.json
├── pnpm-workspace.yaml
├── turbo.json
├── .env.example
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+

```bash
# Install pnpm if not already installed
npm install -g pnpm
```

### Installation

```bash
# Clone and install
cd ai-code-studio
pnpm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your API keys
```

### Development

```bash
# Start both frontend and backend in dev mode
pnpm dev

# Or start individually
pnpm dev:backend   # Backend: http://localhost:3001
pnpm dev:frontend  # Frontend: http://localhost:3000
```

### Build for Production

```bash
# Build all packages
pnpm build

# Or specific packages
pnpm build:backend
pnpm build:frontend
```

### Linting & Type Checking

```bash
# Lint all packages
pnpm lint

# Type check all packages
pnpm type-check

# Format code
pnpm format
```

## 📊 API Endpoints

### REST API

- `POST /api/execute` - Execute code with prompt
- `GET /api/health` - Health check

### WebSocket

- `WS /ws` - Live execution output streaming

## 🔒 Security

- Execution timeout limits (configurable via ENV)
- Output size limits
- Input validation & sanitization
- Isolated execution environment (VM2)
- Console output capture
- Error isolation

## 🛣️ Future Roadmap

- [ ] AI Provider: OpenAI integration
- [ ] AI Provider: Claude integration
- [ ] AI Provider: Gemini integration
- [ ] Execution history database
- [ ] User authentication
- [ ] Code persistence
- [ ] Multi-agent workflows
- [ ] Execution queue system
- [ ] Docker sandbox integration
- [ ] Plugin system

## 📁 Project Structure Philosophy

- **Clean & Lightweight:** No over-engineering
- **Modular:** Easy to extend
- **Testable:** Isolated concerns
- **Scalable:** MVP-ready, production-grade
- **TypeScript Strict:** Type safety from day one

## 🛠️ Tech Stack

- **Frontend:** Next.js 14+, React 18+, TypeScript, Tailwind CSS
- **Backend:** Express, TypeScript, VM2 (sandbox), ws (WebSocket)
- **Shared:** TypeScript, common types and utilities
- **Tools:** pnpm, Turbo, ESLint, Prettier

## 📝 Development Workflow

1. **Branch Strategy:** `main` (production) → feature branches
2. **Code Style:** Enforced by ESLint + Prettier
3. **Type Safety:** TypeScript strict mode enabled
4. **Monorepo:** pnpm workspaces with Turbo caching

## 🤝 Contributing

Contributions welcome! Follow the existing code style and structure.

---

Built with ❤️ for mobile developers
