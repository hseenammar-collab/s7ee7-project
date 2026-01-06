// src/app/(auth)/layout.tsx
import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="text-2xl font-bold">S7ee7</span>
          </Link>
          
          {children}
        </div>
      </div>
      
      {/* Right Side - Image/Info */}
      <div className="hidden lg:flex flex-1 bg-primary items-center justify-center p-12">
        <div className="text-white text-center max-w-lg">
          <h1 className="text-4xl font-bold mb-6">
            ابدأ رحلة التعلم معنا
          </h1>
          <p className="text-xl text-white/80 mb-8">
            انضم لأكثر من 1000+ طالب يتعلمون المهارات الرقمية
          </p>
          <div className="flex justify-center gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold">+50</div>
              <div className="text-white/70">كورس</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold">+1000</div>
              <div className="text-white/70">طالب</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold">+500</div>
              <div className="text-white/70">ساعة محتوى</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
