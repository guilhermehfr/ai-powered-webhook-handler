import { fastify } from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
  jsonSchemaTransform,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { z } from 'zod';
import { fastifyCors } from '@fastify/cors';
import { fastifySwagger } from '@fastify/swagger';

import { env } from './env';

import { listWebhooks } from './routes/list-webhooks';
import { getWebhook } from './routes/get-webhook';
import { deleteWebhook } from './routes/delete-webhook';
import { captureWebhook } from './routes/capture-webhook';
import { generateHandler } from './routes/generate-handler';

const app = fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    transport:
      process.env.NODE_ENV !== 'production'
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'yyyy-mm-dd HH:MM:ss',
            },
          }
        : undefined,
  },
}).withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(fastifyCors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  // credentials: true,
});

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Webhook Inspector API',
      description: 'API for capturing and inspecting webhook requests',
      version: '1.0.0',
    },
  },
  transform: jsonSchemaTransform,
});

app.register(listWebhooks);
app.register(getWebhook);
app.register(deleteWebhook);
app.register(captureWebhook);
app.register(generateHandler);

app.register(async (app) => {
  app.get(
    '/api/health',
    {
      schema: {
        summary: 'Basic API Health Check',
        tags: ['System'],
        response: {
          200: z.object({ status: z.string() }),
        },
      },
    },
    async (req, reply) => {
      // This route is being create to primaly be used to keep the Render API constantly alive.
      // So no relevant health checking is being made here.
      return reply.send({ status: 'ok' });
    }
  );
});

async function start() {
  try {
    await app.listen({
      port: env.PORT,
      host: '0.0.0.0',
    });

    app.log.info(
      {
        port: env.PORT,
        env: process.env.NODE_ENV,
        service: 'webhook-api',
      },
      'Server started',
    );
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
