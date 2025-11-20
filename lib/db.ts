import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema'; // 1. این خط اضافه شد

const sql = neon(process.env.DATABASE_URL!);

// 2. اسکیما را به عنوان آپشن دوم پاس می‌دهیم
export const db = drizzle(sql, { schema });