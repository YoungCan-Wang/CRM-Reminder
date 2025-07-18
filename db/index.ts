import { drizzle } from 'drizzle-orm/vercel-postgres';
import { createPool } from '@vercel/postgres';
import * as schema from './schema';

// 使用连接池，确保环境变量POSTGRES_URL已配置
export const db = drizzle(createPool(), { schema });