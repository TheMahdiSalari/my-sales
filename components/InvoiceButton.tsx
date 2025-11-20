'use client';

import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { InvoicePDF } from './InvoicePDF';
import { Download } from 'lucide-react'; // اگر آیکون رو داری، وگرنه همون svg پایین رو بذار

// 1. ایمپورت داینامیک با غیرفعال کردن SSR
// این کار باعث میشه این کامپوننت کلاً سمت سرور اجرا نشه، پس نیازی به isClient نیست
const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
  {
    ssr: false,
    // تا زمانی که کتابخونه لود بشه، این دکمه غیرفعال رو نشون میده
    loading: () => (
      <Button variant="ghost" size="icon" disabled className="opacity-50">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
      </Button>
    ),
  }
);

interface Props {
  data: {
    customerName: string;
    phone: string;
    amount: number;
    date: string;
    description?: string;
    invoiceNumber: number;
  }
}

export function InvoiceButton({ data }: Props) {
  // نکته مهم: اون useState و useEffect رو کلاً حذف کردیم
  // چون dynamic import بالا کار ما رو راه میندازه

  return (
    <PDFDownloadLink
      document={<InvoicePDF {...data} />}
      fileName={`Factor-${data.customerName}.pdf`}
    >
      {/* @ts-ignore */}
      {({ blob, url, loading, error }) => (
        <Button 
          variant="ghost" 
          size="icon" 
          disabled={loading}
          title="دانلود فاکتور"
          className={`text-gray-500 hover:text-blue-600 ${loading ? 'opacity-50' : ''}`}
        >
           {/* آیکون دانلود */}
           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
             <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
             <polyline points="7 10 12 15 17 10"/>
             <line x1="12" x2="12" y1="15" y2="3"/>
           </svg>
        </Button>
      )}
    </PDFDownloadLink>
  );
}