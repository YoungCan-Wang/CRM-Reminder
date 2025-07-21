
import { NextResponse } from 'next/server'; // 导入Next.js的NextResponse，用于构建API响应
import { db } from '@/db'; // 导入数据库客户端
import { reminders } from '@/db/schema'; // 导入提醒表schema

// 处理POST请求的异步函数
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, message, sendAt } = body;

    // --- 输入验证 ---
    if (!email || !message || !sendAt) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // --- 将提醒保存到数据库 ---
    // 使用Drizzle ORM将数据插入到reminders表中
    const [newReminder] = await db.insert(reminders).values({
      email,
      message,
      sendAt: new Date(sendAt), // 将ISO字符串转换为Date对象
    }).returning(); // 返回插入的记录，以便在响应中使用

    console.log('Reminder saved to DB:', newReminder); // 打印保存的提醒信息到服务器日志

    // --- 返回响应 ---
    // 返回成功响应，告知客户端提醒已成功调度，并包含新提醒的数据
    return NextResponse.json({ success: true, message: 'Reminder scheduled successfully!', reminder: newReminder }, { status: 200 });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
