import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { inArray } from 'drizzle-orm';
import Groq from 'groq-sdk';

import { env } from '@/env';
import { db } from '@/db';
import { webhooks } from '@/db/schema/webhooks';

export const generateHandler: FastifyPluginAsyncZod = async (app) => {
  app.post(
    '/api/generate',
    {
      schema: {
        summary: 'Generate a Typescript handler',
        tags: ['Webhooks'],
        body: z.object({
          webhooksIds: z.array(z.uuidv7()),
        }),
        response: {
          201: z.object({
            code: z.string(),
          }),
        },
      },
    },
    async (req, reply) => {
      const { webhooksIds } = req.body;

      const result = await db
        .select({
          body: webhooks.body,
        })
        .from(webhooks)
        .where(inArray(webhooks.id, webhooksIds));

      const webhooksBodies = result.map((item) => item.body).join('\n\n');

      const groq = new Groq({ apiKey: env.GROQ_API_KEY });

      const response = await groq.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: `
          Generate a TypeScript function that serves as a handler for multiple webhook events. The function should accept a request body containing different webhook events and validate the incoming data using Zod. Each webhook event type should have its own schema defined using Zod.
          The function should handle the following webhook events with example payloads:
          """
          ${webhooksBodies}
          """
          The generated code should include:
          -  A main function that takes the webhook request body as input.
          -  Zod schemas for each event type.
          -  Logic to handle each event based on the validated data.
          -  Appropriate error handling for invalid payloads.
          ---
          return only the code generate, do not include any explanations or additional text - such as example of usage -.
        `.trim(),
          },
        ],
        model: 'openai/gpt-oss-20b',
      });

      const raw = response.choices[0].message.content;

      const text = raw
        .replace(/^```(?:typescript|ts)?\n?/m, '')
        .replace(/```$/m, '')
        .trim();

      await reply.status(201).send({ code: text });
    },
  );
};
