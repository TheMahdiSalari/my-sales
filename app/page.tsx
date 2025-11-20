import { createCustomer } from '@/lib/actions';
import { db } from '@/lib/db';
import { customers, sales } from '@/lib/schema';
import { desc } from 'drizzle-orm';
import { UserButton } from "@clerk/nextjs"; // دکمه پروفایل و خروج

// کامپوننت‌های کاستوم ما
import { SaleDialog } from '@/components/SaleDialog';
import { InvoiceButton } from '@/components/InvoiceButton';

// کامپوننت‌های UI
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

// تابع فرمت پول
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fa-IR').format(price);
};

export default async function HomePage() {
  
  // 1. دریافت داده‌ها از دیتابیس
  const allCustomers = await db.select().from(customers).orderBy(desc(customers.createdAt));
  const allSales = await db.select().from(sales).orderBy(desc(sales.startDate));

  // 2. محاسبات آماری
  const totalRevenue = allSales.reduce((acc, sale) => acc + sale.amount, 0);
  const totalSalesCount = allSales.length;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* --- هدر و پروفایل کاربری --- */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-center gap-4">
             {/* دکمه دایره‌ای تنظیمات اکانت و خروج */}
             <UserButton showName />
             <div className="h-8 w-[1px] bg-gray-200 hidden md:block"></div>
             <h1 className="text-xl md:text-2xl font-bold text-gray-800">پنل مدیریت فروش 🚀</h1>
          </div>
          <div className="text-sm text-gray-500">
            امروز: {new Date().toLocaleDateString('fa-IR')}
          </div>
        </div>

        {/* --- کارت‌های گزارش آماری --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-emerald-600 text-white shadow-lg border-none">
            <CardContent className="p-6 flex flex-col gap-2">
              <span className="text-emerald-100 text-sm font-medium">درآمد کل</span>
              <div className="text-3xl font-bold flex items-end gap-2">
                {formatPrice(totalRevenue)} 
                <span className="text-lg font-normal opacity-80">تومان</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-600 text-white shadow-lg border-none">
            <CardContent className="p-6 flex flex-col gap-2">
              <span className="text-blue-100 text-sm font-medium">تعداد فروش</span>
              <div className="text-3xl font-bold">
                {totalSalesCount} <span className="text-lg font-normal">عدد</span>
              </div>
            </CardContent>
          </Card>

           <Card className="bg-white text-gray-800 shadow-sm border border-gray-200">
            <CardContent className="p-6 flex flex-col gap-2">
              <span className="text-gray-500 text-sm font-medium">کل مشتریان</span>
              <div className="text-3xl font-bold">
                {allCustomers.length} <span className="text-lg font-normal">نفر</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* --- محتوای اصلی --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* ستون راست: فرم ثبت مشتری */}
          <div className="lg:col-span-1">
            <Card className="shadow-md border-t-4 border-gray-800 sticky top-8">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-800">ثبت مشتری جدید</CardTitle>
              </CardHeader>
              <CardContent>
                <form action={createCustomer} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">نام و نام خانوادگی</Label>
                    <Input name="name" id="name" placeholder="مثلاً: رضا علوی" required className="bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">شماره موبایل</Label>
                    <Input name="phone" id="phone" type="tel" placeholder="0912..." required className="bg-gray-50 text-left dir-ltr" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">توضیحات / مدل دستگاه</Label>
                    <Textarea name="description" id="description" placeholder="..." className="bg-gray-50" />
                  </div>
                  <Button type="submit" className="w-full bg-gray-900 hover:bg-black text-white transition-all">
                    افزودن مشتری
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* ستون چپ: لیست مشتریان */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
              لیست مشتریان
            </h2>
            
            {allCustomers.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-200 text-gray-400">
                <p>هنوز هیچ مشتری‌ای ثبت نشده است.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {allCustomers.map((customer) => {
                  // پیدا کردن آخرین خرید مشتری
                  const lastSale = allSales.find(s => s.customerId === customer.id);

                  return (
                    <Card key={customer.id} className="group hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden">
                      <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        
                        {/* اطلاعات مشتری */}
                        <div className="flex-1 w-full">
                          <div className="flex justify-between sm:justify-start items-center gap-3 mb-1">
                            <h3 className="font-bold text-gray-900 text-lg">{customer.name}</h3>
                            <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded border">
                              {customer.phone}
                            </span>
                          </div>
                          
                          {lastSale ? (
                             <div className="flex flex-wrap items-center gap-2 text-xs text-emerald-600 font-medium mt-2 bg-emerald-50 w-fit px-2 py-1 rounded">
                               <span>✅ خرید آخر: {formatPrice(lastSale.amount)} ت</span>
                               <span className="text-gray-300">|</span>
                               <span>{lastSale.startDate ? lastSale.startDate.toLocaleDateString('fa-IR') : ''}</span>
                             </div>
                          ) : (
                            <p className="text-xs text-gray-400 mt-2 italic">بدون خرید</p>
                          )}

                          {customer.description && (
                            <p className="text-xs text-gray-500 mt-2 line-clamp-1 opacity-70">
                              {customer.description}
                            </p>
                          )}
                        </div>

                        {/* دکمه‌ها */}
                        <div className="flex items-center gap-2 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 mt-2 sm:mt-0 justify-end">
                           
                           {/* دکمه دانلود فاکتور */}
                           {lastSale && (
                             <InvoiceButton 
                               data={{
                                 customerName: customer.name,
                                 phone: customer.phone,
                                 amount: lastSale.amount,
                                 date: lastSale.startDate ? lastSale.startDate.toLocaleDateString('fa-IR') : '-',
                                 description: lastSale.tokenCode || 'سرویس اینترنت',
                                 invoiceNumber: lastSale.id
                               }}
                             />
                           )}

                           {/* دکمه ثبت فروش */}
                           <SaleDialog 
                              customerId={customer.id} 
                              customerName={customer.name} 
                           />
                        </div>

                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}