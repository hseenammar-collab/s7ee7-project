// src/app/(marketing)/privacy/page.tsx
import { Metadata } from 'next'
import { Shield, Eye, Database, Lock, FileText, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'سياسة الخصوصية | S7EE7 Academy',
  description: 'سياسة الخصوصية الخاصة بأكاديمية S7ee7 - كيف نجمع ونستخدم ونحمي بياناتك',
}

export default function PrivacyPage() {
  const sections = [
    {
      icon: Database,
      title: 'البيانات التي نجمعها',
      content: `نجمع البيانات التالية عند تسجيلك في المنصة:
      • الاسم الكامل والبريد الإلكتروني
      • رقم الهاتف (اختياري)
      • معلومات الدفع (تُعالج بشكل آمن عبر مزودي خدمة الدفع)
      • سجل الكورسات والتقدم في الدروس
      • عنوان IP ومعلومات الجهاز المستخدم`,
    },
    {
      icon: Eye,
      title: 'كيف نستخدم بياناتك',
      content: `نستخدم بياناتك للأغراض التالية:
      • توفير وتحسين خدماتنا التعليمية
      • معالجة المدفوعات وإصدار الفواتير
      • إرسال التحديثات والإشعارات المتعلقة بالكورسات
      • تقديم الدعم الفني وحل المشكلات
      • إرسال العروض والتحديثات (يمكنك إلغاء الاشتراك في أي وقت)`,
    },
    {
      icon: Lock,
      title: 'حماية البيانات',
      content: `نتخذ إجراءات أمنية صارمة لحماية بياناتك:
      • تشفير جميع البيانات أثناء النقل والتخزين
      • استخدام خوادم آمنة ومحمية
      • تقييد الوصول للبيانات للموظفين المصرح لهم فقط
      • مراجعة دورية لإجراءات الأمان
      • عدم مشاركة بياناتك مع أطراف ثالثة دون موافقتك`,
    },
    {
      icon: Users,
      title: 'مشاركة البيانات',
      content: `لا نبيع أو نؤجر بياناتك الشخصية. قد نشارك البيانات فقط في الحالات التالية:
      • مع مزودي خدمة الدفع لإتمام المعاملات
      • عند الطلب القانوني من السلطات المختصة
      • مع مزودي الخدمات الذين يساعدوننا في تشغيل المنصة (ملتزمين بنفس معايير الخصوصية)`,
    },
    {
      icon: FileText,
      title: 'ملفات تعريف الارتباط (Cookies)',
      content: `نستخدم ملفات تعريف الارتباط لـ:
      • تذكر تفضيلاتك وتسجيل دخولك
      • تحسين تجربة التصفح
      • تحليل استخدام الموقع لتحسين خدماتنا
      يمكنك تعطيل الكوكيز من إعدادات المتصفح، لكن قد يؤثر ذلك على بعض وظائف الموقع.`,
    },
    {
      icon: Shield,
      title: 'حقوقك',
      content: `لديك الحقوق التالية فيما يتعلق ببياناتك:
      • الوصول لبياناتك الشخصية
      • تصحيح البيانات غير الدقيقة
      • طلب حذف حسابك وبياناتك
      • إلغاء الاشتراك في الرسائل التسويقية
      • نقل بياناتك إلى خدمة أخرى

      للاستفسار أو طلب أي من هذه الحقوق، تواصل معنا عبر privacy@s7ee7.com`,
    },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32">
        <div className="absolute inset-0 ishtar-pattern opacity-5" />
        <div className="container-custom text-center relative">
          <div className="w-20 h-20 mx-auto mb-6 bg-sumerian-gold/10 rounded-2xl flex items-center justify-center">
            <Shield className="w-10 h-10 text-sumerian-gold" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            سياسة <span className="sumerian-gold-text">الخصوصية</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية
          </p>
          <p className="text-gray-500 mt-4">
            آخر تحديث: يناير 2024
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto space-y-8">
            {sections.map((section, index) => (
              <div key={index} className="mesopotamian-card p-6 md:p-8 rounded-2xl">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-sumerian-gold/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <section.icon className="w-6 h-6 text-sumerian-gold" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white mb-4">{section.title}</h2>
                    <div className="text-gray-400 whitespace-pre-line leading-relaxed">
                      {section.content}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 border-t border-white/10">
        <div className="container-custom text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            هل لديك سؤال حول الخصوصية؟
          </h2>
          <p className="text-gray-400 mb-6">
            تواصل معنا عبر البريد الإلكتروني
          </p>
          <a
            href="mailto:privacy@s7ee7.com"
            className="btn-lapis inline-flex items-center gap-2 px-6 py-3"
          >
            privacy@s7ee7.com
          </a>
        </div>
      </section>
    </div>
  )
}
