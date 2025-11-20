import { createCustomer } from '@/lib/actions';
import { db } from '@/lib/db';
import { customers, sales } from '@/lib/schema'; // sales رو هم اضافه کردیم
import { desc, eq } from 'drizzle-orm';
import { SaleDialog } from '@/components/SaleDialog';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

// تابعی برای جدا کردن سه رقم سه رقم قیمت
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fa-IR').format(price);
};

export default async function HomePage() {
  
  // 1. دریافت مشتریان
  const allCustomers = await db.select().from(customers).orderBy(desc(customers.createdAt));
  
  // 2. دریافت تمام فروش‌ها (برای محاسبه درآمد)
  const allSales = await db.select().from(sales);

  // 3. محاسبه درآمد کل (جمع ستون amount)
  const totalRevenue = allSales.reduce((acc, sale) => acc + sale.amount, 0);

  // 4. محاسبه فروش‌های همین ماه (اختیاری: فعلا کل فروش رو نشون میدیم)
  const totalSalesCount = allSales.length;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8" dir="rtl">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* --- بخش جدید: کارت‌های آمار و گزارش --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* کارت درآمد کل */}
          <Card className="bg-green-600 text-white shadow-lg border-none">
            <CardContent className="p-6 flex flex-col gap-2">
              <span className="text-green-100 text-sm">درآمد کل کسب شده</span>
              <div className="text-3xl font-bold flex items-end gap-2">
                {formatPrice(totalRevenue)} 
                <span className="text-lg font-normal opacity-80">تومان</span>
              </div>
            </CardContent>
          </Card>

          {/* کارت تعداد فروش */}
          <Card className="bg-blue-600 text-white shadow-lg border-none">
            <CardContent className="p-6 flex flex-col gap-2">
              <span className="text-blue-100 text-sm">تعداد کل فیلترهای فروخته شده</span>
              <div className="text-3xl font-bold">
                {totalSalesCount} <span className="text-lg font-normal">عدد</span>
              </div>
            </CardContent>
          </Card>

           {/* کارت تعداد مشتری */}
           <Card className="bg-white text-gray-800 shadow-sm">
            <CardContent className="p-6 flex flex-col gap-2">
              <span className="text-gray-500 text-sm">مشتریان ثبت شده</span>
              <div className="text-3xl font-bold">
                {allCustomers.length} <span className="text-lg font-normal">نفر</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* --- ستون سمت راست: فرم ثبت مشتری --- */}
          <div className="md:col-span-1">
            <Card className="shadow-md border-t-4 border-gray-800 sticky top-4">
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
                  <Button type="submit" className="w-full bg-gray-800 hover:bg-gray-900 text-white">
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
                  <Card key={customer.id} className="hover:shadow-md transition-all duration-200 group">
                    <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      
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
                      </div>

                      <div className="shrink-0">
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