import { getDb } from './server/db.ts';
import { users } from './drizzle/schema.ts';
import { eq } from 'drizzle-orm';

const db = await getDb();
const result = await db
  .select()
  .from(users)
  .where(eq(users.email, 'qq@test.com'));

console.log('User found:', result);
