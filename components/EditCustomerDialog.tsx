'use client';

import { useState } from 'react';
import { updateCustomer } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

// 1. تعریف دقیق ساختار داده مشتری (Type Definition)
interface CustomerProps {
  id: number;
  name: string;
  phone: string;
  description: string | null; // چون ممکنه توضیحات خالی باشه
}

// 2. استفاده از اینترفیس بالا به جای 'any'
export function EditCustomerDialog({ customer }: { customer: CustomerProps }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-blue-600">
          {/* آیکون مداد (Edit) */}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ویرایش مشتری: {customer.name}</DialogTitle>
        </DialogHeader>
        
        <form 
          action={async (formData) => {
            await updateCustomer(formData);
            setOpen(false);
          }} 
          className="space-y-4 mt-4"
        >
          <input type="hidden" name="id" value={customer.id} />

          <div className="space-y-2">
            <Label>نام مشتری</Label>
            <Input name="name" defaultValue={customer.name} required />
          </div>

          <div className="space-y-2">
            <Label>شماره تماس</Label>
            <Input name="phone" defaultValue={customer.phone} required />
          </div>

          <div className="space-y-2">
            <Label>توضیحات</Label>
            {/* اگر نال بود، رشته خالی بذار تا ارور نده */}
            <Textarea name="description" defaultValue={customer.description || ''} />
          </div>

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
            ذخیره تغییرات
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}