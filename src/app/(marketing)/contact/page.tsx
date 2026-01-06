// src/app/(marketing)/contact/page.tsx
import { Metadata } from 'next'
import { Mail, Phone, MapPin, MessageCircle, Clock, Send } from 'lucide-react'

export const metadata: Metadata = {
  title: 'تواصل معنا | S7EE7 Academy',
  description: 'تواصل مع فريق أكاديمية S7ee7 للاستفسارات والدعم الفني',
}

export default function ContactPage() {
  const contactMethods = [
    {
      icon: Mail,
      title: 'البريد الإلكتروني',
      value: 'support@s7ee7.com',
      description: 'للاستفسارات العامة والدعم',
      href: 'mailto:support@s7ee7.com',
    },
    {
      icon: Phone,
      title: 'الهاتف',
      value: '+964 770 000 0000',
      description: 'متاحين من 9 صباحاً - 9 مساءً',
      href: 'tel:+9647700000000',
    },
    {
      icon: MessageCircle,
      title: 'واتساب',
      value: '+964 770 000 0000',
      description: 'للتواصل السريع',
      href: 'https://wa.me/9647700000000',
    },
    {
      icon: MapPin,
      title: 'الموقع',
      value: 'بغداد، العراق',
      description: 'مقرنا الرئيسي',
      href: '#',
    },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32">
        <div className="absolute inset-0 ishtar-pattern opacity-5" />
        <div className="container-custom text-center relative">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            تواصل <span className="sumerian-gold-text">معنا</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            نحن هنا لمساعدتك! لا تتردد في التواصل معنا لأي استفسار أو دعم
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16">
        <div className="container-custom">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactMethods.map((method, index) => (
              <a
                key={index}
                href={method.href}
                className="mesopotamian-card p-6 rounded-2xl text-center hover:border-sumerian-gold/50 transition-colors group"
              >
                <div className="w-14 h-14 mx-auto mb-4 bg-sumerian-gold/10 rounded-xl flex items-center justify-center group-hover:bg-sumerian-gold/20 transition-colors">
                  <method.icon className="w-7 h-7 text-sumerian-gold" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{method.title}</h3>
                <p className="text-sumerian-gold font-medium mb-1" dir="ltr">{method.value}</p>
                <p className="text-gray-500 text-sm">{method.description}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto">
            <div className="mesopotamian-card p-8 rounded-2xl">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                أرسل لنا رسالة
              </h2>
              <form className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-300 mb-2 text-sm">الاسم الكامل</label>
                    <input
                      type="text"
                      className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:border-sumerian-gold focus:outline-none transition-colors"
                      placeholder="أدخل اسمك"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2 text-sm">البريد الإلكتروني</label>
                    <input
                      type="email"
                      className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:border-sumerian-gold focus:outline-none transition-colors"
                      placeholder="example@email.com"
                      dir="ltr"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-300 mb-2 text-sm">الموضوع</label>
                  <input
                    type="text"
                    className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:border-sumerian-gold focus:outline-none transition-colors"
                    placeholder="موضوع الرسالة"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2 text-sm">الرسالة</label>
                  <textarea
                    rows={5}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:border-sumerian-gold focus:outline-none transition-colors resize-none"
                    placeholder="اكتب رسالتك هنا..."
                  />
                </div>
                <button
                  type="submit"
                  className="btn-sumerian w-full py-4 flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  إرسال الرسالة
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ CTA */}
      <section className="py-16 border-t border-white/10">
        <div className="container-custom text-center">
          <Clock className="w-12 h-12 text-sumerian-gold mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">
            هل لديك سؤال شائع؟
          </h2>
          <p className="text-gray-400 mb-6">
            قد تجد إجابة سؤالك في صفحة الأسئلة الشائعة
          </p>
          <a
            href="/faq"
            className="btn-lapis inline-flex items-center gap-2 px-6 py-3"
          >
            الأسئلة الشائعة
          </a>
        </div>
      </section>
    </div>
  )
}
