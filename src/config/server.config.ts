import { registerAs } from '@nestjs/config';

export default registerAs('server', () => ({
  port: process.env.SERVER_PORT,
  nodeEnv: process.env.NODE_ENV || 'develop',
  auth: {
    jwtSecretKey: process.env.JWT_SECRET_KEY,
  },
}));
