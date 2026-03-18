import Fastify from 'fastify';
import dotenv from 'dotenv';

dotenv.config();

const app = Fastify({ logger: true });

const PORT = Number(process.env.PORT) || 4000;

app.get('/api', async () => {
  return { message: 'API is running' };
});

app.setNotFoundHandler((request, reply) => {
  reply.status(404).send({ message: 'Route not found' });
});

app.setErrorHandler((error, request, reply) => {
  app.log.error(error);
  reply.status(500).send({ message: 'Internal server error' });
});

const start = async () => {
  try {
    await app.listen({ port: PORT });
    console.log(`Server running on http://localhost:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();