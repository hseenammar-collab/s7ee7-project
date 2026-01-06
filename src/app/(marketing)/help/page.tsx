// src/app/(marketing)/help/page.tsx
import { Metadata } from 'next'
import Link from 'next/link'
import {
  LifeBuoy,
  MessageCircle,
  Mail,
  BookOpen,
  CreditCard,
  User,
  PlayCircle,
  Award,
  Search,
  ArrowLeft
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'مركز المساعدة | S7EE7 Academy',
  description: 'مركز المساعدة والدعم الفني لأكاديمية S7ee7',
}

export default function HelpPage() {
  const helpCategories = [
    {
      icon: User,
      title: 'الحساب والتسجيل',
      description: 'إنشاء حساب، تسجيل الدخول، استعادة كلمة المرور',
      links: [
        { label: 'كيف أنشئ حساب جديد؟', href: '/faq' },
        { label: 'نسيت كلمة المرور', href: '/forgot-password' },
        { label: 'تحديث معلومات الحساب', href: '/profile' },
      ],
    },
    {
      icon: PlayCircle,
      title: 'الكورسات والتعلم',
      description: 'مشاهدة الدروس، متابعة التقدم، المشاكل التقنية',
      links: [
        { label: 'كيف أشاهد الدروس؟', href: '/faq' },
        { label: 'الكورسات المسجلة', href: '/my-courses' },
        { label: 'مشاكل تشغيل الفيديو', href: '/faq' },
      ],
    },
    {
      icon: CreditCard,
      title: 'الدفع والاشتراك',
      description: 'طرق الدفع، الفواتير، استرداد الأموال',
      links: [
        { label: 'طرق الدفع المتاحة', href: '/faq' },
        { label: 'سياسة الاسترداد', href: '/refund' },
        { label: 'مشاكل الدفع', href: '/contact' },
      ],
    },
    {
      icon: Award,
      title: 'الشهادات',
      description: 'الحصول على الشهادة، التحقق، المشاركة',
      links: [
        { label: 'كيف أحصل على الشهادة؟', href: '/faq' },
        { label: 'شهاداتي', href: '/certificates' },
        { label: 'التحقق من الشهادة', href: '/faq' },
      ],
    },
  ]

  const quickLinks = [
    { icon: BookOpen, label: 'تصفح الكورسات', href: '/courses', color: 'bg-blue-500/20 text-blue-400' },
    { icon: MessageCircle, label: 'الأسئلة الشائعة', href: '/faq', color: 'bg-green-500/20 text-green-400' },
    { icon: Mail, label: 'تواصل معنا', href: '/contact', color: 'bg-purple-500/20 text-purple-400' },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32">
        <div className="absolute inset-0 ishtar-pattern opacity-5" />
        <div className="container-custom relative">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-sumerian-gold/10 rounded-2xl flex items-center justify-center">
              <LifeBuoy className="w-10 h-10 text-sumerian-gold" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              مركز <span className="sumerian-gold-text">المساعدة</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
              كيف يمكننا مساعدتك اليوم؟
            </p>

            {/* Search Box */}
            <div className="max-w-xl mx-auto relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="ابحث عن مساعدة..."
                className="w-full h-14 pr-12 pl-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:border-sumerian-gold focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-8 border-y border-white/10">
        <div className="container-custom">
          <div className="flex flex-wrap justify-center gap-4">
            {quickLinks.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className={`flex items-center gap-2 px-6 py-3 rounded-full ${link.color} hover:opacity-80 transition-opacity`}
              >
                <link.icon className="w-5 h-5" />
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Help Categories */}
      <section className="py-16">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-6">
            {helpCategories.map((category, index) => (
              <div key={index} className="mesopotamian-card p-6 rounded-2xl">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-sumerian-gold/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <category.icon className="w-6 h-6 text-sumerian-gold" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{category.title}</h2>
                    <p className="text-gray-500 text-sm">{category.description}</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {category.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link
                        href={link.href}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors group"
                      >
                        <span className="text-gray-300 group-hover:text-white transition-colors">
                          {link.label}
                        </span>
                        <ArrowLeft className="w-4 h-4 text-gray-500 group-hover:text-sumerian-gold transition-colors" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-white/[0.02]">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center">
            <MessageCircle className="w-12 h-12 text-sumerian-gold mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">
              لم تجد ما تبحث عنه؟
            </h2>
            <p className="text-gray-400 mb-6">
              فريق الدعم متاح على مدار الساعة لمساعدتك
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="https://wa.me/9647700000000"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-sumerian px-6 py-3 flex items-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                واتساب
              </a>
              <Link
                href="/contact"
                className="btn-lapis px-6 py-3 flex items-center gap-2"
              >
                <Mail className="w-5 h-5" />
                راسلنا
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
