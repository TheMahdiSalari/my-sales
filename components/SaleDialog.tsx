'use client'; // چون تعامل داره (کلیک و باز شدن) باید کلاینت باشه

import { useState } from 'react';
import { createSale } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export function SaleDialog({ customerId, customerName }: { customerId: number, customerName: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
          💰 ثبت فروش
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ثبت فروش برای {customerName}</DialogTitle>
        </DialogHeader>
        
        {/* فرم ثبت فروش */}
        <form 
          action={async (formData) => {
            await createSale(formData);
            setOpen(false); // بعد از ثبت، پنجره بسته شه
          }} 
          className="space-y-4 mt-4"
        >
          {/* آیدی مشتری رو مخفی می‌فرستیم */}
          <input type="hidden" name="customerId" value={customerId} />

          <div className="space-y-2">
            <Label>مبلغ پرداختی (تومان)</Label>
            <Input name="amount" type="number" placeholder="مثلا 150000" required />
          </div>

          <div className="space-y-2">
            <Label>مدت زمان</Label>
            <select name="duration" className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
              <option value="1">۱ ماهه</option>
              <option value="3">۳ ماهه</option>
              <option value="6">۶ ماهه</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>کد توکن / توضیحات</Label>
            <Input name="description" placeholder="کد v2ray یا توضیحات..." />
          </div>

          <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
            تایید و دریافت پول
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}