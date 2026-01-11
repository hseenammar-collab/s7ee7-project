// src/app/(auth)/layout.tsx
import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex" dir="rtl">
      {/* Left Side - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-purple-500/10 to-transparent" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-cyan-500/30 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 py-12">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 mb-16">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-black text-white">S7EE7</span>
          </Link>

          {/* Main Message */}
          <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
            تعلّم صح،
            <br />
            <span className="text-cyan-400">مو تعلّم هواي.</span>
          </h1>

          <p className="text-xl text-gray-400 leading-relaxed mb-12 max-w-md">
            منصّة عراقية تعلّمك شلون تفكّر، مو بس شنو تحفظ.
          </p>

          {/* Trust Indicators */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-gray-300">
              <div className="w-2 h-2 bg-cyan-400 rounded-full" />
              <span>+1000 طالب يتعلمون معنا</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <div className="w-2 h-2 bg-cyan-400 rounded-full" />
              <span>41 كورس في 7 مجالات</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <div className="w-2 h-2 bg-cyan-400 rounded-full" />
              <span>محتوى مبني للواقع العراقي</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <Link href="/" className="flex lg:hidden items-center gap-3 mb-10 justify-center">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black text-white">S7EE7</span>
          </Link>

          {children}
        </div>
      </div>
    </div>
  )
}
