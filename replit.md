# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Contains LegalAssist AI — an automated legal assistant for Russian property law (real estate, vehicles, legal entities/sole proprietors).

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Auth**: Replit Auth (OIDC/PKCE)
- **LLM**: OpenAI via Replit AI Integrations (gpt-5.2)
- **Document parsing**: pdf-parse (PDF), mammoth (DOCX)
- **File upload**: multer (multipart/form-data)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── legal-assist/       # React + Vite frontend (LegalAssist AI)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   ├── db/                 # Drizzle ORM schema + DB connection
│   └── replit-auth-web/    # Auth hook (useAuth) for React frontend
├── scripts/                # Utility scripts (single workspace package)
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, scripts)
├── tsconfig.base.json      # Shared TS options
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## Features

### LegalAssist AI (artifacts/legal-assist)
- **Authentication**: Replit Auth login/logout
- **Chat management**: List of user chats (sidebar), create/delete chats
- **Text chat**: Send text messages, get AI responses from gpt-5.2
- **Document upload**: Upload PDF or Word (.docx) files for AI analysis
- **Specialization**: Russian property law — real estate deals, vehicle transactions, legal entities/sole proprietors

## API Endpoints

All routes under `/api`:

- `GET /healthz` — health check
- `GET /auth/user` — current auth state
- `GET /login` — OIDC login redirect
- `GET /callback` — OIDC callback
- `GET /logout` — logout
- `GET /chats` — list user chats
- `POST /chats` — create new chat
- `GET /chats/:chatId` — get chat with messages
- `DELETE /chats/:chatId` — delete chat
- `POST /chats/:chatId/messages` — send text message
- `POST /chats/:chatId/upload` — upload PDF/Word document

## Database Schema

- `sessions` — Replit Auth sessions
- `users` — authenticated users
- `chats` — user chat sessions
- `messages` — chat messages (role: user/assistant, optional fileName)

## Development

- `pnpm --filter @workspace/api-server run dev` — run API server
- `pnpm --filter @workspace/legal-assist run dev` — run frontend
- `pnpm --filter @workspace/db run push` — push DB schema
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API client/schemas
