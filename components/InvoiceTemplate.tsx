import React from 'react';

interface InvoiceProps {
  customerName: string;
  phone: string;
  amount: number;
  date: string;
  description?: string;
  invoiceNumber: number;
}

export const InvoiceTemplate = React.forwardRef<HTMLDivElement, InvoiceProps>((props, ref) => {
  
  const formatPrice = (price: number) => new Intl.NumberFormat('fa-IR').format(price);

  return (
    <div ref={ref} className="bg-white p-8 text-right text-black font-sans" dir="rtl" style={{ width: '100%' }}>
      
      {/* این استایل باعث می‌شود کل فاکتور یک بلوک در نظر گرفته شود و نصف نشود */}
      <div style={{ pageBreakInside: 'avoid' }}>

        {/* هدر فاکتور */}
        <div className="border-b-2 border-gray-800 pb-4 mb-6 flex justify-between items-center">
          <div>
              <h1 className="text-2xl font-bold mb-2">فاکتور فروش خدمات</h1>
              <p className="text-sm text-gray-500">ارائه‌دهنده خدمات فیلترینگ و شبکه</p>
          </div>
          <div className="text-left">
              <div className="text-sm font-bold">شماره فاکتور: {props.invoiceNumber}</div>
              <div className="text-sm text-gray-600">تاریخ: {props.date}</div>
          </div>
        </div>

        {/* مشخصات خریدار */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
          <h3 className="font-bold mb-3 text-gray-700 border-b pb-2 text-sm">مشخصات خریدار</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500 ml-2">نام مشتری:</span> {props.customerName}</div>
              <div><span className="text-gray-500 ml-2">شماره تماس:</span> {props.phone}</div>
          </div>
        </div>

        {/* جدول اقلام */}
        <table className="w-full mb-8 border-collapse">
          <thead>
              <tr className="bg-gray-800 text-white text-sm">
                  <th className="p-3 text-right rounded-r-lg">شرح خدمات</th>
                  <th className="p-3 text-center w-32">مدت</th>
                  <th className="p-3 text-left rounded-l-lg w-40">مبلغ (تومان)</th>
              </tr>
          </thead>
          <tbody>
              <tr className="border-b border-gray-200">
                  <td className="p-3 text-sm">{props.description || 'سرویس دسترسی آزاد به اینترنت (V2Ray)'}</td>
                  <td className="p-3 text-center text-sm">یک ماهه</td>
                  <td className="p-3 text-left font-bold">{formatPrice(props.amount)}</td>
              </tr>
          </tbody>
        </table>

        {/* جمع کل */}
        <div className="flex justify-end mb-8">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 w-64">
              <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">جمع کل:</span>
                  <span className="font-bold text-lg text-blue-800">{formatPrice(props.amount)}</span>
              </div>
              <div className="text-xs text-center text-gray-400 mt-2">پرداخت شده (نقدی/کارت‌به‌کارت)</div>
          </div>
        </div>

        {/* امضا - با فاصله ثابت (mt-12) نه چسبیده به ته صفحه */}
        <div className="flex justify-end mt-12 px-4">
          <div className="text-center w-40">
              <p className="text-sm font-bold mb-8">مهر و امضای فروشنده</p>
              <div className="border-b border-dotted border-gray-400"></div>
          </div>
        </div>

      </div>

      {/* تنظیمات پرینت: سایز A5 افقی برای اینکه خوش‌دست باشد */}
      <style type="text/css" media="print">
        {`
           @page { size: A5 landscape; margin: 10mm; }
           body { -webkit-print-color-adjust: exact; }
        `}
      </style>
    </div>
  );
});

InvoiceTemplate.displayName = 'InvoiceTemplate';    