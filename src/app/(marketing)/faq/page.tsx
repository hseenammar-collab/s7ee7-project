// src/app/(marketing)/faq/page.tsx
import { Metadata } from 'next'
import { HelpCircle, ChevronDown } from 'lucide-react'

export const metadata: Metadata = {
  title: 'الأسئلة الشائعة | S7EE7 Academy',
  description: 'إجابات على الأسئلة الأكثر شيوعاً حول أكاديمية S7ee7 والكورسات والدفع',
}

const faqs = [
  {
    category: 'عام',
    questions: [
      {
        q: 'ما هي أكاديمية S7ee7؟',
        a: 'أكاديمية S7ee7 هي منصة تعليمية عراقية متخصصة في تقديم كورسات احترافية في مجالات الأمن السيبراني، التسويق الرقمي، البرمجة، وغيرها من المهارات الرقمية.',
      },
      {
        q: 'هل الكورسات باللغة العربية؟',
        a: 'نعم، جميع كورساتنا باللغة العربية مع شرح مبسط ومفصل يناسب المبتدئين والمحترفين.',
      },
      {
        q: 'هل أحصل على شهادة بعد إتمام الكورس؟',
        a: 'نعم، عند إتمام أي كورس بنسبة 100% ستحصل على شهادة إتمام إلكترونية موثقة يمكنك إضافتها لسيرتك الذاتية.',
      },
    ],
  },
  {
    category: 'الكورسات والمحتوى',
    questions: [
      {
        q: 'كم مدة صلاحية الوصول للكورس؟',
        a: 'بمجرد شرائك لأي كورس، ستحصل على وصول دائم مدى الحياة للمحتوى، مع جميع التحديثات المستقبلية مجاناً.',
      },
      {
        q: 'هل يمكنني تحميل الدروس؟',
        a: 'حالياً، الدروس متاحة للمشاهدة أونلاين فقط لضمان حماية حقوق الملكية الفكرية للمحتوى.',
      },
      {
        q: 'هل الكورسات مناسبة للمبتدئين؟',
        a: 'نعم، لدينا كورسات لجميع المستويات. كل كورس يوضح المستوى المطلوب (مبتدئ، متوسط، متقدم) قبل الشراء.',
      },
    ],
  },
  {
    category: 'الدفع والأسعار',
    questions: [
      {
        q: 'ما هي طرق الدفع المتاحة؟',
        a: 'نقبل الدفع عبر: زين كاش، آسيا حوالة، بطاقات الائتمان (فيزا/ماستركارد)، وطرق دفع محلية أخرى.',
      },
      {
        q: 'هل يمكنني استرداد أموالي؟',
        a: 'نعم، نقدم ضمان استرداد الأموال خلال 7 أيام من الشراء إذا لم تكن راضياً عن الكورس، بشرط عدم مشاهدة أكثر من 20% من المحتوى.',
      },
      {
        q: 'هل هناك خصومات للطلاب؟',
        a: 'نعم، نقدم خصومات خاصة للطلاب. تواصل معنا عبر واتساب مع إثبات حالة الطالب للحصول على كود الخصم.',
      },
    ],
  },
  {
    category: 'الدعم الفني',
    questions: [
      {
        q: 'كيف يمكنني التواصل مع الدعم الفني؟',
        a: 'يمكنك التواصل معنا عبر البريد الإلكتروني support@s7ee7.com أو واتساب، ونرد خلال 24 ساعة كحد أقصى.',
      },
      {
        q: 'ماذا أفعل إذا واجهت مشكلة تقنية؟',
        a: 'تأكد أولاً من اتصالك بالإنترنت وتحديث المتصفح. إذا استمرت المشكلة، تواصل مع الدعم الفني مع وصف المشكلة ولقطة شاشة إن أمكن.',
      },
      {
        q: 'هل يمكنني استخدام حسابي على أكثر من جهاز؟',
        a: 'نعم، يمكنك استخدام حسابك على عدة أجهزة، لكن يُسمح بجلسة نشطة واحدة فقط في نفس الوقت.',
      },
    ],
  },
]

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32">
        <div className="absolute inset-0 ishtar-pattern opacity-5" />
        <div className="container-custom text-center relative">
          <div className="w-20 h-20 mx-auto mb-6 bg-sumerian-gold/10 rounded-2xl flex items-center justify-center">
            <HelpCircle className="w-10 h-10 text-sumerian-gold" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            الأسئلة <span className="sumerian-gold-text">الشائعة</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            إجابات على الأسئلة الأكثر شيوعاً. لم تجد سؤالك؟ تواصل معنا!
          </p>
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="py-16">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto space-y-12">
            {faqs.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="w-2 h-8 bg-sumerian-gold rounded-full" />
                  {section.category}
                </h2>
                <div className="space-y-4">
                  {section.questions.map((faq, index) => (
                    <details
                      key={index}
                      className="mesopotamian-card rounded-xl group"
                    >
                      <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                        <span className="text-white font-medium pr-4">{faq.q}</span>
                        <ChevronDown className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0" />
                      </summary>
                      <div className="px-5 pb-5 pt-0">
                        <p className="text-gray-400 leading-relaxed">{faq.a}</p>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 border-t border-white/10">
        <div className="container-custom text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            لم تجد إجابة سؤالك؟
          </h2>
          <p className="text-gray-400 mb-6">
            فريق الدعم جاهز لمساعدتك على مدار الساعة
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
