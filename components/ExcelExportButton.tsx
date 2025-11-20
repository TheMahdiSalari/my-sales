'use client';

import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet } from 'lucide-react';

// 1. تعریف تایپ‌های دقیق برای ورودی‌ها
type Customer = {
  id: number;
  name: string;
  phone: string;
  description: string | null;
};

type Sale = {
  id: number;
  customerId: number | null;
  amount: number;
  startDate: Date | null;
  endDate: Date | null;
};

interface Props {
  customers: Customer[];
  sales: Sale[];
}

export function ExcelExportButton({ customers, sales }: Props) {
  
  const handleExport = () => {
    const reportData = customers.map(c => {
      const lastSale = sales.find(s => s.customerId === c.id);
      return {
        "نام مشتری": c.name,
        "تلفن": c.phone,
        "آخرین خرید (تومان)": lastSale ? lastSale.amount : 0,
        "تاریخ خرید": lastSale?.startDate ? new Date(lastSale.startDate).toLocaleDateString('fa-IR') : '-',
        "انقضا": lastSale?.endDate ? new Date(lastSale.endDate).toLocaleDateString('fa-IR') : '-',
        "توضیحات": c.description || '-'
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");
    
    XLSX.writeFile(workbook, `Gozaresh-${new Date().toLocaleDateString('fa-IR').replace(/\//g, '-')}.xlsx`);
  };

  return (
    <Button 
        variant="outline" 
        onClick={handleExport}
        className="gap-2 bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900"
    >
      <FileSpreadsheet size={16} />
      خروجی اکسل
    </Button>
  );
}