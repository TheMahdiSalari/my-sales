'use client';

import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { InvoicePDF } from './InvoicePDF';
import { useState, useEffect } from 'react';

// ایمپورت داینامیک برای جلوگیری از خطاهای سرور ساید (چون PDF توی مرورگر ساخته میشه)
const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
  {
    ssr: false,
    loading: () => <span className="text-xs text-gray-400">...</span>,
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
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

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
          title="دانلود PDF"
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