import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'پنل فروش', // اسمی که زیر آیکون برنامه مینویسه
    short_name: 'فروش',
    description: 'دشبورد مدیریت فروش و مشتریان',
    start_url: '/',
    display: 'standalone', // این خط باعث میشه نوار مرورگر حذف بشه (فول اسکرین)
    background_color: '#ffffff',
    theme_color: '#ffffff',
    icons: [
      {
        src: '/icon.png', // اشاره به همون فایلی که گذاشتی
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}