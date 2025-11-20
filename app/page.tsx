import { createCustomer } from '@/lib/actions';
import { db } from '@/lib/db';
import { customers, sales } from '@/lib/schema';
import { desc } from 'drizzle-orm';
import { UserButton } from "@clerk/nextjs"; 

// --- کامپوننت‌های ما ---
import { MonthFilter } from '@/components/MonthFilter';
import { CustomerList } from '@/components/CustomerList'; // <--- ایمپورت جدید

// --- کامپوننت‌های UI ---
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

const formatPrice = (price: number) => new Intl.NumberFormat('fa-IR').format(price);

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function HomePage({ searchParams }: Props) {
  
  const params = await searchParams;
  const currentMonthStr = new Date().toLocaleDateString('fa-IR-u-nu-latn').split('/')[1];
  const selectedMonth = (params.month as string) || currentMonthStr;

  // دریافت داده‌ها
  const allCustomers = await db.select().from(customers).orderBy(desc(customers.createdAt));
  const allSales = await db.select().from(sales).orderBy(desc(sales.startDate));

  // فیلتر فروش‌های این ماه (برای محاسبه آمار و پاس دادن به لیست)
  const monthlySales = allSales.filter(sale => {
    if (!sale.startDate) return false;
    const saleMonth = sale.startDate.toLocaleDateString('fa-IR-u-nu-latn').split('/')[1];
    return Number(saleMonth) === Number(selectedMonth);
  });

  const monthlyRevenue = monthlySales.reduce((acc, sale) => acc + sale.amount, 0);
  const monthlySalesCount = monthlySales.length;

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
          <MonthFilter />
        </div>

        {/* --- آمار --- */}
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
              <span className="text-gray-500 text-sm font-medium">کل مشتریان ثبت شده</span>
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

          {/* لیست مشتریان (با قابلیت سرچ) */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-4">
            <div className="flex justify-between items-center mb-2 border-b pb-2">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <span className="w-2 h-6 rounded bg-blue-600 inline-block"></span>
                  وضعیت مشتریان در {currentMonthName}
                </h2>
            </div>
            
            {/* کامپوننت لیست که ساختیم رو اینجا صدا می‌زنیم */}
            <CustomerList 
              customers={allCustomers}
              allSales={allSales}
              monthlySales={monthlySales}
            />
            
          </div>
        </div>
      </div>
    </div>
  );
}