import { createCustomer } from '@/lib/actions';
import { db } from '@/lib/db';
import { customers, sales } from '@/lib/schema';
import { desc } from 'drizzle-orm';
// UserButton مستقیم حذف شد و با UserButtonToggle جایگزین شد

// --- Components ---
import { MonthFilter } from '@/components/MonthFilter';
import { CustomerList } from '@/components/CustomerList';
import { RevenueChart } from '@/components/RevenueChart';
import { ExcelExportButton } from '@/components/ExcelExportButton';
import { ModeToggle } from '@/components/ModeToggle';
import { UserButtonToggle } from '@/components/UserButtonToggle'; // کامپوننت اصلاح شده Clerk برای Dark Mode

// --- UI ---
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
  
  // 1. لاجیک Next.js 16: خواندن پارامترهای URL
  const params = await searchParams;
  const currentMonthStr = new Date().toLocaleDateString('fa-IR-u-nu-latn').split('/')[1];
  const selectedMonth = (params.month as string) || currentMonthStr;

  // 2. دریافت داده‌ها از دیتابیس
  const allCustomers = await db.select().from(customers).orderBy(desc(customers.createdAt));
  const allSales = await db.select().from(sales).orderBy(desc(sales.startDate));

  // 3. فیلتر کردن فروش‌ها بر اساس ماه انتخاب شده
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
    <div className="min-h-screen p-4 md:p-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* --- Header --- */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border dark:border-gray-800">
          <div className="flex items-center gap-4">
             <UserButtonToggle /> {/* دکمه کاربری با تم اصلاح شده */}
             <div className="h-8 w-[1px] bg-gray-200 dark:bg-gray-700 hidden md:block"></div>
             <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">پنل مدیریت فروش</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <ModeToggle />
            <MonthFilter />
          </div>
        </div>

        {/* --- Stats Cards --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gray-900 dark:bg-emerald-950 text-white shadow-lg border-none relative overflow-hidden">
            <div className="absolute top-0 left-0 p-4 opacity-20 text-6xl grayscale-0">💰</div>
            <CardContent className="p-6 flex flex-col gap-2 z-10 relative">
              <span className="text-gray-300 dark:text-emerald-200 text-sm font-medium">درآمد در {currentMonthName}</span>
              <div className="text-3xl font-bold flex items-end gap-2 text-emerald-400">
                {formatPrice(monthlyRevenue)} 
                <span className="text-lg font-normal text-white opacity-80">تومان</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-700 dark:bg-blue-900 text-white shadow-lg border-none">
            <CardContent className="p-6 flex flex-col gap-2">
              <span className="text-blue-100 text-sm font-medium">فاکتورهای {currentMonthName}</span>
              <div className="text-3xl font-bold">
                {monthlySalesCount} <span className="text-lg font-normal">عدد</span>
              </div>
            </CardContent>
          </Card>

           <Card className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow-sm border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6 flex flex-col gap-2">
              <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">کل مشتریان</span>
              <div className="text-3xl font-bold">
                {allCustomers.length} <span className="text-lg font-normal">نفر</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* --- Form & Chart (2/3 نمودار - 1/3 فرم) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          
          {/* 1. فرم ثبت مشتری (سمت راست - 1 قسمت) */}
          <div className="h-full lg:col-span-1">
            <Card className="shadow-md border-t-4 border-gray-800 dark:border-gray-600 dark:bg-gray-900 h-full flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-800 dark:text-gray-100">ثبت مشتری جدید</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-center">
                <form action={createCustomer} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="dark:text-gray-300">نام و نام خانوادگی</Label>
                    <Input name="name" required className="bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400" />
                  </div>
                  <div className="space-y-2">
                    <Label className="dark:text-gray-300">شماره موبایل</Label>
                    <Input name="phone" type="tel" required className="bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white text-left dir-ltr placeholder:text-gray-400" />
                  </div>
                  <div className="space-y-2">
                    <Label className="dark:text-gray-300">توضیحات</Label>
                    <Textarea name="description" className="bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400" />
                  </div>
                  <Button type="submit" className="w-full bg-gray-900 hover:bg-black dark:bg-gray-700 dark:hover:bg-gray-600 text-white mt-2">
                    افزودن
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* 2. نمودار فروش (سمت چپ - 2 قسمت) */}
          <div className="h-full lg:col-span-2">
            <RevenueChart sales={allSales} />
          </div>

        </div>

        {/* --- Customer List --- */}
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-2 border-b dark:border-gray-800 pb-4 gap-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <span className="w-2 h-6 rounded bg-blue-600 inline-block"></span>
                  وضعیت مشتریان
                </h2>
                <ExcelExportButton customers={allCustomers} sales={allSales} />
            </div>
            
            <CustomerList 
              customers={allCustomers}
              allSales={allSales}
              monthlySales={monthlySales}
            />
        </div>

      </div>
    </div>
  );
}