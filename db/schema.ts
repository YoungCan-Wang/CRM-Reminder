import { pgTable, serial, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';

// 定义提醒状态的枚举类型
export const reminderStatusEnum = pgEnum('reminder_status', ['pending', 'sent', 'failed']);

// 定义 reminders 表
export const reminders = pgTable('reminders', {
  id: serial('id').primaryKey(), // 自增主键
  email: text('email').notNull(), // 收件人邮箱，非空
  message: text('message').notNull(), // 消息内容，非空
  sendAt: timestamp('send_at', { withTimezone: true }).notNull(), // 计划发送时间，带时区，非空
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(), // 创建时间，默认当前时间，非空
  sentAt: timestamp('sent_at', { withTimezone: true }), // 实际发送时间，可为空
  status: reminderStatusEnum('status').default('pending').notNull(), // 提醒状态，默认'pending'，非空
});
