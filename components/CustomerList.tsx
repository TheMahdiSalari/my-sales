'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, ExternalLink, Search } from 'lucide-react';
import { SaleDialog } from '@/components/SaleDialog';
import { InvoiceButton } from '@/components/InvoiceButton';
import { EditCustomerDialog } from '@/components/EditCustomerDialog';
import { deleteCustomer } from '@/lib/actions';

const formatPrice = (price: number) => new Intl.NumberFormat('fa-IR').format(price);

// 1. تعریف دقیق تایپ‌ها (دیگه از any استفاده نمی‌کنیم)
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
  duration: number;
  tokenCode: string | null;
};

// 2. استفاده از تایپ‌های بالا در Props
interface CustomerListProps {
  customers: Customer[];
  allSales: Sale[];
  monthlySales: Sale[];
}

export function CustomerList({ customers, allSales, monthlySales }: CustomerListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // فیلتر کردن مشتریان
  const filteredCustomers = customers.filter((customer) => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    customer.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-4">
      
      {/* --- نوار جستجو --- */}
      <div className="flex items-center gap-2 mb-6">
        <div className="relative w-full">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            placeholder="جستجو با نام یا شماره تماس..." 
            className="pr-10 bg-white h-12 text-base shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg border border-blue-100 whitespace-nowrap hidden sm:block">
           {filteredCustomers.length} نفر
        </div>
      </div>

      {/* --- لیست کارت‌ها --- */}
      {filteredCustomers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-200 text-gray-400">
          مشتری با این مشخصات پیدا نشد.
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredCustomers.map((customer) => {
            
            const saleInThisMonth = monthlySales.find(s => s.customerId === customer.id);
            // پیدا کردن آخرین خرید از کل لیست فروش‌ها
            const lastSaleEver = allSales.find(s => s.customerId === customer.id);

            return (
              <Card key={customer.id} className={`group transition-all duration-200 border ${saleInThisMonth ? 'border-emerald-200 bg-emerald-50/30' : 'border-gray-100 hover:shadow-md'}`}>
                <CardContent className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  
                  <div className="flex-1 w-full md:w-auto">
                    {/* اسم و لینک */}
                    <div className="flex items-center gap-3">
                      <Link href={`/customers/${customer.id}`} className="group-hover:text-blue-600 transition-colors flex items-center gap-2">
                          <h3 className="font-bold text-gray-900 text-lg hover:underline">{customer.name}</h3>
                          <ExternalLink size={14} className="opacity-0 group-hover:opacity-50 transition-opacity" />
                      </Link>
                      
                      <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded border">
                        {customer.phone}
                      </span>
                    </div>
                    
                    {/* وضعیت */}
                    <div className="mt-2 flex items-center gap-2">
                      {saleInThisMonth ? (
                        <span className="text-xs text-emerald-700 bg-emerald-100 px-2 py-1 rounded font-bold flex items-center gap-1">
                          ✅ پرداخت شده: {formatPrice(saleInThisMonth.amount)} تومان
                          <span className="text-[10px] opacity-70">({saleInThisMonth.startDate?.toLocaleDateString('fa-IR')})</span>
                        </span>
                      ) : (
                          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                              {lastSaleEver 
                                  ? `آخرین خرید: ${lastSaleEver.startDate?.toLocaleDateString('fa-IR')}` 
                                  : 'بدون سابقه خرید'}
                          </span>
                      )}
                    </div>
                  </div>

                  {/* دکمه‌ها */}
                  <div className="flex flex-wrap items-center justify-end gap-2 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0">
                      <EditCustomerDialog customer={customer} />

                      <form action={deleteCustomer}>
                        <input type="hidden" name="id" value={customer.id} />
                        <Button variant="ghost" size="icon" type="submit" className="text-gray-400 hover:text-red-600 hover:bg-red-50" title="حذف">
                          <Trash2 size={18} />
                        </Button>
                      </form>

                      <div className="w-[1px] h-6 bg-gray-200 mx-1 hidden sm:block"></div>

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