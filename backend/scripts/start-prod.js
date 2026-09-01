const { execSync } = require('child_process');

console.log('=== NEIRAH BACKEND PRODUCTION BOOT ===');

if (process.env.DATABASE_URL) {
  try {
    console.log('[1/3] Applying Prisma Database Migrations...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  } catch (err) {
    console.warn('[1/3] Migration Warning (Continuing):', err.message || err);
  }

  try {
    console.log('[2/3] Seeding Production Database...');
    execSync('npx prisma db seed', { stdio: 'inherit' });
  } catch (err) {
    console.warn('[2/3] Seeding Warning (Continuing):', err.message || err);
  }
} else {
  console.warn('DATABASE_URL is not set. Skipping migration and seed steps.');
}

console.log('[3/3] Starting NestJS Server...');
require('../dist/src/main.js');
