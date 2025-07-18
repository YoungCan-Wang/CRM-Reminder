import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import 'dotenv/config'; // 确保加载环境变量

// 从环境变量获取数据库连接字符串
const connectionString = process.env.DATABASE_URL;

// 检查连接字符串是否存在
if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

// 创建PostgreSQL连接池
const pool = new Pool({
  connectionString: connectionString,
});

// 使用drizzle和连接池以及我们的schema初始化数据库客户端
export const db = drizzle(pool, { schema });
