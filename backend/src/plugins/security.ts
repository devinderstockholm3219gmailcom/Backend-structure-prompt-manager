// src/plugins/security.ts
import fp from 'fastify-plugin'
import type { FastifyInstance } from 'fastify'
import helmet from '@fastify/helmet'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import { env } from '@config/env'

async function securityPlugin(fastify: FastifyInstance): Promise<void> {

  // ── 1. Helmet ────────────────────────────────────────────────
  // Sets secure HTTP response headers automatically.
  // Protects against XSS, clickjacking, MIME sniffing, and more.
  await fastify.register(helmet, {
    contentSecurityPolicy: false  // we'll handle CSP on the frontend side
  })

  // ── 2. CORS ──────────────────────────────────────────────────
  // Controls which domains are allowed to call our API.
  // Without this, browsers block cross-origin requests by default.
  await fastify.register(cors, {
    origin: env.FRONTEND_URL,      // only allow our frontend
    credentials: true,             // allow cookies + auth headers
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS']
  })

  // ── 3. Rate Limiting ─────────────────────────────────────────
  // Limits how many requests one IP can make.
  // Prevents brute force attacks and API abuse.
  await fastify.register(rateLimit, {
    max: 100,          // max 100 requests...
    timeWindow: '15 minutes',  // ...per 15 minute window
    errorResponseBuilder: () => ({
      statusCode: 429,
      error: 'Too Many Requests',
      message: 'You are sending too many requests. Please slow down.'
    })
  })
}

// fp() makes this plugin global — applies to ALL routes
export default fp(securityPlugin)