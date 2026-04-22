import Fastify from 'fastify';
import { env } from './config/env.ts';
import { connectDB } from './config/db.ts';
import errorHandlerPlugin from './plugins/errorHandler.ts';
import authenticatePlugin from './plugins/authenticate.ts';
import authRoutes from './routes/auth.routes.ts';
import promptRoutes from './routes/prompt.routes.ts';
import collectionRoutes from './routes/collection.routes.ts';
import securityPlugin from '@plugins/security'

// Step 1: Create a function that builds our server
const buildServer = async () => {

  // Step 2: Create the Fastify instance
  const server = Fastify({
    logger: env.NODE_ENV === 'development',
  });

  // Step 3: Connect to MongoDB
  await connectDB();

  // Register global middleware/ plugins
  await server.register(securityPlugin);

  // Register plugins FIRST (order matters!)
  await server.register(errorHandlerPlugin);
  await server.register(authenticatePlugin);

  // Register routes AFTER plugins
  await server.register(authRoutes, { prefix: '/api/auth' });
  await server.register(promptRoutes, { prefix: '/api/prompts' });
  await server.register(collectionRoutes, { prefix: '/api/collections' });

  // Step 4: Health check route (to test if server is running)
  server.get('/health', async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
    };
  });

  return server;
};

// Step 5: Start the server
const start = async () => {
  try {
    const server = await buildServer();

    await server.listen({
      port: Number(env.PORT),
      host: env.HOST,
    });

    console.log(`🚀 Server running on http://${env.HOST}:${env.PORT}`);
  } catch (error) {
    console.error('❌ Server failed to start:');
    console.error(error);
    process.exit(1);
  }
};

start();