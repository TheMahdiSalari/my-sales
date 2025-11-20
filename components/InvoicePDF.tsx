'use client';

import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// 1. ثبت فونت فارسی (از CDN می‌خوانیم که راحت باشی)
// اگر خواستی بعدا فایلش را لوکال کن. فعلا این لینک کار راه انداز است.
Font.register({
  family: 'Vazirmatn',
  src: 'https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/fonts/ttf/Vazirmatn-Regular.ttf',
});

Font.register({
  family: 'Vazirmatn-Bold',
  src: 'https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/fonts/ttf/Vazirmatn-Bold.ttf',
});

// 2. استایل‌ها (شبیه CSS ولی آبجکت جاوااسکریپت)
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Vazirmatn', // استفاده از فونت ثبت شده
  },
  header: {
    flexDirection: 'row-reverse', // برای راست‌چین شدن هدر
    justifyContent: 'space-between',
    borderBottomWidth: 2,
    borderBottomColor: '#111827',
    paddingBottom: 10,
    marginBottom: 20,
  },
  headerLeft: { textAlign: 'right' },
  headerRight: { textAlign: 'left' }, // چون row-reverse است، چپ میشه راست!
  title: { fontSize: 20, fontFamily: 'Vazirmatn-Bold', marginBottom: 5 },
  subtitle: { fontSize: 10, color: '#6B7280' },
  
  section: {
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  label: { fontSize: 10, color: '#6B7280', marginBottom: 4, textAlign: 'right' },
  value: { fontSize: 12, textAlign: 'right', marginBottom: 5 },
  
  table: { width: '100%', marginBottom: 20 },
  tableHeader: {
    flexDirection: 'row-reverse',
    backgroundColor: '#1F2937',
    padding: 8,
    borderRadius: 4,
  },
  tableHeaderCell: { color: '#FFFFFF', fontSize: 10, fontFamily: 'Vazirmatn-Bold' },
  tableRow: {
    flexDirection: 'row-reverse',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    padding: 8,
  },
  tableCell: { fontSize: 10, textAlign: 'right' },

  totalSection: {
    flexDirection: 'row', // چپ چین برای باکس قیمت
    marginTop: 10,
    justifyContent: 'flex-start', 
  },
  totalBox: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    width: 200,
  },
  totalText: {
    fontSize: 14,
    fontFamily: 'Vazirmatn-Bold',
    color: '#1E40AF',
    textAlign: 'center',
  },

  footer: {
    marginTop: 'auto', // چسبیدن به پایین
    paddingTop: 20,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  signature: {
    textAlign: 'center',
    width: 100,
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#9CA3AF',
    marginTop: 30,
    borderStyle: 'dashed',
  },
});

interface InvoiceProps {
  customerName: string;
  phone: string;
  amount: number;
  date: string;
  description?: string;
  invoiceNumber: number;
}

// 3. ساخت داکیومنت PDF
export const InvoicePDF = ({ customerName, phone, amount, date, description, invoiceNumber }: InvoiceProps) => {
  const formatPrice = (price: number) => new Intl.NumberFormat('fa-IR').format(price);

  return (
    <Document>
      <Page size="A5" orientation="landscape" style={styles.page}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRight}>
            <Text style={styles.title}>فاکتور فروش خدمات</Text>
            <Text style={styles.subtitle}>ارائه‌دهنده سرویس‌های شبکه</Text>
          </View>
          <View style={styles.headerLeft}>
            <Text style={styles.subtitle}>شماره فاکتور: {invoiceNumber}</Text>
            <Text style={styles.subtitle}>تاریخ: {date}</Text>
          </View>
        </View>

        {/* Customer Info */}
        <View style={styles.section}>
          <Text style={[styles.label, {fontFamily: 'Vazirmatn-Bold'}]}>مشخصات خریدار</Text>
          <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', marginTop: 5 }}>
             <Text style={styles.value}>نام مشتری: {customerName}</Text>
             <Text style={styles.value}>شماره تماس: {phone}</Text>
          </View>
        </View>

        {/* Table */}
        <View style={styles.table}>
          {/* Head */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { width: '50%', textAlign: 'right' }]}>شرح</Text>
            <Text style={[styles.tableHeaderCell, { width: '25%', textAlign: 'center' }]}>مدت</Text>
            <Text style={[styles.tableHeaderCell, { width: '25%', textAlign: 'left' }]}>مبلغ (تومان)</Text>
          </View>
          {/* Row */}
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { width: '50%', textAlign: 'right' }]}>
              {description || 'سرویس اینترنت V2Ray'}
            </Text>
            <Text style={[styles.tableCell, { width: '25%', textAlign: 'center' }]}>
              یک ماهه
            </Text>
            <Text style={[styles.tableCell, { width: '25%', textAlign: 'left', fontFamily: 'Vazirmatn-Bold' }]}>
              {formatPrice(amount)}
            </Text>
          </View>
        </View>

        {/* Total & Signature */}
        <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            
            {/* Total Box */}
            <View style={styles.totalBox}>
               <Text style={{textAlign: 'center', fontSize: 10, color: '#666', marginBottom: 5}}>مبلغ قابل پرداخت</Text>
               <Text style={styles.totalText}>{formatPrice(amount)} تومان</Text>
               <Text style={{textAlign: 'center', fontSize: 8, color: '#999', marginTop: 5}}>وضعیت: پرداخت شده</Text>
            </View>

            {/* Signature */}
            <View style={styles.signature}>
                <Text style={{ fontSize: 10, fontFamily: 'Vazirmatn-Bold' }}>مهر و امضای فروشنده</Text>
                <View style={styles.signatureLine} />
            </View>

        </View>

      </Page>
    </Document>
  );
};