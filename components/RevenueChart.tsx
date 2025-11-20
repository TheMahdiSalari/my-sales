'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Sale = {
  amount: number;
  startDate: Date | null;
};

type ChartData = {
  name: string;
  total: number;
};

export function RevenueChart({ sales }: { sales: Sale[] }) {
  
  const data = sales.reduce<ChartData[]>((acc, sale) => {
    if (!sale.startDate) return acc;
    
    const monthName = new Date(sale.startDate).toLocaleDateString('fa-IR', { month: 'long' });
    
    const existingMonth = acc.find(item => item.name === monthName);
    if (existingMonth) {
      existingMonth.total += sale.amount;
    } else {
      acc.push({ name: monthName, total: sale.amount });
    }
    return acc;
  }, [])
  .reverse()
  .slice(0, 6)
  .reverse();

  // کلاس h-full و flex-col اضافه شد تا ارتفاع کارت پر شود
  return (
    <Card className="h-full shadow-md border-gray-200 dark:bg-gray-900 dark:border-gray-800 flex flex-col">
      <CardHeader>
        <CardTitle className="text-gray-800 dark:text-gray-100">نمودار درآمد ماهانه</CardTitle>
      </CardHeader>
      {/* flex-1 اضافه شد تا نمودار فضای خالی را پر کند */}
      <CardContent className="pl-2 flex-1 min-h-[300px]">
        <div className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
                <XAxis 
                  dataKey="name" 
                  stroke="#888888" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value / 1000}k`}
                />
                <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ borderRadius: '8px', direction: 'rtl', textAlign: 'right', color: '#000' }}
                    formatter={(value: number) => new Intl.NumberFormat('fa-IR').format(value) + ' تومان'}
                />
                <Bar dataKey="total" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
            </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}