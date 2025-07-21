import { NextResponse } from 'next/server';
import { db } from '@/db'; // 导入数据库客户端
import { reminders } from '@/db/schema'; // 导入提醒表schema

// 处理GET请求的异步函数
export async function GET() {
  try {
    // 从数据库查询所有提醒
    const allReminders = await db.select().from(reminders);

    // 返回查询到的提醒列表
    return NextResponse.json({ reminders: allReminders }, { status: 200 });
  } catch (error) {
    console.error('API Error fetching reminders:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
