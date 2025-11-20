'use server';

import { db } from '@/lib/db';
import { customers, sales } from '@/lib/schema';
import { eq } from 'drizzle-orm'; // این خط حیاتی است
import { revalidatePath } from 'next/cache';

// 1. ثبت مشتری
export async function createCustomer(formData: FormData) {
  const name = formData.get('name') as string;
  const phone = formData.get('phone') as string;
  const description = formData.get('description') as string;

  await db.insert(customers).values({
    name,
    phone,
    description,
  });

  revalidatePath('/');
}

// 2. ثبت فروش (آپدیت شده با وضعیت پرداخت)
export async function createSale(formData: FormData) {
  const customerId = Number(formData.get('customerId'));
  const amount = Number(formData.get('amount'));
  const duration = Number(formData.get('duration'));
  const description = formData.get('description') as string;
  
  // اگر چک‌باکس تیک خورده باشد، مقدارش 'on' است
  const isPaid = formData.get('isPaid') === 'on';

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
    isPaid: isPaid, // ذخیره وضعیت پرداخت
  });

  revalidatePath('/');
}

// 3. آپدیت مشتری
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

// 4. حذف مشتری
export async function deleteCustomer(formData: FormData) {
  const id = Number(formData.get('id'));
  await db.delete(sales).where(eq(sales.customerId, id));
  await db.delete(customers).where(eq(customers.id, id));
  revalidatePath('/');
}

// 5. تسویه حساب (جدید)
export async function settleDebt(formData: FormData) {
  const saleId = Number(formData.get('saleId'));

  await db.update(sales)
    .set({ isPaid: true })
    .where(eq(sales.id, saleId));

  revalidatePath('/');
}