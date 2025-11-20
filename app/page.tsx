import { createCustomer } from '@/lib/actions';
import { db } from '@/lib/db';
import { customers } from '@/lib/schema';
import { desc } from 'drizzle-orm';
import { SaleDialog } from '@/components/SaleDialog'; // کامپوننت فروشی که ساختی

// کامپوننت‌های UI
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

// این صفحه به صورت Server Component اجرا می‌شود
export default async function HomePage() {
  
  // 1. دریافت لیست مشتریان از دیتابیس (جدیدترین‌ها اول)
  const allCustomers = await db.select().from(customers).orderBy(desc(customers.createdAt));

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* --- هدر و آمار ساده --- */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800">دشبورد مدیریت فیلتر 🚀</h1>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border text-sm font-medium text-gray-600">
            تعداد کل مشتریان: <span className="text-blue-600 text-lg mr-1">{allCustomers.length}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* --- ستون سمت راست: فرم ثبت مشتری --- */}
          <div className="md:col-span-1">
            <Card className="shadow-md border-t-4 border-blue-600 sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg">ثبت مشتری جدید</CardTitle>
              </CardHeader>
              <CardContent>
                <form action={createCustomer} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">نام مشتری</Label>
                    <Input name="name" id="name" placeholder="نام خانوادگی" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">شماره تماس</Label>
                    <Input name="phone" id="phone" type="tel" placeholder="0912..." required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">توضیحات</Label>
                    <Textarea name="description" id="description" placeholder="مدل گوشی / توضیحات..." />
                  </div>

                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                    افزودن مشتری
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* --- ستون سمت چپ: لیست مشتریان --- */}
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">لیست مشتریان</h2>
            
            {allCustomers.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-lg border border-dashed text-gray-400">
                هنوز مشتری ثبت نکرده‌اید.
              </div>
            ) : (
              <div className="space-y-3">
                {allCustomers.map((customer) => (
                  <Card key={customer.id} className="hover:shadow-md transition-all duration-200">
                    <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      
                      {/* اطلاعات مشتری */}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-gray-800 text-lg">{customer.name}</h3>
                          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                            {customer.phone}
                          </span>
                        </div>
                        {customer.description && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                            {customer.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          تاریخ ثبت: {customer.createdAt ? customer.createdAt.toLocaleDateString('fa-IR') : '-'}
                        </p>
                      </div>

                      {/* دکمه عملیات */}
                      <div className="shrink-0">
                         {/* اینجا کامپوننت دیالوگ فروش را صدا می‌زنیم */}
                         <SaleDialog 
                            customerId={customer.id} 
                            customerName={customer.name} 
                         />
                      </div>

                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}