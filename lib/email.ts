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
export async function sendReminderEmail({ to, subject, html }: SendEmailOptions) {
  try {
    // 注意：为了确保测试顺利进行，我们强制使用 Resend 的测试发件人地址。
    // 在生产环境中，您应该替换为您在 Resend 验证过的域名邮箱。
    const fromAddress = 'onboarding@resend.dev';

    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [to],
      subject,
      html,
    });

    // 正确处理 Resend 可能返回的错误
    if (error) {
      console.error('Error response from Resend:', error);
      // 将 Resend 的错误信息包装成一个真正的 Error 对象并抛出
      throw new Error(`Resend API Error: ${error.message}`);
    }

    console.log('Email sent successfully:', data);
    return data;
  } catch (error) {
    // 捕获并记录所有错误（例如，网络问题或上面我们主动抛出的错误）
    console.error('General error in sendReminderEmail:', error);
    throw error; // 重新抛出错误，以便上层调用者（如 Cron Job）可以捕获
  }
}
