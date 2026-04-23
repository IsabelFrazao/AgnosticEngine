import { z } from 'zod';
import { logger } from '@/src/lib/logger';

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(),
  AE_LOG_INGEST_URL: z.string().url().optional(),
  AE_LOG_INGEST_TOKEN: z.string().min(1).optional(),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  logger.error('Invalid environment variables', _env.error.format());
  throw new Error('Invalid environment variables');
}

export const env = _env.data;
