import { createCustomer, deleteCustomer } from '@/lib/actions';
import { db } from '@/lib/db';
import { customers, sales } from '@/lib/schema';
import { desc } from 'drizzle-orm';
import { UserButton } from "@clerk/nextjs"; 
import { Trash2 } from 'lucide-react';

import { SaleDialog } from '@/components/SaleDialog';
import { InvoiceButton } from '@/components/InvoiceButton';
import { EditCustomerDialog } from '@/components/EditCustomerDialog';
import { MonthFilter } from '@/components/MonthFilter';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

const formatPrice = (price: number) => new Intl.NumberFormat('fa-IR').format(price);

// نکته مهم: در Next.js 15/16 اینترفیس باید به صورت Promise باشد
type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function HomePage({ searchParams }: Props) {
  
  // ⚠️ تغییر اصلی اینجاست: باید searchParams را await کنیم
  const params = await searchParams;

  // 1. تشخیص ماه انتخابی
  const currentMonthStr = new Date().toLocaleDateString('fa-IR-u-nu-latn').split('/')[1];
  const selectedMonth = (params.month as string) || currentMonthStr;

  // 2. دریافت تمام داده‌ها
  const allCustomers = await db.select().from(customers).orderBy(desc(customers.createdAt));
  const allSales = await db.select().from(sales).orderBy(desc(sales.startDate));

  // 3. فیلتر کردن فروش‌ها بر اساس ماه انتخاب شده
  const monthlySales = allSales.filter(sale => {
    if (!sale.startDate) return false;
    // تبدیل تاریخ میلادی دیتابیس به شمسی
    const saleMonth = sale.startDate.toLocaleDateString('fa-IR-u-nu-latn').split('/')[1];
    
    // مقایسه عددی برای اطمینان (مثلا "08" با "8" برابر باشد)
    return Number(saleMonth) === Number(selectedMonth);
  });

  // 4. محاسبه آمار فقط برای همین ماه
  const monthlyRevenue = monthlySales.reduce((acc, sale) => acc + sale.amount, 0);
  const monthlySalesCount = monthlySales.length;

  // اسم ماه برای نمایش در متن
  const monthNames = ["", "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"];
  const currentMonthName = monthNames[Number(selectedMonth)];

  return (
    <div className="min-h-screen p-4 md:p-8" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* --- هدر --- */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-center gap-4">
             <UserButton showName />
             <div className="h-8 w-[1px] bg-gray-200 hidden md:block"></div>
             <h1 className="text-xl md:text-2xl font-bold text-gray-800">پنل مدیریت فروش</h1>
          </div>
          
          {/* کامپوننت انتخاب ماه */}
          <MonthFilter />
        </div>

        {/* --- آمار ماهانه --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gray-900 text-white shadow-lg border-none relative overflow-hidden">
            <div className="absolute top-0 left-0 p-4 opacity-10 text-6xl">💰</div>
            <CardContent className="p-6 flex flex-col gap-2 z-10">
              <span className="text-gray-300 text-sm font-medium">درآمد در {currentMonthName}</span>
              <div className="text-3xl font-bold flex items-end gap-2 text-emerald-400">
                {formatPrice(monthlyRevenue)} 
                <span className="text-lg font-normal text-white opacity-80">تومان</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-700 text-white shadow-lg border-none">
            <CardContent className="p-6 flex flex-col gap-2">
              <span className="text-blue-100 text-sm font-medium">فاکتورهای {currentMonthName}</span>
              <div className="text-3xl font-bold">
                {monthlySalesCount} <span className="text-lg font-normal">عدد</span>
              </div>
            </CardContent>
          </Card>

           <Card className="bg-white text-gray-800 shadow-sm border border-gray-200">
            <CardContent className="p-6 flex flex-col gap-2">
              <span className="text-gray-500 text-sm font-medium">کل مشتریان فعال</span>
              <div className="text-3xl font-bold">
                {allCustomers.length} <span className="text-lg font-normal">نفر</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* --- محتوای اصلی --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* فرم ثبت (ثابت) */}
          <div className="lg:col-span-4 xl:col-span-3">
            <Card className="shadow-md border-t-4 border-gray-800 sticky top-8">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-800">ثبت مشتری جدید</CardTitle>
              </CardHeader>
              <CardContent>
                <form action={createCustomer} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">نام و نام خانوادگی</Label>
                    <Input name="name" id="name" placeholder="مثلاً: علی محمدی" required className="bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">شماره موبایل</Label>
                    <Input name="phone" id="phone" type="tel" placeholder="0912..." required className="bg-gray-50 text-left dir-ltr" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">توضیحات</Label>
                    <Textarea name="description" id="description" placeholder="مدل گوشی / توضیحات..." className="bg-gray-50" />
                  </div>
                  <Button type="submit" className="w-full bg-gray-900 hover:bg-black text-white">
                    افزودن
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* لیست مشتریان */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-4">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span className="w-2 h-6 rounded bg-blue-600 inline-block"></span>
                وضعیت مشتریان در {currentMonthName}
                </h2>
            </div>
            
            {allCustomers.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-200 text-gray-400">
                هنوز مشتری ثبت نشده است.
              </div>
            ) : (
              <div className="grid gap-3">
                {allCustomers.map((customer) => {
                  
                  // پیدا کردن خریدی که دقیقاً در ماه انتخاب شده انجام شده باشد
                  const saleInThisMonth = monthlySales.find(s => s.customerId === customer.id);
                  
                  // پیدا کردن آخرین خرید کلی (بدون توجه به ماه) برای نمایش سابقه
                  // نکته: ما sales را بر اساس تاریخ مرتب کردیم، پس اولین موردی که پیدا شه، آخریشه
                  // اما اینجا باید از کل sales استفاده کنیم نه monthlySales
                  // پس یه فیلتر جدا روی allSales میزنیم برای هر مشتری
                  const lastSaleEver = allSales.find(s => s.customerId === customer.id);

                  return (
                    <Card key={customer.id} className={`group transition-all duration-200 border ${saleInThisMonth ? 'border-emerald-200 bg-emerald-50/30' : 'border-gray-100 hover:shadow-md'}`}>
                      <CardContent className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        
                        <div className="flex-1 w-full md:w-auto">
                          <div className="flex items-center gap-3">
                            <h3 className="font-bold text-gray-900 text-lg">{customer.name}</h3>
                            <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded border">
                              {customer.phone}
                            </span>
                          </div>
                          
                          {/* نمایش وضعیت در این ماه */}
                          <div className="mt-2 flex items-center gap-2">
                            {saleInThisMonth ? (
                              <span className="text-xs text-emerald-700 bg-emerald-100 px-2 py-1 rounded font-bold flex items-center gap-1">
                                ✅ پرداخت شده: {formatPrice(saleInThisMonth.amount)} تومان
                                <span className="text-[10px] opacity-70">({saleInThisMonth.startDate?.toLocaleDateString('fa-IR')})</span>
                              </span>
                            ) : (
                                // اگر در این ماه نخریده، نشون بده آخرین بار کی خریده
                                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                    {lastSaleEver 
                                        ? `آخرین خرید: ${lastSaleEver.startDate?.toLocaleDateString('fa-IR')}` 
                                        : 'بدون خرید در این ماه'}
                                </span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-end gap-2 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0">
                           <EditCustomerDialog customer={customer} />

                           <form action={deleteCustomer}>
                             <input type="hidden" name="id" value={customer.id} />
                             <Button variant="ghost" size="icon" type="submit" className="text-gray-400 hover:text-red-600 hover:bg-red-50">
                               <Trash2 size={18} />
                             </Button>
                           </form>

                           <div className="w-[1px] h-6 bg-gray-200 mx-1 hidden sm:block"></div>

                           {/* اگر در این ماه خرید داشته، دکمه دانلود فاکتور همون خرید رو نشون بده */}
                           {saleInThisMonth && (
                             <InvoiceButton 
                               data={{
                                 customerName: customer.name,
                                 phone: customer.phone,
                                 amount: saleInThisMonth.amount,
                                 date: saleInThisMonth.startDate ? saleInThisMonth.startDate.toLocaleDateString('fa-IR') : '-',
                                 description: saleInThisMonth.tokenCode || 'سرویس اینترنت',
                                 invoiceNumber: saleInThisMonth.id
                               }}
                             />
                           )}

                           {/* دکمه ثبت فروش همیشه هست */}
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