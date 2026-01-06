// src/app/(auth)/register/page.tsx
import { Metadata } from 'next'
import RegisterForm from '@/components/forms/RegisterForm'

export const metadata: Metadata = {
  title: 'إنشاء حساب',
}

export default function RegisterPage() {
  return (
    <div className="animate-fade-in">
      <h2 className="text-3xl font-bold mb-2">إنشاء حساب جديد 🚀</h2>
      <p className="text-gray-600 mb-8">ابدأ رحلة التعلم مجاناً</p>
      
      <RegisterForm />
    </div>
  )
}
