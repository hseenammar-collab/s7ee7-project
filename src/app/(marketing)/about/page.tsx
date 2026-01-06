// src/app/(marketing)/about/page.tsx
import { Metadata } from 'next'
import { Users, Target, Award, BookOpen, Shield, Zap } from 'lucide-react'

export const metadata: Metadata = {
  title: 'من نحن | S7EE7 Academy',
  description: 'تعرف على أكاديمية S7ee7 - منصة تعليمية عراقية رائدة في مجال الأمن السيبراني والتسويق الرقمي والبرمجة',
}

export default function AboutPage() {
  const stats = [
    { icon: Users, value: '5,000+', label: 'طالب مسجل' },
    { icon: BookOpen, value: '50+', label: 'كورس احترافي' },
    { icon: Award, value: '98%', label: 'نسبة رضا الطلاب' },
    { icon: Shield, value: '3+', label: 'سنوات خبرة' },
  ]

  const values = [
    {
      icon: Target,
      title: 'الجودة أولاً',
      description: 'نلتزم بتقديم محتوى تعليمي عالي الجودة يواكب أحدث المعايير العالمية',
    },
    {
      icon: Users,
      title: 'مجتمع داعم',
      description: 'نبني مجتمعاً تعليمياً متعاوناً يدعم فيه الطلاب بعضهم البعض',
    },
    {
      icon: Zap,
      title: 'تعلم عملي',
      description: 'نركز على التطبيق العملي والمشاريع الحقيقية لبناء خبرة فعلية',
    },
    {
      icon: Award,
      title: 'شهادات معتمدة',
      description: 'نقدم شهادات إتمام موثقة تعزز سيرتك الذاتية',
    },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32">
        <div className="absolute inset-0 ishtar-pattern opacity-5" />
        <div className="container-custom text-center relative">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            من <span className="sumerian-gold-text">نحن</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            أكاديمية S7ee7 هي منصة تعليمية عراقية رائدة، تهدف إلى تمكين الشباب العربي
            بالمهارات الرقمية اللازمة للنجاح في سوق العمل الحديث
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-white/10">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-sumerian-gold/10 rounded-2xl flex items-center justify-center">
                  <stat.icon className="w-8 h-8 text-sumerian-gold" />
                </div>
                <p className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.value}</p>
                <p className="text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                رسالتنا
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-6">
                نسعى لأن نكون الوجهة الأولى للتعليم الرقمي في العراق والمنطقة العربية،
                من خلال تقديم كورسات احترافية بجودة عالمية وأسعار مناسبة للجميع.
              </p>
              <p className="text-gray-400 text-lg leading-relaxed">
                نؤمن بأن التعليم هو مفتاح التغيير، ولذلك نعمل على توفير أفضل المحتويات
                التعليمية في مجالات الأمن السيبراني، التسويق الرقمي، البرمجة، وغيرها.
              </p>
            </div>
            <div className="mesopotamian-card p-8 rounded-2xl">
              <h3 className="text-2xl font-bold text-white mb-6">رؤيتنا</h3>
              <p className="text-gray-400 leading-relaxed">
                أن نساهم في بناء جيل عراقي وعربي متمكن من المهارات الرقمية،
                قادر على المنافسة في سوق العمل العالمي، ومساهم في التحول الرقمي
                لمنطقتنا.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white/[0.02]">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              قيمنا
            </h2>
            <p className="text-gray-400 text-lg">
              المبادئ التي توجه عملنا كل يوم
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div key={index} className="mesopotamian-card p-6 rounded-2xl text-center">
                <div className="w-14 h-14 mx-auto mb-4 bg-sumerian-gold/10 rounded-xl flex items-center justify-center">
                  <value.icon className="w-7 h-7 text-sumerian-gold" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{value.title}</h3>
                <p className="text-gray-400 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            ابدأ رحلتك التعليمية معنا
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
            انضم إلى آلاف الطلاب الذين يطورون مهاراتهم معنا
          </p>
          <a
            href="/courses"
            className="btn-sumerian inline-flex items-center gap-2 px-8 py-4 text-lg"
          >
            تصفح الكورسات
          </a>
        </div>
      </section>
    </div>
  )
}
