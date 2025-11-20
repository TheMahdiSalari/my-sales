'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export function MonthFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentMonthIndex = new Date().toLocaleDateString('fa-IR-u-nu-latn').split('/')[1];
  const selectedMonth = searchParams.get('month') || currentMonthIndex;

  const months = [
    { id: '1', name: 'فروردین' },
    { id: '2', name: 'اردیبهشت' },
    { id: '3', name: 'خرداد' },
    { id: '4', name: 'تیر' },
    { id: '5', name: 'مرداد' },
    { id: '6', name: 'شهریور' },
    { id: '7', name: 'مهر' },
    { id: '8', name: 'آبان' },
    { id: '9', name: 'آذر' },
    { id: '10', name: 'دی' },
    { id: '11', name: 'بهمن' },
    { id: '12', name: 'اسفند' },
  ];

  return (
    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-lg border dark:border-gray-700 shadow-sm transition-colors">
      <span className="text-sm text-gray-500 dark:text-gray-400 font-bold mr-2">📊 مشاهده آمار:</span>
      <select 
        className="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none cursor-pointer"
        value={selectedMonth}
        onChange={(e) => {
          router.push(`/?month=${e.target.value}`);
        }}
      >
        {months.map((m) => (
          <option key={m.id} value={m.id}>{m.name}</option>
        ))}
      </select>
    </div>
  );
}