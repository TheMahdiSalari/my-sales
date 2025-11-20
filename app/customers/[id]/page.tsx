import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { customers, sales } from '@/lib/schema';
import { desc, eq } from 'drizzle-orm';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Calendar, CreditCard, Smartphone, AlertTriangle, CheckCircle2 } from 'lucide-react';

const formatPrice = (price: number) => new Intl.NumberFormat('fa-IR').format(price);

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CustomerDetailsPage({ params }: Props) {
  const { id } = await params;
  const customerId = Number(id);

  if (isNaN(customerId)) return notFound();

  // دریافت اطلاعات مشتری
  const customerResult = await db
    .select()
    .from(customers)
    .where(eq(customers.id, customerId))
    .limit(1);

  const customer = customerResult[0];

  if (!customer) {
    return (
       <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 text-center p-4">
         <h1 className="text-xl font-bold text-red-500">مشتری پیدا نشد!</h1>
         <Link href="/" className="text-blue-500 underline mt-4 block">بازگشت به صفحه اصلی</Link>
       </div>
    );
  }

  // دریافت تاریخچه خریدها
  const purchaseHistory = await db
    .select()
    .from(sales)
    .where(eq(sales.customerId, customerId))
    .orderBy(desc(sales.startDate));

  const totalSpent = purchaseHistory.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-8 transition-colors duration-300" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* --- دکمه بازگشت --- */}
        <Link href="/" className="inline-flex items-center text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-4 transition-colors">
          <ArrowRight className="ml-2" size={20} />
          بازگشت به لیست
        </Link>

        {/* --- کارت اطلاعات مشتری --- */}
        <Card className="border-t-4 border-blue-600 shadow-md bg-white dark:bg-gray-900 dark:border-t-blue-500 border-x-0 border-b-0">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{customer.name}</h1>
                
                <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400 text-sm">
                  <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded border dark:border-gray-700">
                    <Smartphone size={16} /> {customer.phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={16} /> عضویت: {customer.createdAt?.toLocaleDateString('fa-IR')}
                  </span>
                </div>

                {customer.description && (
                  <p className="mt-4 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded border dark:border-gray-700 text-sm">
                    📝 {customer.description}
                  </p>
                )}
              </div>

              {/* باکس مجموع خرج */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 min-w-[200px] text-center">
                <span className="text-blue-600 dark:text-blue-400 text-sm font-bold block mb-1">کل پرداختی تا امروز</span>
                <span className="text-2xl font-bold text-gray-800 dark:text-white">{formatPrice(totalSpent)}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">تومان</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* --- لیست تاریخچه خریدها --- */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <CreditCard className="text-blue-600 dark:text-blue-400" />
            تاریخچه خریدها ({purchaseHistory.length})
          </h2>

          {purchaseHistory.length === 0 ? (
            <div className="text-center py-10 bg-white dark:bg-gray-900 rounded-lg border border-dashed dark:border-gray-700 text-gray-400">
              هیچ سابقه‌ای موجود نیست.
            </div>
          ) : (
            <div className="grid gap-3">
              {purchaseHistory.map((sale) => (
                <Card key={sale.id} className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border dark:border-gray-700">
                  <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    
                    <div>
                      <div className="font-bold text-gray-800 dark:text-gray-100 text-lg flex items-center gap-2">
                        {formatPrice(sale.amount)} <span className="text-sm font-normal text-gray-500 dark:text-gray-400">تومان</span>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        تاریخ: {sale.startDate?.toLocaleDateString('fa-IR')}
                        {sale.duration && <span className="mr-2 text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full border dark:border-gray-700">{sale.duration} ماهه</span>}
                      </div>
                      {sale.tokenCode && (
                        <div className="text-xs text-gray-400 mt-1 font-mono bg-gray-100 dark:bg-gray-800 w-fit px-1 rounded">
                          {sale.tokenCode}
                        </div>
                      )}
                    </div>

                    {/* وضعیت پرداخت (آپدیت شده با نسیه) */}
                    <div className="text-left">
                        {sale.isPaid === false ? (
                            <span className="text-xs bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 px-3 py-1 rounded-full font-bold flex items-center gap-1 border border-orange-200 dark:border-orange-800">
                                <AlertTriangle size={14} /> در انتظار پرداخت
                            </span>
                        ) : (
                            <span className="text-xs bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full font-bold flex items-center gap-1 border border-emerald-200 dark:border-emerald-800">
                                <CheckCircle2 size={14} /> پرداخت موفق
                            </span>
                        )}
                    </div>

                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}