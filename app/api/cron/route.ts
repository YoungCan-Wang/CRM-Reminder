import { NextResponse } from 'next/server';
import { db } from '@/db';
import { reminders } from '@/db/schema';
import { eq, and, isNotNull, lt } from 'drizzle-orm';
import { sendReminderEmail } from '@/lib/email';

// 处理GET请求的异步函数，Vercel Cron Job 将调用此路由
export async function GET() {
  try {
    // 1. 查询所有状态为 'pending' 且 sendAt 时间已到的提醒
    const remindersToSend = await db.select()
      .from(reminders)
      .where(and(
        eq(reminders.status, 'pending'),
        lt(reminders.sendAt, new Date()) // sendAt 小于当前时间
      ));

    console.log(`Found ${remindersToSend.length} reminders to send.`);

    // 2. 遍历并发送每个提醒
    for (const reminder of remindersToSend) {
      try {
        console.log(`Attempting to send reminder ${reminder.id} to ${reminder.email}`);
        await sendReminderEmail({
          to: reminder.email,
          subject: 'Your Scheduled Reminder',
          html: `<p>${reminder.message}</p><p>This is your scheduled reminder.</p>`,
          // from: 'your_verified_email@example.com', // 可选：指定发件人，确保已在 Resend 验证
        });

        // 3. 更新数据库中的提醒状态为 'sent'
        await db.update(reminders)
          .set({ status: 'sent', sentAt: new Date() })
          .where(eq(reminders.id, reminder.id));
        
        console.log(`Reminder ${reminder.id} sent and status updated.`);

      } catch (emailError) {
        console.error(`Failed to send email for reminder ${reminder.id}:`, emailError);
        // 4. 如果发送失败，更新数据库中的提醒状态为 'failed'
        await db.update(reminders)
          .set({ status: 'failed' })
          .where(eq(reminders.id, reminder.id));
      }
    }

    return NextResponse.json({ success: true, sentCount: remindersToSend.length }, { status: 200 });
  } catch (error) {
    console.error('Cron Job Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
