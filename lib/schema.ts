// lib/schema.ts
import { pgTable, serial, text, integer, boolean, timestamp, decimal } from 'drizzle-orm/pg-core';

// جدول مشتریان (کسانی که فیلتر می‌خرند)
export const customers = pgTable('customers', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(), // نام مشتری
  phone: text('phone').notNull(), // شماره تماس (برای پیگیری)
  description: text('description'), // توضیحات اضافه (مثلا: آیفون داره، کاربر حساسیه و...)
  createdAt: timestamp('created_at').defaultNow(),
});

// جدول فروش‌ها/تراکنش‌ها
export const sales = pgTable('sales', {
  id: serial('id').primaryKey(),
  customerId: integer('customer_id').references(() => customers.id), // وصل میشه به مشتری
  amount: integer('amount').notNull(), // مبلغ به تومان
  duration: integer('duration').notNull(), // مدت زمان (مثلا ۳۰ روز)
  startDate: timestamp('start_date').defaultNow(), // تاریخ شروع اکانت
  endDate: timestamp('end_date'), // تاریخ پایان (باید محاسبه بشه)
  isPaid: boolean('is_paid').default(true), // وضعیت پرداخت
  tokenCode: text('token_code'), // اون کد یا کانفیگی که بهش دادی (اختیاری)
});