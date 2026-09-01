const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('=== NEIRAH BACKEND PRODUCTION BOOT ===');

if (process.env.DATABASE_URL) {
  try {
    console.log('[1/3] Syncing Prisma Database Schema...');
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
    console.log('[1/3] Database Schema Sync Complete.');
  } catch (err) {
    console.warn('[1/3] Schema Sync Warning (Continuing):', err.message || err);
  }

  try {
    console.log('[2/3] Seeding Production Database...');
    execSync('npx prisma db seed', { stdio: 'inherit' });
    console.log('[2/3] Database Seeding Complete.');
  } catch (err) {
    console.warn('[2/3] Seeding Warning (Continuing):', err.message || err);
  }
} else {
  console.warn('DATABASE_URL is not set in environment. Skipping migration and seed steps.');
}

console.log('[3/3] Starting NestJS Server...');
const mainPath = fs.existsSync(path.join(__dirname, '../dist/main.js'))
  ? '../dist/main.js'
  : '../dist/src/main.js';

console.log(`Loading application entry point from: ${mainPath}`);

try {
  require(mainPath);
} catch (err) {
  console.error('Failed to start NestJS Server:', err);
  process.exit(1);
}
