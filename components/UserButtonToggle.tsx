'use client';

import { UserButton, useUser } from "@clerk/nextjs"; // از useUser برای چک کردن وضعیت استفاده می‌کنیم
import { useTheme } from "next-themes";

export function UserButtonToggle() {
  const { theme } = useTheme();
  // 1. چک می‌کنیم که آیا Clerk داده‌ها را لود کرده است؟
  const { isLoaded } = useUser(); 
  
  const textColor = theme === 'dark' ? 'white' : 'black';

  // 2. اگر Clerk هنوز آماده نبود، یک Placeholder (جای خالی) نمایش می‌دهیم
  if (!isLoaded) {
     return <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>;
  }
  
  // 3. وقتی آماده شد، دکمه اصلی را رندر می‌کنیم
  return (
    <UserButton 
      showName 
      appearance={{
        variables: {
          colorText: textColor,
        },
        elements: {
           userButtonOuterIdentifier: "font-bold text-base" 
        }
      }} 
    />
  );
}