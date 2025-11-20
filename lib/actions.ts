'use server' // این خط خیلی مهمه! یعنی این کد فقط سمت سرور اجرا میشه

import { db } from '@/lib/db';
import { customers } from '@/lib/schema';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { sales } from '@/lib/schema';

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