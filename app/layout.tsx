import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google"; // فونت استاندارد گوگل برای فارسی
import { ClerkProvider } from '@clerk/nextjs'; // اضافه کردن پرووایدر امنیتی
import "./globals.css";

const vazir = Vazirmatn({ subsets: ["arabic", "latin"] });

export const metadata: Metadata = {
  title: "پنل مدیریت فروش",
  description: "سیستم مدیریت مشتریان و فاکتورها",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // کل اپلیکیشن توسط Clerk محافظت می‌شود
    <ClerkProvider>
      <html lang="fa" dir="rtl">
        <body className={`${vazir.className} bg-gray-50`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}