// src/app/(auth)/login/page.tsx
import { Metadata } from 'next'
import { Suspense } from 'react'
import LoginForm from '@/components/forms/LoginForm'
import { Loader2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'تسجيل الدخول',
}

function LoginFormFallback() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="animate-fade-in">
      <h2 className="text-3xl font-bold mb-2">مرحباً بعودتك! 👋</h2>
      <p className="text-gray-600 mb-8">سجل دخولك للوصول لكورساتك</p>

      <Suspense fallback={<LoginFormFallback />}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
