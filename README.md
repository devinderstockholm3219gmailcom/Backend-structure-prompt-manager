# Prompt Manager

[![CI](https://github.com/devinder-dev/ai-prompt-manager/actions/workflows/ci.yml/badge.svg)](https://github.com/devinder-dev/ai-prompt-manager/actions/workflows/ci.yml)
![Bun](https://img.shields.io/badge/Bun-1.x-black?logo=bun)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)

A full-stack AI prompt management application. Organize, store, and manage your AI prompts in collections with a clean and intuitive interface.

## Tech Stack

**Backend**
- [Bun](https://bun.sh/) — JavaScript runtime
- [Fastify](https://fastify.dev/) — Web framework
- [MongoDB](https://www.mongodb.com/) + [Mongoose](https://mongoosejs.com/) — Database
- [Zod](https://zod.dev/) — Schema validation
- JWT — Authentication (access + refresh tokens)
- Docker — Containerization

**Frontend**
- [React 19](https://react.dev/) + TypeScript
- [Vite](https://vite.dev/) — Build tool
- [React Router v7](https://reactrouter.com/) — Client-side routing
- [TanStack Query](https://tanstack.com/query) — Server state management
- [Axios](https://axios-http.com/) — HTTP client

## Project Structure

```
├── backend/    # Fastify REST API
└── frontend/   # React client
```

## Features

- User registration and login with JWT authentication
- Create, edit, and delete prompts
- Organize prompts into collections
- Search and paginate through your prompt library
- Admin panel
- Rate limiting, CORS, and Helmet security headers

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) v1.0+
- [Node.js](https://nodejs.org/) v18+ (for frontend)
- [MongoDB](https://www.mongodb.com/) instance

### Backend

```bash
cd backend
cp .env.example .env   # fill in your environment variables
bun install
bun dev
```

**Environment variables:**

| Variable            | Description                        |
|---------------------|------------------------------------|
| `PORT`              | Server port (default: `3000`)      |
| `HOST`              | Server host (default: `0.0.0.0`)   |
| `DATABASE_URL`      | MongoDB connection string          |
| `JWT_SECRET`        | Secret for access tokens           |
| `JWT_REFRESH_SECRET`| Secret for refresh tokens          |
| `FRONTEND_URL`      | Frontend origin for CORS           |

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` by default.

### Docker

```bash
cd backend
docker build -t prompt-manager-backend .
docker run -p 3000:3000 --env-file .env prompt-manager-backend
```

## API Endpoints

| Method | Endpoint                  | Description              | Auth |
|--------|---------------------------|--------------------------|------|
| POST   | `/api/auth/register`      | Register a new user      | No   |
| POST   | `/api/auth/login`         | Login                    | No   |
| POST   | `/api/auth/refresh`       | Refresh access token     | No   |
| GET    | `/api/auth/profile`       | Get current user profile | Yes  |
| GET    | `/api/prompts`            | List prompts             | Yes  |
| POST   | `/api/prompts`            | Create a prompt          | Yes  |
| PUT    | `/api/prompts/:id`        | Update a prompt          | Yes  |
| DELETE | `/api/prompts/:id`        | Delete a prompt          | Yes  |
| GET    | `/api/collections`        | List collections         | Yes  |
| POST   | `/api/collections`        | Create a collection      | Yes  |
| DELETE | `/api/collections/:id`    | Delete a collection      | Yes  |
| GET    | `/health`                 | Health check             | No   |

## Deploy

The backend ships with a [Render Blueprint](render.yaml) for one-click deployment (Dockerfile-based).

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/devinder-dev/ai-prompt-manager)

**Steps:**
1. Create a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster and copy its connection string.
2. Click **Deploy to Render** above (or push this repo and choose *New → Blueprint* in Render).
3. When prompted, set the two `sync:false` env vars:
   - `DATABASE_URL` → your Atlas connection string
   - `FRONTEND_URL` → your deployed frontend origin (for CORS)
   - `JWT_SECRET` and `JWT_REFRESH_SECRET` are generated automatically by Render.
4. After the service is live, seed an admin user by running `bun run src/scripts/seed-admin.ts` with `ADMIN_PASSWORD` set (see `.env.example`).

> Render injects `PORT` automatically; the app binds to it via `env.PORT`. Health checks hit `/health`.
