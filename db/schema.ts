import { pgTable, serial, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';

export const reminderStatusEnum = pgEnum('reminder_status', ['pending', 'sent', 'failed']);

export const reminders = pgTable('reminders', {
  id: serial('id').primaryKey(),
  email: text('email').notNull(),
  message: text('message').notNull(),
  sendAt: timestamp('send_at', { withTimezone: true }).notNull(),
  status: reminderStatusEnum('status').default('pending').notNull(),
  sentAt: timestamp('sent_at', { withTimezone: true }),
});
