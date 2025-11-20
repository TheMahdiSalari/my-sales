import { createCustomer } from '@/lib/actions';
import { db } from '@/lib/db'; // کانکشن دیتابیس
import { customers } from '@/lib/schema'; // جدول مشتریان
import { desc } from 'drizzle-orm'; // برای مرتب‌سازی

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

// 1. کامپوننت را async می‌کنیم تا بتواند دیتابیس را بخواند
export default async function HomePage() {
  
  // 2. دریافت لیست مشتریان از دیتابیس (جدیدترین‌ها اول)
  const allCustomers = await db.select().from(customers).orderBy(desc(customers.createdAt));

  return (
    <div className="flex flex-col items-center min-h-screen p-4 bg-gray-50 gap-8">
      
      {/* بخش ۱: فرم ثبت */}
      <Card className="w-full max-w-md shadow-lg border-t-4 border-blue-600">
        <CardHeader>
          <CardTitle className="text-center text-xl font-bold">ثبت مشتری جدید 👤</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createCustomer} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">نام مشتری</Label>
              <Input name="name" id="name" placeholder="مثلاً: علی حسینی" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">شماره تماس</Label>
              <Input name="phone" id="phone" type="tel" placeholder="0912..." required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">توضیحات</Label>
              <Textarea name="description" id="description" placeholder="مدل گوشی یا توضیحات..." />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
              ثبت اطلاعات
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* بخش ۲: لیست مشتریان (جدید) */}
      <div className="w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">آخرین مشتریان ثبت شده:</h2>
        <div className="grid gap-3">
          {allCustomers.length === 0 ? (
            <p className="text-center text-gray-400">هنوز مشتری ثبت نشده است.</p>
          ) : (
            allCustomers.map((customer) => (
              <Card key={customer.id} className="p-4 flex justify-between items-center hover:shadow-md transition-shadow">
                <div>
                  <h3 className="font-bold text-gray-800">{customer.name}</h3>
                  <p className="text-sm text-gray-500">{customer.phone}</p>
                  {customer.description && (
                    <p className="text-xs text-gray-400 mt-1">{customer.description}</p>
                  )}
                </div>
                <div className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                  {customer.createdAt ? customer.createdAt.toLocaleDateString('fa-IR') : '-'}
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

    </div>
  );
}