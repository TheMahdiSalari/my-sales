'use client';

import { useState } from 'react';
import { createSale } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export function SaleDialog({ customerId, customerName }: { customerId: number, customerName: string }) {
  const [open, setOpen] = useState(false);
  
  // استیت برای نگهداری مبلغ نمایشی (با ویرگول)
  const [displayAmount, setDisplayAmount] = useState(''); 
  // استیت برای نگهداری مبلغ واقعی (بدون ویرگول) برای دیتابیس
  const [realAmount, setRealAmount] = useState('');

  // تابع فرمت کردن عدد موقع تایپ
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // حذف هر چیزی که عدد نیست (مثل ویرگول‌های قبلی)
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    
    if (rawValue) {
      setRealAmount(rawValue);
      // فرمت کردن سه رقم سه رقم
      setDisplayAmount(Number(rawValue).toLocaleString('en-US'));
    } else {
      setRealAmount('');
      setDisplayAmount('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900">
          💰 ثبت فروش
        </Button>
      </DialogTrigger>
      <DialogContent className="dark:bg-gray-900 dark:border-gray-800">
        <DialogHeader>
          <DialogTitle className="dark:text-white">ثبت فروش برای {customerName}</DialogTitle>
        </DialogHeader>
        
        <form 
          action={async (formData) => {
            await createSale(formData);
            setOpen(false);
            // فرم رو ریست کن
            setDisplayAmount('');
            setRealAmount('');
          }} 
          className="space-y-4 mt-4"
        >
          <input type="hidden" name="customerId" value={customerId} />
          
          {/* اینپوت مخفی که عدد واقعی رو می‌فرسته سمت سرور */}
          <input type="hidden" name="amount" value={realAmount} />

          <div className="space-y-2">
            <Label className="dark:text-gray-300">مبلغ (تومان)</Label>
            {/* اینپوت نمایشی (تکست) که ویرگول داره */}
            <Input 
              type="text" 
              value={displayAmount}
              onChange={handleAmountChange}
              placeholder="مثلاً: 150,000" 
              required 
              className="dark:bg-gray-800 dark:border-gray-700 text-left dir-ltr" 
            />
          </div>

          <div className="flex gap-4">
            <div className="space-y-2 flex-1">
                <Label className="dark:text-gray-300">مدت</Label>
                <select name="duration" className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                    <option value="1">۱ ماهه</option>
                    <option value="2">۲ ماهه</option>
                    <option value="3">۳ ماهه</option>
                    <option value="6">۶ ماهه</option>
                </select>
            </div>
            
            <div className="space-y-2 flex-1 flex flex-col justify-end pb-2">
                <label className="flex items-center gap-2 cursor-pointer dark:text-gray-300">
                    <input 
                        type="checkbox" 
                        name="isPaid" 
                        defaultChecked 
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                    />
                    <span className="text-sm font-medium">پرداخت شد؟</span>
                </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="dark:text-gray-300">توضیحات / کد کانفیگ</Label>
            <Input name="description" placeholder="کد V2Ray..." className="dark:bg-gray-800 dark:border-gray-700" />
          </div>

          <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white">
            ثبت و ذخیره
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}