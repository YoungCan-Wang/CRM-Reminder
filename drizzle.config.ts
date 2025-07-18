import { defineConfig } from 'drizzle-kit';
import { URL } from 'url'; // 导入Node.js的URL模块
import 'dotenv/config'; // 确保加载环境变量

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error('DATABASE_URL is not set in .env file');
}

const parsedUrl = new URL(dbUrl);

export default defineConfig({
  schema: './db/schema.ts', // Drizzle将在这里找到我们的数据库表定义
  out: './drizzle', // 迁移文件将生成到这个目录
  dialect: 'postgresql', // 指定数据库方言为PostgreSQL
  dbCredentials: {
    host: parsedUrl.hostname,
    port: parseInt(parsedUrl.port || '5432', 10),
    user: parsedUrl.username,
    password: parsedUrl.password,
    database: parsedUrl.pathname.substring(1), // 数据库名通常在路径中，去除开头的'/'
    ssl: parsedUrl.searchParams.get('sslmode') === 'require' || parsedUrl.searchParams.get('sslmode') === 'true', // 根据sslmode参数设置SSL
  },
  verbose: true, // 启用详细日志，方便调试
  strict: true, // 启用严格模式，确保类型安全
});
