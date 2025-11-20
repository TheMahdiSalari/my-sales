'use server' // این خط خیلی مهمه! یعنی این کد فقط سمت سرور اجرا میشه

import { db } from '@/lib/db';
import { customers } from '@/lib/schema';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

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