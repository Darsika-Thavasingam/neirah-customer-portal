require('dotenv/config');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
  console.log('=== USERS ===');
  const users = await pool.query('SELECT id, name, email FROM users');
  users.rows.forEach(r => console.log(r.id, '|', r.name, '|', r.email));

  console.log('\n=== PORTAL ACCESS (userId -> customerId) ===');
  const access = await pool.query('SELECT "userId", "customerId", "isActive" FROM customer_portal_access');
  access.rows.forEach(r => console.log('user:', r.userId, '-> customer:', r.customerId, '| active:', r.isActive));

  console.log('\n=== PROJECTS (id | customerId | name) ===');
  const projects = await pool.query('SELECT id, "customerId", name, "projectCode" FROM projects');
  projects.rows.forEach(r => console.log('project:', r.id, '| customer:', r.customerId, '|', r.name, '|', r.projectCode));

  console.log('\n=== CUSTOMER PROJECT ACCESS ===');
  const cpa = await pool.query('SELECT "customerId", "projectId" FROM customer_project_access');
  cpa.rows.forEach(r => console.log('customer:', r.customerId, '-> project:', r.projectId));

  await pool.end();
}

check().catch(e => { console.error('Error:', e.message); process.exit(1); });
