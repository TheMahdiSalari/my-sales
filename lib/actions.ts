'use server' // این خط خیلی مهمه! یعنی این کد فقط سمت سرور اجرا میشه

import { db } from '@/lib/db';
import { customers } from '@/lib/schema';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { sales } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function createCustomer(formData: FormData) {
  // 1. دریافت اطلاعات از فرم
  const name = formData.get('name') as string;
  const phone = formData.get('phone') as string;
  const description = formData.get('description') as string;

  // 2. ذخیره در دیتابیس
  await db.insert(customers).values({
    name,
    phone,
    description,
  });

  // 3. به‌روزرسانی کش (تا لیست مشتریان جدید رو نشون بده)
  revalidatePath('/');
  
  // 4. (اختیاری) برگشت به صفحه اصلی یا نمایش پیام
  // redirect('/'); 
  console.log("مشتری با موفقیت ثبت شد");
}

export async function createSale(formData: FormData) {
  const customerId = Number(formData.get('customerId'));
  const amount = Number(formData.get('amount'));
  const duration = Number(formData.get('duration')); // 1 یا 3 ماهه
  const description = formData.get('description') as string;

  // محاسبه تاریخ پایان (ساده)
  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + duration);

  await db.insert(sales).values({
    customerId,
    amount,
    duration,
    startDate: startDate,
    endDate: endDate,
    tokenCode: description,
    isPaid: true, // فعلا فرض می‌کنیم نقدی پرداخت کرده
  });

  revalidatePath('/');
  console.log("فروش ثبت شد");
}
// 1. ویرایش مشتری
export async function updateCustomer(formData: FormData) {
  const id = Number(formData.get('id'));
  const name = formData.get('name') as string;
  const phone = formData.get('phone') as string;
  const description = formData.get('description') as string;

  await db.update(customers)
    .set({ name, phone, description })
    .where(eq(customers.id, id));

  revalidatePath('/');
}

// 2. حذف مشتری (و تمام فروش‌هایش)
export async function deleteCustomer(formData: FormData) {
  const id = Number(formData.get('id'));

  // اول فروش‌های این مشتری رو پاک می‌کنیم (چون بهش وصلن)
  await db.delete(sales).where(eq(sales.customerId, id));
  
  // بعد خود مشتری رو پاک می‌کنیم
  await db.delete(customers).where(eq(customers.id, id));

  revalidatePath('/');
}