import { createCustomer, deleteCustomer } from '@/lib/actions';
import { db } from '@/lib/db';
import { customers, sales } from '@/lib/schema';
import { desc } from 'drizzle-orm';
import { UserButton } from "@clerk/nextjs"; 
import { Trash2 } from 'lucide-react'; // آیکون سطل آشغال

// --- کامپوننت‌های ما ---
import { SaleDialog } from '@/components/SaleDialog';
import { InvoiceButton } from '@/components/InvoiceButton';
import { EditCustomerDialog } from '@/components/EditCustomerDialog';

// --- کامپوننت‌های UI ---
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
  
  // 1. دریافت داده‌ها
  const allCustomers = await db.select().from(customers).orderBy(desc(customers.createdAt));
  const allSales = await db.select().from(sales).orderBy(desc(sales.startDate));

  // 2. آمار کلی
  const totalRevenue = allSales.reduce((acc, sale) => acc + sale.amount, 0);
  const totalSalesCount = allSales.length;

  return (
    <div className="min-h-screen p-4 md:p-8" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* --- هدر --- */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-center gap-4">
             <UserButton showName />
             <div className="h-8 w-[1px] bg-gray-200 hidden md:block"></div>
             <h1 className="text-xl md:text-2xl font-bold text-gray-800">پنل مدیریت مشتریان 🚀</h1>
          </div>
          <div className="text-sm text-gray-500 font-medium">
             {new Date().toLocaleDateString('fa-IR', { dateStyle: 'full' })}
          </div>
        </div>

        {/* --- آمار --- */}
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
              <span className="text-gray-500 text-sm font-medium">مشتریان فعال</span>
              <div className="text-3xl font-bold">
                {allCustomers.length} <span className="text-lg font-normal">نفر</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* --- محتوای اصلی --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ستون راست: فرم ثبت (سایز کوچکتر) */}
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
                    افزودن به لیست
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* ستون چپ: لیست مشتریان (سایز بزرگتر) */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-2 h-6 rounded bg-blue-600 inline-block"></span>
              لیست مشتریان
            </h2>
            
            {allCustomers.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-200 text-gray-400">
                هنوز مشتری ثبت نشده است.
              </div>
            ) : (
              <div className="grid gap-3">
                {allCustomers.map((customer) => {
                  const lastSale = allSales.find(s => s.customerId === customer.id);

                  return (
                    <Card key={customer.id} className="group hover:shadow-md transition-all duration-200 border border-gray-100">
                      <CardContent className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        
                        {/* اطلاعات مشتری */}
                        <div className="flex-1 w-full md:w-auto">
                          <div className="flex items-center gap-3">
                            <h3 className="font-bold text-gray-900 text-lg">{customer.name}</h3>
                            <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded border">
                              {customer.phone}
                            </span>
                          </div>
                          
                          {/* وضعیت خرید */}
                          <div className="mt-2 flex items-center gap-2">
                            {lastSale ? (
                              <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded font-medium">
                                آخرین خرید: {formatPrice(lastSale.amount)} تومان 
                                <span className="mx-1 opacity-50">|</span> 
                                {lastSale.startDate ? lastSale.startDate.toLocaleDateString('fa-IR') : ''}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400 italic">هنوز خریدی نداشته</span>
                            )}
                          </div>
                          
                          {customer.description && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-1">{customer.description}</p>
                          )}
                        </div>

                        {/* دکمه‌های عملیات */}
                        <div className="flex flex-wrap items-center justify-end gap-2 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0">
                           
                           {/* ۱. ویرایش */}
                           <EditCustomerDialog customer={customer} />

                           {/* ۲. حذف */}
                           <form action={deleteCustomer}>
                             <input type="hidden" name="id" value={customer.id} />
                             <Button 
                               variant="ghost" 
                               size="icon" 
                               type="submit" 
                               className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                               title="حذف مشتری"
                             >
                               <Trash2 size={18} />
                             </Button>
                           </form>

                           {/* خط جداکننده */}
                           <div className="w-[1px] h-6 bg-gray-200 mx-1 hidden sm:block"></div>

                           {/* ۳. دانلود فاکتور */}
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

                           {/* ۴. ثبت فروش جدید */}
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