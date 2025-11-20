// app/customers/[id]/page.tsx

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { customers, sales } from '@/lib/schema';
import { desc, eq } from 'drizzle-orm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Calendar, CreditCard, Smartphone } from 'lucide-react';

const formatPrice = (price: number) => new Intl.NumberFormat('fa-IR').format(price);

// این صفحه قراره آیدی رو از URL بخونه (مثلا: customers/5)
interface Props {
  params: Promise<{ id: string }>;
}

export default async function CustomerDetailsPage({ params }: Props) {
  // 1. دریافت آیدی از پارامترها (در Next.js 16 باید await بشه)
  const { id } = await params;
  const customerId = Number(id);

  // 2. پیدا کردن مشتری
  const customer = await db.query.customers.findFirst({
    where: eq(customers.id, customerId),
  });

  if (!customer) {
    notFound(); // اگر مشتری نبود، صفحه 404 بده
  }

  // 3. دریافت تاریخچه خریدها
  const purchaseHistory = await db
    .select()
    .from(sales)
    .where(eq(sales.customerId, customerId))
    .orderBy(desc(sales.startDate));

  // 4. محاسبه آمار
  const totalSpent = purchaseHistory.reduce((acc, curr) => acc + curr.amount, 0);
  const lastPurchase = purchaseHistory[0];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* --- دکمه بازگشت --- */}
        <Link href="/" className="inline-flex items-center text-gray-500 hover:text-blue-600 mb-4 transition-colors">
          <ArrowRight className="ml-2" size={20} />
          بازگشت به لیست
        </Link>

        {/* --- هدر و اطلاعات کلی --- */}
        <Card className="border-t-4 border-blue-600 shadow-md">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{customer.name}</h1>
                <div className="flex items-center gap-4 text-gray-500 text-sm">
                  <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                    <Smartphone size={16} /> {customer.phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={16} /> عضویت: {customer.createdAt?.toLocaleDateString('fa-IR')}
                  </span>
                </div>
                {customer.description && (
                  <p className="mt-4 text-gray-600 bg-gray-50 p-3 rounded border text-sm">
                    📝 {customer.description}
                  </p>
                )}
              </div>

              {/* باکس مجموع خرج */}
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 min-w-[200px] text-center">
                <span className="text-blue-600 text-sm font-bold block mb-1">کل پرداختی تا امروز</span>
                <span className="text-2xl font-bold text-gray-800">{formatPrice(totalSpent)}</span>
                <span className="text-xs text-gray-500 mr-1">تومان</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* --- تاریخچه خریدها --- */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <CreditCard className="text-blue-600" />
            تاریخچه خریدها ({purchaseHistory.length})
          </h2>

          {purchaseHistory.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-lg border border-dashed text-gray-400">
              هیچ سابقه‌ای موجود نیست.
            </div>
          ) : (
            <div className="grid gap-3">
              {purchaseHistory.map((sale) => (
                <Card key={sale.id} className="hover:bg-gray-50 transition-colors border-l-4 border-l-emerald-500">
                  <CardContent className="p-4 flex justify-between items-center">
                    
                    <div>
                      <div className="font-bold text-gray-800 text-lg">
                        {formatPrice(sale.amount)} <span className="text-sm font-normal text-gray-500">تومان</span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        تاریخ شروع: {sale.startDate?.toLocaleDateString('fa-IR')}
                        {sale.duration && <span className="mr-2 text-xs bg-gray-200 px-2 rounded-full">{sale.duration} ماهه</span>}
                      </div>
                      {sale.tokenCode && (
                        <div className="text-xs text-gray-400 mt-1 font-mono bg-gray-100 w-fit px-1 rounded">
                          {sale.tokenCode}
                        </div>
                      )}
                    </div>

                    {/* وضعیت */}
                    <div className="text-left">
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-bold">
                            پرداخت موفق
                        </span>
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