// src/app/(marketing)/refund/page.tsx
import { Metadata } from 'next'
import { RefreshCw, CheckCircle, XCircle, Clock, Mail, AlertCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'سياسة الاسترداد | S7EE7 Academy',
  description: 'سياسة استرداد الأموال لأكاديمية S7ee7 - ضمان استرداد الأموال خلال 7 أيام',
}

export default function RefundPage() {
  const eligibleConditions = [
    'طلب الاسترداد خلال 7 أيام من تاريخ الشراء',
    'نسبة مشاهدة الكورس أقل من 20%',
    'عدم تحميل أي مرفقات أو موارد من الكورس',
    'الكورس المشترى ليس مجانياً',
    'لم تحصل على شهادة إتمام',
  ]

  const ineligibleConditions = [
    'مرور أكثر من 7 أيام على الشراء',
    'مشاهدة أكثر من 20% من محتوى الكورس',
    'الكورسات المخفضة بنسبة أكثر من 50%',
    'الكورسات المجانية',
    'العروض والباقات الخاصة',
    'حسابات تم إيقافها بسبب انتهاك الشروط',
  ]

  const steps = [
    {
      step: 1,
      title: 'تقديم الطلب',
      description: 'أرسل طلب الاسترداد عبر البريد الإلكتروني refund@s7ee7.com مع ذكر اسم الكورس وسبب الطلب',
    },
    {
      step: 2,
      title: 'مراجعة الطلب',
      description: 'سيقوم فريقنا بمراجعة طلبك والتحقق من استيفاء الشروط خلال 24-48 ساعة',
    },
    {
      step: 3,
      title: 'الموافقة والمعالجة',
      description: 'في حال الموافقة، سيتم إلغاء وصولك للكورس وبدء عملية الاسترداد',
    },
    {
      step: 4,
      title: 'استلام الأموال',
      description: 'ستصلك الأموال بنفس طريقة الدفع الأصلية خلال 5-10 أيام عمل',
    },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32">
        <div className="absolute inset-0 ishtar-pattern opacity-5" />
        <div className="container-custom text-center relative">
          <div className="w-20 h-20 mx-auto mb-6 bg-sumerian-gold/10 rounded-2xl flex items-center justify-center">
            <RefreshCw className="w-10 h-10 text-sumerian-gold" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            سياسة <span className="sumerian-gold-text">الاسترداد</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            ضمان استرداد الأموال خلال 7 أيام - رضاك هو أولويتنا
          </p>
        </div>
      </section>

      {/* Guarantee Banner */}
      <section className="py-8 bg-sumerian-gold/10 border-y border-sumerian-gold/20">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center md:text-right">
            <div className="w-16 h-16 bg-sumerian-gold/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-sumerian-gold" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-1">ضمان استرداد 100%</h2>
              <p className="text-gray-400">إذا لم تكن راضياً، استرد أموالك كاملة خلال 7 أيام</p>
            </div>
          </div>
        </div>
      </section>

      {/* Conditions */}
      <section className="py-16">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Eligible */}
            <div className="mesopotamian-card p-6 rounded-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <h2 className="text-xl font-bold text-white">شروط الاستحقاق</h2>
              </div>
              <ul className="space-y-3">
                {eligibleConditions.map((condition, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">{condition}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Not Eligible */}
            <div className="mesopotamian-card p-6 rounded-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-400" />
                </div>
                <h2 className="text-xl font-bold text-white">لا يشمل الاسترداد</h2>
              </div>
              <ul className="space-y-3">
                {ineligibleConditions.map((condition, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">{condition}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16 bg-white/[0.02]">
        <div className="container-custom">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-12">
            خطوات طلب الاسترداد
          </h2>
          <div className="max-w-3xl mx-auto">
            <div className="space-y-6">
              {steps.map((item, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-sumerian-gold rounded-full flex items-center justify-center text-sumerian-dark font-bold">
                      {item.step}
                    </div>
                    {index < steps.length - 1 && (
                      <div className="w-0.5 h-full bg-sumerian-gold/30 my-2" />
                    )}
                  </div>
                  <div className="pb-8">
                    <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-gray-400">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Important Notes */}
      <section className="py-16">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto mesopotamian-card p-6 rounded-2xl">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-amber-400 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-white mb-3">ملاحظات مهمة</h3>
                <ul className="text-gray-400 space-y-2 text-sm">
                  <li>• يتم احتساب 7 أيام من تاريخ الشراء وليس من تاريخ أول مشاهدة</li>
                  <li>• في حالة الدفع بالبطاقة، قد تستغرق عملية الاسترداد وقتاً أطول حسب البنك</li>
                  <li>• الكوبونات والخصومات المستخدمة لن تُسترد ولن تكون صالحة للاستخدام مرة أخرى</li>
                  <li>• يحق للمنصة رفض طلبات الاسترداد المتكررة من نفس الحساب</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 border-t border-white/10">
        <div className="container-custom text-center">
          <Clock className="w-12 h-12 text-sumerian-gold mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">
            هل تريد طلب استرداد؟
          </h2>
          <p className="text-gray-400 mb-6">
            أرسل طلبك وسنرد عليك خلال 24 ساعة
          </p>
          <a
            href="mailto:refund@s7ee7.com"
            className="btn-sumerian inline-flex items-center gap-2 px-6 py-3"
          >
            <Mail className="w-5 h-5" />
            refund@s7ee7.com
          </a>
        </div>
      </section>
    </div>
  )
}
