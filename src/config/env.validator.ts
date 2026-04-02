import { EnvConfig, Environment } from './env.config';

export function validateEnv(): EnvConfig {
  const errors: string[] = [];

  // NODE_ENV: Cloud Run não injeta por padrão, assume 'production'
  const nodeEnv = process.env.NODE_ENV?.trim() || 'production';
  if (!['development', 'production', 'test'].includes(nodeEnv)) {
    errors.push('NODE_ENV: must be one of: development, production, test');
  }

  // PORT: Cloud Run injeta via process.env.PORT, default 8080
  const port = process.env.PORT?.trim() || '8080';

  // Check DATABASE_URL
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) {
    errors.push('DATABASE_URL: should not be empty');
  }

  // Check JWT_SECRET
  const jwtSecret = process.env.JWT_SECRET?.trim();
  if (!jwtSecret) {
    errors.push('JWT_SECRET: should not be empty');
  }

  // Check FIREBASE_PROJECT_ID
  const firebaseProjectId = process.env.FIREBASE_PROJECT_ID?.trim();
  if (!firebaseProjectId) {
    errors.push('FIREBASE_PROJECT_ID: should not be empty');
  }

  if (errors.length > 0) {
    console.error('\n❌ Environment variables validation failed!\n');
    console.error('Missing or invalid environment variables:');
    errors.forEach(err => console.error(`  - ${err}`));
    console.error('\nPlease check your .env file and try again.\n');

    throw new Error(`Environment configuration errors:\n${errors.join('\n')}`);
  }

  return {
    NODE_ENV: nodeEnv as Environment,
    PORT: port,
    DATABASE_URL: databaseUrl!,
    JWT_SECRET: jwtSecret!,
    FIREBASE_PROJECT_ID: firebaseProjectId!,
    WEB_URL: process.env.WEB_URL?.trim(),
    API_URL: process.env.API_URL?.trim(),
    GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim(),
  };
}
