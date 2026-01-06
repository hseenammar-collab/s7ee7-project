// src/app/(marketing)/terms/page.tsx
import { Metadata } from 'next'
import { FileText, CheckCircle, XCircle, AlertTriangle, Scale, RefreshCw } from 'lucide-react'

export const metadata: Metadata = {
  title: 'شروط الاستخدام | S7EE7 Academy',
  description: 'شروط وأحكام استخدام منصة أكاديمية S7ee7 التعليمية',
}

export default function TermsPage() {
  const sections = [
    {
      icon: FileText,
      title: 'مقدمة',
      content: `باستخدامك لمنصة أكاديمية S7ee7 ("المنصة")، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي من هذه الشروط، يرجى عدم استخدام المنصة.

تحتفظ المنصة بحق تعديل هذه الشروط في أي وقت، وسيتم إخطارك بأي تغييرات جوهرية عبر البريد الإلكتروني أو إشعار على الموقع.`,
    },
    {
      icon: CheckCircle,
      title: 'حقوقك كمستخدم',
      content: `عند شرائك لأي كورس من المنصة، تحصل على:
      • حق الوصول الدائم لمحتوى الكورس المشترى
      • جميع التحديثات المستقبلية للكورس مجاناً
      • شهادة إتمام إلكترونية عند إكمال الكورس
      • الدعم الفني للمساعدة في حل المشكلات التقنية
      • حق استرداد الأموال خلال 7 أيام وفق الشروط المحددة`,
    },
    {
      icon: XCircle,
      title: 'الاستخدام المحظور',
      content: `يُحظر عليك القيام بأي من الأفعال التالية:
      • مشاركة حسابك أو بيانات الدخول مع الآخرين
      • تحميل أو نسخ أو توزيع محتوى الكورسات
      • إعادة بيع أو تأجير الوصول للمحتوى
      • استخدام برامج لتسجيل أو تنزيل الفيديوهات
      • محاولة اختراق أو تعطيل المنصة
      • انتحال شخصية مستخدم آخر
      • استخدام المنصة لأي أغراض غير قانونية`,
    },
    {
      icon: Scale,
      title: 'حقوق الملكية الفكرية',
      content: `جميع المحتويات على المنصة محمية بحقوق الملكية الفكرية:
      • الفيديوهات والمواد التعليمية مملوكة للمنصة أو المدربين
      • الشعارات والتصاميم علامات تجارية مسجلة
      • لا يجوز استخدام أي محتوى دون إذن كتابي مسبق

      أي انتهاك لحقوق الملكية الفكرية قد يؤدي إلى إيقاف حسابك واتخاذ إجراءات قانونية.`,
    },
    {
      icon: RefreshCw,
      title: 'سياسة الاسترداد',
      content: `نقدم ضمان استرداد الأموال بالشروط التالية:
      • يمكن طلب الاسترداد خلال 7 أيام من تاريخ الشراء
      • يجب ألا تتجاوز نسبة مشاهدة الكورس 20%
      • لا يشمل الاسترداد الكورسات المجانية أو المخفضة بنسبة تزيد عن 50%
      • يتم الاسترداد بنفس طريقة الدفع الأصلية خلال 5-10 أيام عمل

      لطلب الاسترداد، تواصل مع الدعم عبر support@s7ee7.com`,
    },
    {
      icon: AlertTriangle,
      title: 'إخلاء المسؤولية',
      content: `• المحتوى التعليمي مُقدم "كما هو" ولا نضمن نتائج محددة
      • لسنا مسؤولين عن أي أضرار ناتجة عن استخدام المعلومات المقدمة
      • المنصة قد تكون غير متاحة مؤقتاً للصيانة أو لأسباب تقنية
      • قد يتم تعديل أو حذف محتوى الكورسات في حالات استثنائية
      • نحتفظ بحق إيقاف أي حساب ينتهك هذه الشروط`,
    },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32">
        <div className="absolute inset-0 ishtar-pattern opacity-5" />
        <div className="container-custom text-center relative">
          <div className="w-20 h-20 mx-auto mb-6 bg-sumerian-gold/10 rounded-2xl flex items-center justify-center">
            <FileText className="w-10 h-10 text-sumerian-gold" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            شروط <span className="sumerian-gold-text">الاستخدام</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            الشروط والأحكام التي تنظم استخدامك لمنصة أكاديمية S7ee7
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
            هل لديك سؤال حول الشروط؟
          </h2>
          <p className="text-gray-400 mb-6">
            تواصل معنا وسنرد عليك في أقرب وقت
          </p>
          <a
            href="/contact"
            className="btn-sumerian inline-flex items-center gap-2 px-6 py-3"
          >
            تواصل معنا
          </a>
        </div>
      </section>
    </div>
  )
}
