'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, ExternalLink, Search, Copy, Check, AlertTriangle, XCircle } from 'lucide-react'; // آیکون‌های جدید
import { SaleDialog } from '@/components/SaleDialog';
import { InvoiceButton } from '@/components/InvoiceButton';
import { EditCustomerDialog } from '@/components/EditCustomerDialog';
import { deleteCustomer } from '@/lib/actions';
import { toast } from 'sonner'; // اگر نصب نیست، پایین می‌گم چطور الرت ساده بدی

const formatPrice = (price: number) => new Intl.NumberFormat('fa-IR').format(price);

// تایپ‌ها
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
  endDate: Date | null; // این فیلد رو نیاز داریم
  duration: number;
  tokenCode: string | null;
};

interface CustomerListProps {
  customers: Customer[];
  allSales: Sale[];
  monthlySales: Sale[];
}

export function CustomerList({ customers, allSales, monthlySales }: CustomerListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const filteredCustomers = customers.filter((customer) => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    customer.phone.includes(searchTerm)
  );

  // تابع کپی کردن متن تمدید
  const handleCopyRenewal = (customerName: string, amount: number) => {
    const text = `سلام ${customerName} عزیز 🌹\nاشتراک سرویس اینترنت شما به پایان رسیده.\nجهت تمدید مبلغ ${formatPrice(amount)} تومان را واریز کنید.\nبا تشکر`;
    
    navigator.clipboard.writeText(text);
    
    // نمایش تیک سبز برای چند ثانیه
    // چون ممکنه sonner نصب نباشه، از استیت ساده استفاده می‌کنیم
    alert('متن تمدید کپی شد! الان می‌تونی توی واتساپ/تلگرام پیست کنی.');
  };

  // تابع محاسبه وضعیت (قرمز/زرد/سبز)
  const getStatus = (lastSale: Sale | undefined) => {
    if (!lastSale || !lastSale.endDate) return 'none';

    const today = new Date();
    const end = new Date(lastSale.endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

    if (diffDays < 0) return 'expired'; // منقضی شده (قرمز)
    if (diffDays <= 3) return 'warning'; // کمتر از ۳ روز (زرد)
    return 'active'; // فعال (سبز/سفید)
  };

  return (
    <div className="space-y-4">
      
      <div className="flex items-center gap-2 mb-6">
        <div className="relative w-full">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            placeholder="جستجو با نام یا شماره..." 
            className="pr-10 bg-white h-12 text-base shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg border border-blue-100 whitespace-nowrap hidden sm:block">
           {filteredCustomers.length} نفر
        </div>
      </div>

      {filteredCustomers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-200 text-gray-400">
          مشتری پیدا نشد.
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredCustomers.map((customer) => {
            
            const saleInThisMonth = monthlySales.find(s => s.customerId === customer.id);
            const lastSaleEver = allSales.find(s => s.customerId === customer.id);
            
            // محاسبه وضعیت
            const status = getStatus(lastSaleEver);

            // تعیین استایل بر اساس وضعیت
            let borderClass = 'border-gray-100 hover:shadow-md';
            let bgClass = 'bg-white';
            
            if (status === 'expired') {
                borderClass = 'border-red-300 shadow-sm';
                bgClass = 'bg-red-50';
            } else if (status === 'warning') {
                borderClass = 'border-yellow-400 shadow-sm';
                bgClass = 'bg-yellow-50';
            } else if (saleInThisMonth) {
                borderClass = 'border-emerald-200';
                bgClass = 'bg-emerald-50/30';
            }

            return (
              <Card key={customer.id} className={`group transition-all duration-200 border ${borderClass} ${bgClass}`}>
                <CardContent className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  
                  <div className="flex-1 w-full md:w-auto">
                    <div className="flex items-center gap-3">
                      <Link href={`/customers/${customer.id}`} className="group-hover:text-blue-600 transition-colors flex items-center gap-2">
                          <h3 className="font-bold text-gray-900 text-lg hover:underline">{customer.name}</h3>
                          <ExternalLink size={14} className="opacity-0 group-hover:opacity-50 transition-opacity" />
                      </Link>
                      
                      <span className="text-xs font-mono bg-white/50 text-gray-600 px-2 py-1 rounded border">
                        {customer.phone}
                      </span>
                    </div>
                    
                    {/* نمایش وضعیت انقضا */}
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      {status === 'expired' && (
                          <span className="text-xs text-red-700 bg-red-100 px-2 py-1 rounded font-bold flex items-center gap-1 animate-pulse">
                              <XCircle size={14} /> منقضی شده
                          </span>
                      )}
                      {status === 'warning' && (
                          <span className="text-xs text-yellow-800 bg-yellow-200 px-2 py-1 rounded font-bold flex items-center gap-1">
                              <AlertTriangle size={14} /> تمدید نزدیک است
                          </span>
                      )}

                      {/* نمایش آخرین خرید */}
                      <span className="text-xs text-gray-500 opacity-80">
                          {lastSaleEver 
                              ? `پایان اشتراک: ${lastSaleEver.endDate?.toLocaleDateString('fa-IR')}` 
                              : 'بدون سابقه'}
                      </span>
                    </div>
                  </div>

                  {/* دکمه‌ها */}
                  <div className="flex flex-wrap items-center justify-end gap-2 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-gray-200/50">
                      
                      {/* دکمه کپی متن تمدید (فقط اگر خرید داشته باشه) */}
                      {lastSaleEver && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 text-xs gap-1 bg-white border-gray-300 hover:bg-gray-100 text-gray-700"
                            onClick={() => handleCopyRenewal(customer.name, lastSaleEver.amount)}
                            title="کپی متن تمدید"
                          >
                             <Copy size={12} /> پیام تمدید
                          </Button>
                      )}

                      <div className="w-[1px] h-6 bg-gray-300 mx-1 hidden sm:block"></div>

                      <EditCustomerDialog customer={customer} />

                      <form action={deleteCustomer}>
                        <input type="hidden" name="id" value={customer.id} />
                        <Button variant="ghost" size="icon" type="submit" className="text-gray-400 hover:text-red-600 hover:bg-red-50" title="حذف">
                          <Trash2 size={18} />
                        </Button>
                      </form>

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