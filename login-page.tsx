// src/app/(auth)/login/page.tsx
import { Metadata } from 'next'
import { Suspense } from 'react'
import LoginForm from '@/components/forms/LoginForm'
import { Loader2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'تسجيل الدخول | S7EE7',
  description: 'سجل دخولك وكمّل من وين وقفت',
}

function LoginFormFallback() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-white mb-3">
          رجعت تكمل طريقك.
        </h2>
        <p className="text-gray-400 text-lg">
          S7EE7 – مكانك محفوظ.
        </p>
      </div>

      <Suspense fallback={<LoginFormFallback />}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
