
import { NextResponse } from 'next/server'; // 导入Next.js的NextResponse，用于构建API响应

// 处理POST请求的异步函数
export async function POST(request: Request) {
  try {
    const body = await request.json(); // 解析请求体中的JSON数据
    const { email, message, sendAt } = body; // 解构出email, message, sendAt字段

    // --- 输入验证 ---
    // 检查所有必需字段是否存在
    if (!email || !message || !sendAt) {
      // 如果缺少任何字段，返回400 Bad Request错误
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // TODO: 将提醒保存到数据库
    // 这一步将在后续实现，目前仅打印接收到的数据
    console.log('Received reminder:', { email, message, sendAt });

    // --- 返回响应 ---
    // 返回成功响应，告知客户端提醒已接收
    return NextResponse.json({ success: true, message: 'Reminder received' }, { status: 200 });

  } catch (error) {
    // 捕获处理请求过程中可能发生的任何错误
    console.error('API Error:', error); // 打印错误到服务器日志
    // 返回500 Internal Server Error，告知客户端服务器端发生错误
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
