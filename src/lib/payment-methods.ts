// src/lib/payment-methods.ts

export interface PaymentMethod {
  id: string
  name: string
  nameAr: string
  icon: string
  accountNumber: string
  accountName: string
  instructions: string[]
  isEnabled: boolean
  color: string
  bgColor: string
}

export const paymentMethods: PaymentMethod[] = [
  {
    id: 'zain_cash',
    name: 'Zain Cash',
    nameAr: 'زين كاش',
    icon: '📱',
    accountNumber: '07801234567',
    accountName: 'حسين - S7ee7 Academy',
    instructions: [
      'افتح تطبيق Zain Cash على هاتفك',
      'اختر "تحويل" أو "Send Money"',
      'أدخل رقم المحفظة أعلاه',
      'أدخل المبلغ المطلوب بالضبط',
      'أكمل عملية التحويل',
      'التقط صورة للإيصال (سكرين شوت)',
    ],
    isEnabled: true,
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-500/10',
  },
  {
    id: 'asiahawala',
    name: 'Asia Hawala',
    nameAr: 'آسيا حوالة',
    icon: '💸',
    accountNumber: '07701234567',
    accountName: 'حسين - S7ee7 Academy',
    instructions: [
      'افتح تطبيق آسيا حوالة',
      'اختر "تحويل داخلي"',
      'أدخل رقم المحفظة أعلاه',
      'أدخل المبلغ المطلوب',
      'أكمل عملية التحويل',
      'التقط صورة للإيصال',
    ],
    isEnabled: true,
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-500/10',
  },
  {
    id: 'fib',
    name: 'FIB',
    nameAr: 'مصرف الشرق الأوسط',
    icon: '🏦',
    accountNumber: '1234567890123456',
    accountName: 'S7ee7 Academy',
    instructions: [
      'افتح تطبيق FIB',
      'اختر "تحويل" أو "Transfer"',
      'أدخل رقم الحساب أعلاه',
      'أدخل المبلغ المطلوب',
      'أكمل عملية التحويل',
      'التقط صورة للإيصال',
    ],
    isEnabled: true,
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-500/10',
  },
  {
    id: 'qicard',
    name: 'Qi Card',
    nameAr: 'كي كارد',
    icon: '💳',
    accountNumber: '6281234567890123',
    accountName: 'S7ee7 Academy',
    instructions: [
      'افتح تطبيق Qi Card',
      'اختر "تحويل"',
      'أدخل رقم البطاقة أعلاه',
      'أدخل المبلغ المطلوب',
      'أكمل عملية التحويل',
      'التقط صورة للإيصال',
    ],
    isEnabled: true,
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-500/10',
  },
]

export function getPaymentMethod(id: string): PaymentMethod | undefined {
  return paymentMethods.find((method) => method.id === id)
}

export function getEnabledPaymentMethods(): PaymentMethod[] {
  return paymentMethods.filter((method) => method.isEnabled)
}
