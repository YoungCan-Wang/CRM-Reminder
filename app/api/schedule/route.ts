
import { NextResponse } from 'next/server';
import { db } from '../../../db'; // 导入数据库客户端
import { reminders } from '../../../db/schema'; // 导入提醒表schema

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
    const [newReminder] = await db.insert(reminders).values({
      email,
      message,
      sendAt: new Date(sendAt), // 将ISO字符串转换为Date对象
    }).returning(); // 返回插入的记录

    console.log('Reminder saved to DB:', newReminder);

    // --- 返回响应 ---
    return NextResponse.json({ success: true, message: 'Reminder scheduled successfully!', reminder: newReminder }, { status: 200 });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
