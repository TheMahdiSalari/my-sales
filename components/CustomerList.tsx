'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, ExternalLink, Search, Copy, AlertTriangle, XCircle, Banknote, CheckCircle2 } from 'lucide-react';
import { SaleDialog } from '@/components/SaleDialog';
import { InvoiceButton } from '@/components/InvoiceButton';
import { EditCustomerDialog } from '@/components/EditCustomerDialog';
import { deleteCustomer, settleDebt } from '@/lib/actions'; // اکشن تسویه حساب

const formatPrice = (price: number) => new Intl.NumberFormat('fa-IR').format(price);

// --- تعریف تایپ‌های دقیق ---
type Customer = {
  id: number;
  name: string;
  phone: string;
  description: string | null;
  createdAt: Date | null;
};

type Sale = {
  id: number;
  customerId: number | null;
  amount: number;
  startDate: Date | null;
  endDate: Date | null;
  duration: number;
  tokenCode: string | null;
  isPaid: boolean | null; // فیلد وضعیت پرداخت
};

interface CustomerListProps {
  customers: Customer[];
  allSales: Sale[];
  monthlySales: Sale[];
}

export function CustomerList({ customers, allSales, monthlySales }: CustomerListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // فیلتر جستجو
  const filteredCustomers = customers.filter((customer) => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    customer.phone.includes(searchTerm)
  );

  // کپی متن تمدید
  const handleCopyRenewal = (customerName: string, amount: number) => {
    const text = `سلام ${customerName} عزیز 🌹\nاشتراک سرویس اینترنت شما به پایان رسیده.\nجهت تمدید مبلغ ${formatPrice(amount)} تومان را واریز کنید.\nبا تشکر`;
    navigator.clipboard.writeText(text);
    alert('متن تمدید کپی شد!');
  };

  // محاسبه وضعیت انقضا
  const getStatus = (lastSale: Sale | undefined) => {
    if (!lastSale || !lastSale.endDate) return 'none';
    const today = new Date();
    const end = new Date(lastSale.endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

    if (diffDays < 0) return 'expired';
    if (diffDays <= 3) return 'warning';
    return 'active';
  };

  return (
    <div className="space-y-4">
      
      {/* --- نوار جستجو --- */}
      <div className="flex items-center gap-2 mb-6">
        <div className="relative w-full">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            placeholder="جستجو با نام یا شماره..." 
            className="pr-10 bg-white dark:bg-gray-900 dark:border-gray-700 h-12 text-base shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200 px-4 py-2 rounded-lg border border-blue-100 dark:border-blue-800 whitespace-nowrap hidden sm:block">
           {filteredCustomers.length} نفر
        </div>
      </div>

      {/* --- لیست مشتریان --- */}
      {filteredCustomers.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-400">
          مشتری با این مشخصات پیدا نشد.
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredCustomers.map((customer) => {
            
            const saleInThisMonth = monthlySales.find(s => s.customerId === customer.id);
            const lastSaleEver = allSales.find(s => s.customerId === customer.id);
            
            // 1. بررسی بدهکاری: خرید کرده ولی پول نداده
            const isDebt = saleInThisMonth && saleInThisMonth.isPaid === false;

            // 2. بررسی انقضا
            const status = getStatus(lastSaleEver);

            // 3. تعیین رنگ‌بندی کارت
            let borderClass = 'border-gray-100 hover:shadow-md dark:border-gray-800';
            let bgClass = 'bg-white dark:bg-gray-900';
            
            if (isDebt) {
                // حالت بدهکار (نارنجی)
                borderClass = 'border-orange-400 border-l-4 shadow-sm dark:border-orange-500';
                bgClass = 'bg-orange-50 dark:bg-orange-950/30';
            } else if (status === 'expired') {
                // منقضی شده (قرمز)
                borderClass = 'border-red-300 shadow-sm dark:border-red-800';
                bgClass = 'bg-red-50 dark:bg-red-950/20';
            } else if (status === 'warning') {
                // هشدار انقضا (زرد)
                borderClass = 'border-yellow-400 shadow-sm dark:border-yellow-600';
                bgClass = 'bg-yellow-50 dark:bg-yellow-950/20';
            } else if (saleInThisMonth) {
                // عادی (سبز کمرنگ)
                borderClass = 'border-emerald-200 dark:border-emerald-800';
                bgClass = 'bg-emerald-50/30 dark:bg-emerald-950/20';
            }

            return (
              <Card key={customer.id} className={`group transition-all duration-200 border ${borderClass} ${bgClass}`}>
                <CardContent className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  
                  <div className="flex-1 w-full md:w-auto">
                    {/* لینک به صفحه جزئیات */}
                    <div className="flex items-center gap-3">
                      <Link href={`/customers/${customer.id}`} className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center gap-2">
                          <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg hover:underline">{customer.name}</h3>
                          <ExternalLink size={14} className="opacity-0 group-hover:opacity-50 transition-opacity" />
                      </Link>
                      
                      <span className="text-xs font-mono bg-white/50 dark:bg-black/30 text-gray-600 dark:text-gray-400 px-2 py-1 rounded border dark:border-gray-700">
                        {customer.phone}
                      </span>
                    </div>
                    
                    {/* نمایش وضعیت‌ها */}
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      
                      {/* بدهکاری */}
                      {isDebt && (
                          <span className="text-xs text-orange-700 dark:text-orange-300 bg-orange-100 dark:bg-orange-900 px-2 py-1 rounded font-bold flex items-center gap-1 animate-pulse">
                              <AlertTriangle size={14} /> در انتظار پرداخت
                          </span>
                      )}

                      {/* انقضا (اگر بدهکار نباشد یا برای اطلاع‌رسانی) */}
                      {!isDebt && status === 'expired' && (
                          <span className="text-xs text-red-700 bg-red-100 px-2 py-1 rounded font-bold flex items-center gap-1">
                              <XCircle size={14} /> منقضی شده
                          </span>
                      )}
                      {!isDebt && status === 'warning' && (
                          <span className="text-xs text-yellow-800 bg-yellow-200 px-2 py-1 rounded font-bold flex items-center gap-1">
                              <AlertTriangle size={14} /> تمدید نزدیک است
                          </span>
                      )}
                      {!isDebt && saleInThisMonth && status === 'active' && (
                          <span className="text-xs text-emerald-700 bg-emerald-100 px-2 py-1 rounded font-bold flex items-center gap-1">
                              <CheckCircle2 size={14} /> فعال
                          </span>
                      )}

                      {/* تاریخ پایان */}
                      <span className="text-xs text-gray-500 dark:text-gray-400 opacity-80">
                          {lastSaleEver 
                              ? `پایان: ${lastSaleEver.endDate?.toLocaleDateString('fa-IR')}` 
                              : 'بدون سابقه'}
                      </span>
                    </div>
                  </div>

                  {/* --- دکمه‌های عملیات --- */}
                  <div className="flex flex-wrap items-center justify-end gap-2 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-gray-200/50 dark:border-gray-700">
                      
                      {/* دکمه تسویه حساب (فقط برای بدهکارها) */}
                      {isDebt && (
                        <form action={settleDebt}>
                            <input type="hidden" name="saleId" value={saleInThisMonth.id} />
                            <Button 
                                variant="outline" 
                                size="sm" 
                                type="submit"
                                className="h-8 bg-green-600 text-white hover:bg-green-700 border-green-600 animate-bounce shadow-lg"
                                title="دریافت پول و تسویه"
                            >
                                <Banknote size={16} className="mr-1" /> دریافت شد
                            </Button>
                        </form>
                      )}

                      {/* کپی متن تمدید */}
                      {lastSaleEver && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 text-xs gap-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-100 text-gray-700 dark:text-gray-300"
                            onClick={() => handleCopyRenewal(customer.name, lastSaleEver.amount)}
                            title="کپی پیام تمدید"
                          >
                             <Copy size={12} /> پیام
                          </Button>
                      )}

                      <div className="w-[1px] h-6 bg-gray-300 dark:bg-gray-700 mx-1 hidden sm:block"></div>

                      {/* ویرایش مشتری */}
                      <EditCustomerDialog customer={customer} />

                      {/* حذف مشتری */}
                      <form action={deleteCustomer}>
                        <input type="hidden" name="id" value={customer.id} />
                        <Button variant="ghost" size="icon" type="submit" className="text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" title="حذف">
                          <Trash2 size={18} />
                        </Button>
                      </form>

                      {/* دانلود فاکتور (با ارسال وضعیت پرداخت) */}
                      {saleInThisMonth && (
                        <InvoiceButton 
                          data={{
                            customerName: customer.name,
                            phone: customer.phone,
                            amount: saleInThisMonth.amount,
                            date: saleInThisMonth.startDate ? saleInThisMonth.startDate.toLocaleDateString('fa-IR') : '-',
                            description: saleInThisMonth.tokenCode || 'سرویس اینترنت',
                            invoiceNumber: saleInThisMonth.id,
                            isPaid: saleInThisMonth.isPaid // ارسال وضعیت به PDF
                          }}
                        />
                      )}

                      {/* ثبت فروش جدید */}
                      <SaleDialog customerId={customer.id} customerName={customer.name} />
                  </div>

                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}