import { z } from 'zod';
import { config } from 'dotenv';
import { resolve } from 'path';
import { parseEnv } from 'znv';

const envPath = resolve(__dirname, `../.env.${process.env.NODE_ENV}`);

config({ path: envPath });

export const env = parseEnv(process.env, {
  MONGO_URL: z.string().url(),
  PORT: z.number().min(1).max(65535),
  NODE_ENV: z.enum(['dev', 'prod', 'test']),
  SECRET_TOKEN: z.number().min(10000),
});
