/**
 * Patches all frontend pages that hardcode USER_ID as a module-level constant.
 * Replaces the constant with a dynamic read inside each fetch call via the auth utility.
 */
const fs = require('fs');
const path = require('path');

const appDir = 'd:/semi 7/neirah-customer-portal/neirah-customer-portal/frontend/app';

const files = [
  'quotations/[id]/page.tsx',
  'quotations/page.tsx',
  'projects/[id]/progress/page.tsx',
  'projects/[id]/page.tsx',
  'projects/[id]/milestones/page.tsx',
  'payments/page.tsx',
  'payments/outstanding/page.tsx',
  'notifications/page.tsx',
  'invoices/[id]/page.tsx',
  'invoices/page.tsx',
  'contracts/[id]/page.tsx',
];

const AUTH_IMPORT = `import { getActiveUserId } from '../lib/auth';`;
const AUTH_IMPORT_DEEP = `import { getActiveUserId } from '../../lib/auth';`;
const AUTH_IMPORT_DEEPER = `import { getActiveUserId } from '../../../lib/auth';`;

function getImportPath(filePath) {
  const rel = filePath.replace(/\\/g, '/');
  const depth = (rel.match(/\[id\]/g) || []).length + rel.split('/').length - 2;
  if (rel.includes('[id]') && rel.split('/').length >= 3) {
    // e.g. projects/[id]/milestones/page.tsx -> 3 levels deep -> ../../..
    const parts = rel.split('/');
    const dots = '../'.repeat(parts.length - 1);
    return `import { getActiveUserId } from '${dots}lib/auth';`;
  }
  if (rel.split('/').length === 2) {
    // e.g. quotations/page.tsx -> 1 level deep
    return `import { getActiveUserId } from '../lib/auth';`;
  }
  return `import { getActiveUserId } from '../../lib/auth';`;
}

let patchCount = 0;

for (const relPath of files) {
  const fullPath = path.join(appDir, relPath);
  if (!fs.existsSync(fullPath)) {
    console.log(`SKIP (not found): ${relPath}`);
    continue;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  const original = content;

  // 1. Remove the module-level USER_ID constant (both ?? and || variants)
  content = content.replace(
    /^const USER_ID = process\.env\.NEXT_PUBLIC_USER_ID \?\? ['"];?\s*['"]?;?\s*$/gm,
    ''
  );
  content = content.replace(
    /^const USER_ID = process\.env\.NEXT_PUBLIC_USER_ID \|\| ['"];?\s*['"]?;?\s*$/gm,
    ''
  );

  // 2. Replace all usages of USER_ID in fetch headers with getActiveUserId()
  content = content.replace(/'x-user-id': USER_ID/g, "'x-user-id': getActiveUserId()");
  content = content.replace(/"x-user-id": USER_ID/g, '"x-user-id": getActiveUserId()');

  // 3. Replace USER_ID guard checks (!USER_ID)
  content = content.replace(/!USER_ID/g, '!getActiveUserId()');

  // 4. Replace throw/error messages that just read USER_ID
  content = content.replace(/\bUSER_ID\b/g, 'getActiveUserId()');

  // 5. Add import if we made changes and it's not already there
  if (content !== original && !content.includes("from '../lib/auth'") && !content.includes("from '../../lib/auth'") && !content.includes("from '../../../lib/auth'")) {
    const importLine = getImportPath(relPath);
    // Insert after the last existing import line
    const lastImportIdx = content.lastIndexOf("import ");
    const lineEnd = content.indexOf('\n', lastImportIdx);
    content = content.slice(0, lineEnd + 1) + importLine + '\n' + content.slice(lineEnd + 1);
  }

  if (content !== original) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`PATCHED: ${relPath}`);
    patchCount++;
  } else {
    console.log(`NO CHANGE: ${relPath}`);
  }
}

console.log(`\nDone. ${patchCount} file(s) patched.`);
