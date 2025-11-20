import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from "@/components/theme-provider"; // فایل بالا
import "./globals.css";

const vazir = Vazirmatn({ subsets: ["arabic", "latin"] });

export const metadata: Metadata = {
  title: "پنل مدیریت فروش",
  description: "سیستم مدیریت مشتریان و فاکتورها",
  manifest: "/manifest.ts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      {/* suppressHydrationWarning برای تم دارک ضروری است */}
      <html lang="fa" dir="rtl" suppressHydrationWarning>
        <body className={`${vazir.className} bg-gray-50 dark:bg-gray-950 transition-colors duration-300`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}