import { Resend } from 'resend';
import 'dotenv/config'; // 确保加载环境变量

// 从环境变量获取 Resend API Key
const resendApiKey = process.env.RESEND_API_KEY;

// 检查 API Key 是否存在
if (!resendApiKey) {
  throw new Error('RESEND_API_KEY is not set in .env file');
}

// 初始化 Resend 客户端
const resend = new Resend(resendApiKey);

interface SendEmailOptions {
  to: string; // 收件人邮箱
  subject: string; // 邮件主题
  html: string; // 邮件HTML内容
  from?: string; // 发件人邮箱，默认为 process.env.RESEND_FROM_EMAIL 或一个通用地址
}

/**
 * 使用 Resend 发送邮件
 * @param options 邮件发送选项
 */
export async function sendReminderEmail({ to, subject, html, from }: SendEmailOptions) {
  try {
    // 默认发件人地址，请确保这个地址已在 Resend 中验证
    const defaultFrom = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

    const data = await resend.emails.send({
      from: from || defaultFrom,
      to: [to],
      subject,
      html,
    });

    console.log('Email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error; // 重新抛出错误以便调用者处理
  }
}
