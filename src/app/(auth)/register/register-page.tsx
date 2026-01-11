// src/app/(auth)/register/page.tsx
import { Metadata } from 'next'
import RegisterForm from '@/components/forms/RegisterForm'

export const metadata: Metadata = {
  title: 'إنشاء حساب | S7EE7',
  description: 'ابدأ رحلة التعلم الصحيح مع S7EE7',
}

export default function RegisterPage() {
  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-white mb-3">
          خلّينا نفتح لك مسارك.
        </h2>
        <p className="text-gray-400 text-lg">
          ما راح نغثّك بإيميلات، ولا نبيع بياناتك.
          <br />
          <span className="text-gray-500">هذا حسابك وبس.</span>
        </p>
      </div>
      
      <RegisterForm />

      {/* Bottom Note */}
      <p className="text-center text-gray-500 text-sm mt-8">
        أنت ما تفتح حساب. <span className="text-cyan-400">أنت تبدأ مرحلة.</span>
      </p>
    </div>
  )
}
