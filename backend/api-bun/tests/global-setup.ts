import { seedTestData, cleanupDatabase } from './setup';

beforeAll(async () => {
  await cleanupDatabase();
  await seedTestData();
});

afterAll(async () => {
  await cleanupDatabase();
});
