import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const prismaDir = join(import.meta.dir, '..', 'prisma');
const testDbDir = join(prismaDir, 'test-db');

if (!existsSync(testDbDir)) {
  mkdirSync(testDbDir, { recursive: true });
}

console.log('🔧 Setting up test database...\n');

console.log('1. Generating Prisma client for test schema...');
try {
  execSync('bunx prisma generate --schema=./prisma/schema.test.prisma', {
    stdio: 'inherit',
    cwd: join(import.meta.dir, '..'),
  });
} catch (e) {
  console.log('Prisma generate failed, trying db push instead...');
}

console.log('\n2. Pushing schema to SQLite test database...');
try {
  execSync('bunx prisma db push --schema=./prisma/schema.test.prisma --skip-generate --accept-data-loss', {
    stdio: 'inherit',
    env: { ...process.env, TEST_DATABASE_URL: 'file:./prisma/test-db/test.db' },
    cwd: join(import.meta.dir, '..'),
  });
} catch (e) {
  console.error('Failed to push schema:', e);
  process.exit(1);
}

console.log('\n✅ Test database setup complete!');
console.log('📁 Test database location: prisma/test-db/test.db\n');
