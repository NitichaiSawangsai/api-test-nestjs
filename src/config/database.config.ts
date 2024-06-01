import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  name: process.env.DATABASE_NAME,
  syncEnabled: process.env.DATABASE_SYNC,
  schema: process.env.DATABASE_SCHEMA || 'public',
  SSLEnable: process.env.DATABASE_SSL_ENABLED || 'disable',
}));
