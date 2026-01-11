'use client';

import {
  Shield, Code, Globe, Palette, Brain, TrendingUp,
  CheckCircle, XCircle, Target, Users, Sparkles, ArrowLeft,
  AlertTriangle, Zap, Heart, Eye, Lock, Wifi, Monitor,
  BookOpen, Award, Lightbulb, Filter, ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function WhyS7EE7Page() {
  const [isVisible, setIsVisible] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('section[id]').forEach((section) => {
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  const fears = [
    { fear: 'النصبة', thought: '"هاي نصب؟"', icon: AlertTriangle },
    { fear: 'الندم', thought: '"راح أندم؟"', icon: Heart },
    { fear: 'الغباء', thought: '"أطلع مغفّل؟"', icon: Eye },
    { fear: 'الفشل', thought: '"إذا ما استفدت؟"', icon: XCircle },
  ];

  const problems = [
    'دورات مترجمة حرفياً بدون سياق',
    'معمولة لسوق برّا العراق',
    'يدرّسها شخص ما اشتغل بالمجال',
    'فيديوهات طويلة بلا فائدة',
    'وعود كاذبة "وظيفة خلال أسبوع"',
  ];

  const solutions = [
    'نبني الكورس من الصفر',
    'حسب الواقع العراقي',
    'مدربين عاشوا المجال',
    'مسار واضح ومدروس',
    'وعد واقعي وصادق',
  ];

  const iraqiReality = [
    { icon: Wifi, title: 'إنترنت مختلف', desc: 'ندرّس على سرعات واقعية' },
    { icon: Monitor, title: 'أجهزة متوسطة', desc: 'مو كلنا عدنا MacBook' },
    { icon: Globe, title: 'سوق عمل حقيقي', desc: 'فرص موجودة بالعراق' },
    { icon: Brain, title: 'طريقة فهم مختلفة', desc: 'نشرح بأسلوبنا' },
  ];

  const weReject = [
    'بيع الوهم والأحلام الكاذبة',
    'وعد "توظيف خلال أسبوع"',
    'شهادات بلا قيمة حقيقية',
    'كورسات بلا تطبيق عملي',
    'حفظ بدون فهم',
  ];

  const paths = [
    { icon: Shield, title: 'الأمن السيبراني', color: 'from-red-500 to-orange-500', courses: 12 },
    { icon: Code, title: 'البرمجة', color: 'from-blue-500 to-cyan-500', courses: 8 },
    { icon: Globe, title: 'الشبكات', color: 'from-green-500 to-emerald-500', courses: 5 },
    { icon: Palette, title: 'التصميم', color: 'from-pink-500 to-purple-500', courses: 5 },
    { icon: Brain, title: 'الذكاء الاصطناعي', color: 'from-purple-500 to-indigo-500', courses: 3 },
    { icon: TrendingUp, title: 'التسويق الرقمي', color: 'from-yellow-500 to-orange-500', courses: 5 },
  ];

  const forWho = [
    'يريد يطوّر نفسه بجد',
    'يريد مهارة تفتح له باب رزق',
    'ملّ من اللف والدوران',
    'يريد شيء واضح وصادق',
    'مستعد يتعب ويتعلم صح',
  ];

  const notForWho = [
    'يريد "شهادة وخلاص"',
    'يدور على حلول سريعة',
    'ما عنده استعداد يتعب',
    'يريد نتائج بدون جهد',
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden" dir="rtl">

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 1: HERO - الصدمة الأولى
      ═══════════════════════════════════════════════════════════════ */}
      <section id="hero" className="min-h-screen flex items-center justify-center px-4 relative">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full px-6 py-2 mb-8">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-400 text-sm font-medium">منصّة عراقية بعقلية عالمية</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight">
            <span className="text-white">ليش</span>
            <br />
            <span className="bg-gradient-to-l from-cyan-400 via-cyan-300 to-white bg-clip-text text-transparent">
              S7EE7؟
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto">
            لأن التعلّم بالعراق صار غلط...
          </p>
          <p className="text-2xl md:text-3xl font-bold text-cyan-400 mb-12">
            وإحنا قررنا نصلّحه.
          </p>

          {/* Scroll indicator */}
          <div className="animate-bounce">
            <ChevronDown className="w-8 h-8 text-gray-500 mx-auto" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 2: المشكلة الحقيقية
      ═══════════════════════════════════════════════════════════════ */}
      <section id="problem" className={`py-24 px-4 transition-all duration-1000 ${isVisible['problem'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              خلّينا نحچي <span className="text-cyan-400">بصراحة</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              أغلب اللي يتعلّم بالعراق اليوم: يدخل يوتيوب، يشوف فيديوهات، يحمّل كورسات...
              <br />
              <span className="text-white font-semibold">وبالأخير يضيع.</span>
            </p>
          </div>

          {/* The Truth Box */}
          <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/30 rounded-3xl p-8 md:p-12 mb-16 text-center">
            <AlertTriangle className="w-16 h-16 text-amber-400 mx-auto mb-6" />
            <p className="text-2xl md:text-3xl font-bold text-white mb-4">
              مو لأن هو غبي...
            </p>
            <p className="text-3xl md:text-4xl font-black text-amber-400">
              بل لأن المنظومة نفسها غلط.
            </p>
          </div>

          {/* Fears Grid */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-center mb-8 text-gray-300">
              العراقي ما يشتري لأن المنتج حلو... يشتري لأن <span className="text-cyan-400">الخوف اختفى</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {fears.map((item, index) => (
                <div
                  key={index}
                  className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center hover:bg-red-500/20 transition-all duration-300"
                >
                  <item.icon className="w-10 h-10 text-red-400 mx-auto mb-3" />
                  <p className="text-lg font-bold text-white mb-1">{item.fear}</p>
                  <p className="text-sm text-red-300">{item.thought}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Problem Statement */}
          <div className="text-center">
            <p className="text-xl text-gray-400 mb-4">الدورات الموجودة:</p>
            <div className="flex flex-wrap justify-center gap-3">
              {['مترجمة حرفياً', 'لسوق برّا العراق', 'مدربين ما اشتغلوا بالمجال'].map((item, i) => (
                <span key={i} className="bg-gray-800 text-gray-400 px-4 py-2 rounded-full text-sm">
                  {item}
                </span>
              ))}
            </div>
            <p className="text-2xl font-bold text-white mt-8">
              والنتيجة؟ <span className="text-red-400">طالب يحفظ بدون ما يفهم.</span>
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 3: الحل - S7EE7
      ═══════════════════════════════════════════════════════════════ */}
      <section id="solution" className={`py-24 px-4 bg-gradient-to-b from-cyan-500/5 to-transparent transition-all duration-1000 ${isVisible['solution'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-cyan-500/20 rounded-full mb-6">
              <Zap className="w-10 h-10 text-cyan-400" />
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              S7EE7 انبنت حتى <span className="text-cyan-400">تكسر هذا الشي</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              إحنا ما سوّينا منصّة حتى نبيع فيديوهات.
              <br />
              <span className="text-white font-semibold">سوّيناها حتى نعلّم العقل قبل الأداة.</span>
            </p>
          </div>

          {/* Comparison */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Problems */}
            <div className="bg-gradient-to-br from-red-500/10 to-red-900/5 border border-red-500/20 rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-red-400">الباقي شنو يسوون</h3>
              </div>
              <ul className="space-y-4">
                {problems.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-400 mt-1 flex-shrink-0" />
                    <span className="text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Solutions */}
            <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-900/5 border border-cyan-500/20 rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-cyan-400">S7EE7 شنو تسوي</h3>
              </div>
              <ul className="space-y-4">
                {solutions.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-cyan-400 mt-1 flex-shrink-0" />
                    <span className="text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Philosophy */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 text-center">
            <Lightbulb className="w-12 h-12 text-yellow-400 mx-auto mb-6" />
            <p className="text-xl text-gray-400 mb-4">يعني:</p>
            <p className="text-xl md:text-2xl text-white mb-2">
              قبل ما نعلّمك <span className="text-cyan-400">شلون تضغط</span>،
            </p>
            <p className="text-2xl md:text-3xl font-bold text-cyan-400">
              نعلّمك شلون تفكّر.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 4: ليش عراقية
      ═══════════════════════════════════════════════════════════════ */}
      <section id="iraqi" className={`py-24 px-4 transition-all duration-1000 ${isVisible['iraqi'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              ليش <span className="text-cyan-400">"عراقية"</span>؟
            </h2>
            <p className="text-xl text-gray-400">
              لأن واقعنا مختلف. <span className="text-white">ونفتخر بيه.</span>
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {iraqiReality.map((item, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-2xl p-6 text-center hover:border-cyan-500/50 transition-all duration-300 group"
              >
                <div className="w-14 h-14 bg-cyan-500/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-cyan-500/20 transition-colors">
                  <item.icon className="w-7 h-7 text-cyan-400" />
                </div>
                <h3 className="font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-xl text-gray-400 mt-12">
            مو بيئة خيالية مال يوتيوبرز. <span className="text-cyan-400 font-semibold">بيئة عراقية حقيقية.</span>
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 5: شنو نرفضه
      ═══════════════════════════════════════════════════════════════ */}
      <section id="values" className={`py-24 px-4 bg-gradient-to-b from-red-500/5 to-transparent transition-all duration-1000 ${isVisible['values'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/20 rounded-full mb-8">
            <Lock className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            شنو <span className="text-red-400">نرفضه</span>؟
          </h2>
          <p className="text-xl text-gray-400 mb-12">
            إذا ما يفيدك واقعياً، <span className="text-white">ما ندرّسه.</span>
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            {weReject.map((item, index) => (
              <div
                key={index}
                className="bg-red-500/10 border border-red-500/20 rounded-full px-6 py-3 flex items-center gap-2"
              >
                <XCircle className="w-5 h-5 text-red-400" />
                <span className="text-gray-300">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 6: الوعد
      ═══════════════════════════════════════════════════════════════ */}
      <section id="promise" className={`py-24 px-4 transition-all duration-1000 ${isVisible['promise'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-cyan-500/20 via-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-3xl p-8 md:p-16 text-center relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl" />

            <div className="relative z-10">
              <Award className="w-16 h-16 text-cyan-400 mx-auto mb-8" />
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                شنو <span className="text-cyan-400">وعدنا</span>؟
              </h2>
              <p className="text-xl text-gray-300 mb-8">وعدنا بسيط:</p>

              <div className="bg-black/30 rounded-2xl p-8 mb-8">
                <p className="text-xl md:text-2xl text-white leading-relaxed">
                  إذا دخلت S7EE7 وتعلّمت صح،
                  <br />
                  <span className="text-cyan-400 font-bold text-2xl md:text-3xl">
                    راح تصير أقوى من 90%
                  </span>
                  <br />
                  من الناس اللي بس تجمع كورسات.
                </p>
              </div>

              <p className="text-lg text-gray-400">
                مو لأنك تشوف أكثر... <span className="text-white font-semibold">بل لأنك تفهم أعمق.</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 7: إحنا مو منصة - إحنا تصفية
      ═══════════════════════════════════════════════════════════════ */}
      <section id="filter" className={`py-24 px-4 bg-gradient-to-b from-purple-500/5 to-transparent transition-all duration-1000 ${isVisible['filter'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-500/20 rounded-full mb-8">
            <Filter className="w-10 h-10 text-purple-400" />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            إحنا مو منصّة
          </h2>
          <p className="text-3xl md:text-4xl font-bold text-purple-400 mb-12">
            إحنا تصفية.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { text: 'الصح من الغلط', icon: CheckCircle },
              { text: 'المهم من الزايد', icon: Target },
              { text: 'الحقيقي من الوهم', icon: Eye },
            ].map((item, index) => (
              <div key={index} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <item.icon className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                <p className="text-lg font-semibold text-white">{item.text}</p>
              </div>
            ))}
          </div>

          <p className="text-xl text-gray-400 mt-12">
            حتى تقدر <span className="text-white font-semibold">تبني نفسك بثقة.</span>
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 8: المسارات
      ═══════════════════════════════════════════════════════════════ */}
      <section id="paths" className={`py-24 px-4 transition-all duration-1000 ${isVisible['paths'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <BookOpen className="w-12 h-12 text-cyan-400 mx-auto mb-6" />
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              شنو تقدر <span className="text-cyan-400">تتعلّم</span> هنا؟
            </h2>
            <p className="text-xl text-gray-400">
              مسارات مبنية بنفس الفلسفة: <span className="text-cyan-400 font-semibold">فهم → تطبيق → احتراف</span>
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {paths.map((path, index) => (
              <div
                key={index}
                className="group relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl p-6 text-center transition-all duration-300 hover:scale-105 overflow-hidden"
              >
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${path.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                <div className="relative z-10">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${path.color} flex items-center justify-center`}>
                    <path.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{path.title}</h3>
                  <p className="text-sm text-gray-400">{path.courses} كورس</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 9: لمن هذه المنصة
      ═══════════════════════════════════════════════════════════════ */}
      <section id="forwho" className={`py-24 px-4 bg-gradient-to-b from-cyan-500/5 to-transparent transition-all duration-1000 ${isVisible['forwho'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Users className="w-12 h-12 text-cyan-400 mx-auto mb-6" />
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              S7EE7 <span className="text-cyan-400">مو للكل</span>
            </h2>
            <p className="text-xl text-gray-400">
              وهذا اللي يخليها مميزة.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* For Who */}
            <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-900/5 border border-cyan-500/20 rounded-3xl p-8">
              <h3 className="text-2xl font-bold text-cyan-400 mb-6 flex items-center gap-3">
                <CheckCircle className="w-8 h-8" />
                هذه المنصّة للّي:
              </h3>
              <ul className="space-y-4">
                {forWho.map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-lg">
                    <CheckCircle className="w-6 h-6 text-cyan-400 mt-1 flex-shrink-0" />
                    <span className="text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Not For Who */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-3xl p-8">
              <h3 className="text-2xl font-bold text-gray-400 mb-6 flex items-center gap-3">
                <XCircle className="w-8 h-8" />
                مو للّي:
              </h3>
              <ul className="space-y-4">
                {notForWho.map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-lg">
                    <XCircle className="w-6 h-6 text-gray-600 mt-1 flex-shrink-0" />
                    <span className="text-gray-500">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 10: CTA النهائي
      ═══════════════════════════════════════════════════════════════ */}
      <section id="cta" className="py-32 px-4 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/20 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-500/30 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <Sparkles className="w-16 h-16 text-cyan-400 mx-auto mb-8" />

          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            S7EE7 مو موقع...
          </h2>
          <p className="text-4xl md:text-6xl font-black text-cyan-400 mb-8">
            هو عقلية.
          </p>

          <p className="text-xl text-gray-300 mb-4">
            إحنا ما نبيع فيديوهات.
          </p>
          <p className="text-2xl text-white font-bold mb-12">
            إحنا نبني طريقة تفكير.
          </p>

          <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-8 mb-12 max-w-2xl mx-auto">
            <p className="text-lg text-gray-300">
              إذا دخلت صحيح المنصّة:
            </p>
            <p className="text-xl text-cyan-400 font-semibold mt-2">
              راح تتغيّر نظرتك للتعلّم، وللمهارة، ولنفسك.
            </p>
          </div>

          <Link
            href="/courses"
            className="inline-flex items-center gap-3 bg-gradient-to-l from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-black font-black text-xl md:text-2xl px-12 py-6 rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50"
          >
            ابدأ رحلتك الآن
            <ArrowLeft className="w-7 h-7" />
          </Link>

          <p className="text-gray-500 mt-8 text-sm">
            منصّة عراقية • بعقلية عالمية • وبقلب صادق
          </p>
        </div>
      </section>

    </div>
  );
}
