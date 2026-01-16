'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import {
  ArrowLeft,
  Star,
  Users,
  BookOpen,
  Flame,
  Shield,
  TrendingUp,
  Code,
  Network,
  Smartphone,
  Palette,
  Globe,
  GraduationCap,
  MonitorPlay,
  Award,
  MessageSquare,
  Infinity as InfinityIcon,
  Wallet,
  Play,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  CheckCircle,
  Clock,
  Target,
  Zap,
  HeadphonesIcon,
  RefreshCw,
  DollarSign,
  ShieldCheck,
  Sparkles,
  X,
  Quote,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import CourseCard from '@/components/course/CourseCard'
import type { Course } from '@/types/database'

// ============================================
// SUMERIAN DESIGN DATA
// ============================================

// Cuneiform characters for floating animation
const cuneiformChars = ['𒀭', '𒁹', '𒌋', '𒈦', '𒀀', '𒁀', '𒂊', '𒃻', '𒄿', '𒅆', '𒆠', '𒇷']

// Categories data with Mesopotamian styling
const categories = [
  {
    id: 'marketing',
    name: 'التسويق الرقمي',
    nameEn: 'Digital Marketing',
    icon: TrendingUp,
    count: 12,
    color: 'from-sumerian-gold to-amber-600',
    bgColor: 'bg-sumerian-gold/10',
  },
  {
    id: 'cybersecurity',
    name: 'الأمن السيبراني',
    nameEn: 'Cybersecurity',
    icon: Shield,
    count: 8,
    color: 'from-sumerian-lapis to-blue-600',
    bgColor: 'bg-sumerian-lapis/10',
  },
  {
    id: 'programming',
    name: 'البرمجة',
    nameEn: 'Programming',
    icon: Code,
    count: 15,
    color: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-500/10',
  },
  {
    id: 'networking',
    name: 'الشبكات و IT',
    nameEn: 'Networking & IT',
    icon: Network,
    count: 6,
    color: 'from-purple-500 to-violet-600',
    bgColor: 'bg-purple-500/10',
  },
  {
    id: 'app-development',
    name: 'تطوير التطبيقات',
    nameEn: 'App Development',
    icon: Smartphone,
    count: 5,
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-orange-500/10',
  },
  {
    id: 'design',
    name: 'التصميم والمونتاج',
    nameEn: 'Design & Editing',
    icon: Palette,
    count: 7,
    color: 'from-pink-500 to-rose-500',
    bgColor: 'bg-pink-500/10',
  },
  {
    id: 'web-development',
    name: 'تطوير الويب',
    nameEn: 'Web Development',
    icon: Globe,
    count: 10,
    color: 'from-cyan-500 to-blue-500',
    bgColor: 'bg-cyan-500/10',
  },
]

// Features data (8 features)
const features = [
  {
    icon: GraduationCap,
    title: 'محتوى عربي احترافي',
    description: 'كورسات مصممة خصيصاً للمتعلم العربي',
  },
  {
    icon: MonitorPlay,
    title: 'تعلم من أي مكان',
    description: 'شاهد الدروس على أي جهاز وفي أي وقت',
  },
  {
    icon: Award,
    title: 'شهادات معتمدة',
    description: 'شهادات موثقة تضاف لسيرتك الذاتية',
  },
  {
    icon: HeadphonesIcon,
    title: 'دعم فني مستمر',
    description: 'فريق دعم جاهز للإجابة على استفساراتك',
  },
  {
    icon: InfinityIcon,
    title: 'وصول مدى الحياة',
    description: 'ادفع مرة واحدة واحصل على وصول دائم',
  },
  {
    icon: Target,
    title: 'تطبيق عملي',
    description: 'مشاريع حقيقية وتمارين عملية',
  },
  {
    icon: RefreshCw,
    title: 'تحديثات مستمرة',
    description: 'محتوى محدث يواكب أحدث التطورات',
  },
  {
    icon: Zap,
    title: 'نتائج سريعة',
    description: 'منهج مكثف يوصلك للنتائج بسرعة',
  },
]

// Testimonials data
const testimonials = [
  {
    name: 'أحمد محمد',
    role: 'Media Buyer',
    company: 'وكالة تسويق',
    avatar: null,
    rating: 5,
    text: 'بعد كورس Media Buying، صرت أدير حملات بميزانية $10,000+ شهرياً. المحتوى عملي 100% والنتائج ملموسة.',
  },
  {
    name: 'سارة علي',
    role: 'مسوقة رقمية',
    company: 'شركة ناشئة',
    avatar: null,
    rating: 5,
    text: 'أفضل استثمار في حياتي المهنية. تعلمت استراتيجيات لم أجدها في أي مكان آخر.',
  },
  {
    name: 'محمد حسين',
    role: 'صاحب متجر إلكتروني',
    company: 'متجر أونلاين',
    avatar: null,
    rating: 5,
    text: 'ضاعفت مبيعاتي 3 مرات خلال شهرين فقط بتطبيق ما تعلمته. شكراً S7ee7!',
  },
  {
    name: 'زينب كريم',
    role: 'Freelancer',
    company: 'عمل حر',
    avatar: null,
    rating: 5,
    text: 'الآن أقدم خدمات إدارة الإعلانات للعملاء بأسعار عالية. الكورس غير حياتي.',
  },
  {
    name: 'علي حسن',
    role: 'مطور ويب',
    company: 'شركة تقنية',
    avatar: null,
    rating: 5,
    text: 'الكورسات احترافية جداً والشرح واضح. أنصح بها لكل من يريد التطور.',
  },
]

// FAQ data
const faqs = [
  {
    question: 'كيف يمكنني الدفع؟',
    answer: 'نقبل الدفع عبر زين كاش وآسيا حوالة. بعد التحويل، أرسل صورة الإيصال وسيتم تفعيل حسابك خلال ساعات قليلة.',
  },
  {
    question: 'هل الكورسات باللغة العربية؟',
    answer: 'نعم! جميع الكورسات باللغة العربية مع شرح واضح ومبسط يناسب المبتدئين والمحترفين.',
  },
  {
    question: 'هل يوجد ضمان استرداد؟',
    answer: 'نعم، نقدم ضمان استرداد لمدة 7 أيام. إذا لم تكن راضياً عن الكورس، سنرد لك المبلغ كاملاً.',
  },
  {
    question: 'كم مدة صلاحية الكورس؟',
    answer: 'الوصول مدى الحياة! ادفع مرة واحدة واحصل على وصول دائم للكورس وجميع التحديثات المستقبلية.',
  },
  {
    question: 'هل أحصل على شهادة؟',
    answer: 'نعم، بعد إكمال أي كورس ستحصل على شهادة إتمام رسمية يمكنك إضافتها لسيرتك الذاتية.',
  },
  {
    question: 'هل يمكنني مشاهدة الدروس على الموبايل؟',
    answer: 'نعم! المنصة متوافقة مع جميع الأجهزة - موبايل، تابلت، وكمبيوتر.',
  },
]

// About platform features
const platformFeatures = [
  'كل كورس منتقى بعناية',
  'مدربين معتمدين دولياً',
  'دفع بزين كاش وآسيا حوالة',
  'دعم عراقي مباشر',
]

interface HomeClientProps {
  featuredCourses: Course[]
  latestCourses: Course[]
  allCourses: Course[]
  coursesCount: number
  studentsCount: number
}

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

// ============================================
// ANIMATED COUNTER COMPONENT
// ============================================
function AnimatedCounter({
  value,
  suffix = '',
  prefix = '',
  decimals = 0,
}: {
  value: number
  suffix?: string
  prefix?: string
  decimals?: number
}) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  useEffect(() => {
    if (!isInView) return

    const duration = 2000
    const steps = 60
    const stepValue = value / steps
    let current = 0

    const timer = setInterval(() => {
      current += stepValue
      if (current >= value) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(current)
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [isInView, value])

  return (
    <span ref={ref}>
      {prefix}
      {decimals > 0 ? count.toFixed(decimals) : Math.floor(count)}
      {suffix}
    </span>
  )
}

// ============================================
// FLOATING CUNEIFORM COMPONENT
// ============================================
function FloatingCuneiform() {
  const [mounted, setMounted] = useState(false)
  const [positions, setPositions] = useState<Array<{left: number, top: number, delay: number, duration: number}>>([])

  useEffect(() => {
    setMounted(true)
    // Generate random positions only on client to avoid hydration mismatch
    const newPositions = cuneiformChars.map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 10 + Math.random() * 20,
    }))
    setPositions(newPositions)
  }, [])

  // Don't render anything until client-side
  if (!mounted || positions.length === 0) {
    return <div className="absolute inset-0 overflow-hidden pointer-events-none" />
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {cuneiformChars.map((char, index) => (
        <motion.span
          key={index}
          className="absolute text-sumerian-gold/20 text-2xl md:text-4xl font-bold select-none"
          style={{
            left: `${positions[index]?.left || 0}%`,
            top: `${positions[index]?.top || 0}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.1, 0.3, 0.1],
            rotate: [0, 10, 0],
          }}
          transition={{
            duration: positions[index]?.duration || 15,
            repeat: Infinity,
            delay: positions[index]?.delay || 0,
            ease: 'easeInOut',
          }}
        >
          {char}
        </motion.span>
      ))}
    </div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function HomeClient({
  featuredCourses,
  latestCourses,
  allCourses,
  coursesCount,
  studentsCount,
}: HomeClientProps) {
  const [showStickyCTA, setShowStickyCTA] = useState(false)
  const [activeFilter, setActiveFilter] = useState('all')
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  // Scroll listener for sticky CTA
  useEffect(() => {
    const handleScroll = () => {
      setShowStickyCTA(window.scrollY > 500)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Auto-rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  // Filter courses
  const filteredCourses =
    activeFilter === 'all'
      ? allCourses
      : allCourses.filter((c) => c.category === activeFilter)

  // Copy to clipboard
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedAccount(id)
    setTimeout(() => setCopiedAccount(null), 2000)
  }

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-IQ').format(price)
  }

  return (
    <div className="bg-sumerian-dark min-h-screen overflow-x-hidden">
      {/* ==================== 1. HERO SECTION - SUMERIAN STYLE ==================== */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0">
          {/* Base gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-sumerian-dark via-sumerian-clay to-sumerian-dark" />

          {/* Ishtar Gate Pattern Overlay */}
          <div className="absolute inset-0 ishtar-pattern-gold opacity-30" />

          {/* Floating Cuneiform Characters */}
          <FloatingCuneiform />

          {/* Animated gradient orbs - Mesopotamian colors */}
          <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-sumerian-lapis rounded-full filter blur-[200px] opacity-20 animate-pulse" />
          <div
            className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-sumerian-gold rounded-full filter blur-[200px] opacity-15 animate-pulse"
            style={{ animationDelay: '1s' }}
          />

          {/* Ziggurat silhouette */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-sumerian-dark to-transparent" />

          {/* Palm tree decorations */}
          <div className="absolute bottom-20 left-10 text-6xl opacity-10 animate-float-slow">
            🌴
          </div>
          <div
            className="absolute bottom-32 right-16 text-5xl opacity-10 animate-float-slow"
            style={{ animationDelay: '2s' }}
          >
            🌴
          </div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              {/* Badge with Sumerian style */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-sumerian-gold/10 border border-sumerian-gold/30 px-5 py-2.5 rounded-full sumerian-border-glow"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sumerian-gold opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-sumerian-gold" />
                </span>
                <span className="text-sumerian-gold text-sm font-medium">
                  الأكاديمية الأولى للتسويق الرقمي في العراق
                </span>
              </motion.div>

              {/* Title with Sumerian Gold Gradient */}
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-sumerian-cream leading-tight">
                تعلم التسويق الرقمي والبرمجة
                <span className="block mt-2 sumerian-gold-text">بالعربي</span>
              </h1>

              {/* Cuneiform Divider */}
              <div className="cuneiform-divider" />

              {/* Description */}
              <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                تعلم من خبير بـ{' '}
                <span className="text-sumerian-gold font-semibold">$425,000+</span> Ad
                Spend. كورسات عملية في Meta Ads، Google Ads، والتجارة الإلكترونية.
                ابدأ رحلتك نحو الحرية المالية اليوم!
              </p>

              {/* Key Stats - 3 نقاط مميزة */}
              <div className="flex flex-wrap justify-center gap-4 md:gap-8">
                <div className="flex items-center gap-2 bg-sumerian-gold/10 px-4 py-2 rounded-full">
                  <BookOpen className="w-5 h-5 text-sumerian-gold" />
                  <span className="text-sumerian-cream font-semibold">41+ كورس</span>
                </div>
                <div className="flex items-center gap-2 bg-sumerian-gold/10 px-4 py-2 rounded-full">
                  <GraduationCap className="w-5 h-5 text-sumerian-gold" />
                  <span className="text-sumerian-cream font-semibold">7 تخصصات</span>
                </div>
                <div className="flex items-center gap-2 bg-sumerian-gold/10 px-4 py-2 rounded-full">
                  <Award className="w-5 h-5 text-sumerian-gold" />
                  <span className="text-sumerian-cream font-semibold">شهادات معتمدة</span>
                </div>
              </div>

              {/* CTA Buttons - Sumerian Style */}
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/courses">
                  <Button
                    size="lg"
                    className="h-14 px-8 text-lg btn-sumerian rounded-xl"
                  >
                    تصفح الكورسات
                    <ArrowLeft className="mr-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-14 px-8 text-lg btn-lapis rounded-xl"
                  >
                    <Sparkles className="ml-2 h-5 w-5" />
                    ابدأ مجاناً
                  </Button>
                </Link>
              </div>

              {/* Lamassu (Winged Bull) decorative element */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.1 }}
                transition={{ delay: 1, duration: 1 }}
                className="absolute left-0 top-1/2 -translate-y-1/2 text-9xl hidden xl:block"
              >
                🦁
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator with gold */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-sumerian-gold/30 rounded-full flex justify-center">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-3 bg-sumerian-gold rounded-full mt-2"
            />
          </div>
        </motion.div>
      </section>

      {/* ==================== 2. STATS COUNTER SECTION ==================== */}
      <section className="py-16 relative ancient-scroll">
        {/* Cuneiform border pattern */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sumerian-gold/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sumerian-gold/50 to-transparent" />

        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {/* Stat 1: Lessons */}
            <div className="text-center group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="mesopotamian-card rounded-2xl p-6 transition-all duration-300"
              >
                <div className="w-14 h-14 mx-auto mb-4 ancient-seal text-xl">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="text-3xl md:text-4xl font-bold sumerian-gold-text mb-1">
                  <AnimatedCounter value={745} suffix="+" />
                </div>
                <div className="text-gray-400 text-sm">درس تعليمي</div>
              </motion.div>
            </div>

            {/* Stat 2: Courses */}
            <div className="text-center group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="mesopotamian-card rounded-2xl p-6 transition-all duration-300"
              >
                <div className="w-14 h-14 mx-auto mb-4 ancient-seal text-xl">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div className="text-3xl md:text-4xl font-bold sumerian-gold-text mb-1">
                  <AnimatedCounter value={coursesCount || 13} suffix="+" />
                </div>
                <div className="text-gray-400 text-sm">كورس احترافي</div>
              </motion.div>
            </div>

            {/* Stat 3: Students */}
            <div className="text-center group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="mesopotamian-card rounded-2xl p-6 transition-all duration-300"
              >
                <div className="w-14 h-14 mx-auto mb-4 ancient-seal text-xl">
                  <Users className="w-6 h-6" />
                </div>
                <div className="text-3xl md:text-4xl font-bold sumerian-gold-text mb-1">
                  <AnimatedCounter value={studentsCount || 1000} suffix="+" />
                </div>
                <div className="text-gray-400 text-sm">طالب مسجل</div>
              </motion.div>
            </div>

            {/* Stat 4: Rating */}
            <div className="text-center group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="mesopotamian-card rounded-2xl p-6 transition-all duration-300"
              >
                <div className="w-14 h-14 mx-auto mb-4 ancient-seal text-xl">
                  <Star className="w-6 h-6" />
                </div>
                <div className="text-3xl md:text-4xl font-bold sumerian-gold-text mb-1 flex items-center justify-center gap-2">
                  <Star className="w-6 h-6 text-sumerian-gold fill-sumerian-gold" />
                  <AnimatedCounter value={4.9} decimals={1} />
                </div>
                <div className="text-gray-400 text-sm">تقييم الطلاب</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ==================== 3. TESTIMONIALS CAROUSEL ==================== */}
      <section className="py-20 relative bg-sumerian-clay/50 rosette-pattern">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-sumerian-gold text-sm font-medium mb-2 block">
              𒀭 آراء طلابنا 𒀭
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-sumerian-cream mb-4">
              ماذا يقول طلابنا؟
            </h2>
            <p className="text-gray-400">آراء حقيقية من طلاب حققوا نتائج</p>
          </motion.div>

          {/* Testimonials Carousel */}
          <div className="relative max-w-4xl mx-auto">
            {/* Navigation Arrows - with proper touch targets (48px+) */}
            <button
              onClick={() =>
                setCurrentTestimonial(
                  (prev) => (prev - 1 + testimonials.length) % testimonials.length
                )
              }
              aria-label="الشهادة السابقة"
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-10 w-12 h-12 min-w-[48px] min-h-[48px] bg-sumerian-gold/20 hover:bg-sumerian-gold/30 rounded-full flex items-center justify-center text-sumerian-gold transition-all"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
            <button
              onClick={() =>
                setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
              }
              aria-label="الشهادة التالية"
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-10 w-12 h-12 min-w-[48px] min-h-[48px] bg-sumerian-gold/20 hover:bg-sumerian-gold/30 rounded-full flex items-center justify-center text-sumerian-gold transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Testimonial Card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="testimonial-ishtar rounded-2xl p-8 md:p-12"
              >
                {/* Quote Icon */}
                <div className="text-sumerian-gold/30 mb-6">
                  <Quote className="w-12 h-12" />
                </div>

                {/* Text */}
                <p className="text-xl md:text-2xl text-sumerian-cream leading-relaxed mb-8">
                  "{testimonials[currentTestimonial].text}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14 border-2 border-sumerian-gold/30">
                    <AvatarFallback className="bg-gradient-to-br from-sumerian-gold to-sumerian-sand text-sumerian-dark font-bold">
                      {testimonials[currentTestimonial].name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold text-sumerian-cream">
                      {testimonials[currentTestimonial].name}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {testimonials[currentTestimonial].role} •{' '}
                      {testimonials[currentTestimonial].company}
                    </p>
                  </div>
                  <div className="mr-auto flex gap-1" aria-label={`تقييم ${testimonials[currentTestimonial].rating} من 5`}>
                    {[...Array(testimonials[currentTestimonial].rating)].map(
                      (_, i) => (
                        <Star
                          key={i}
                          className="w-5 h-5 text-sumerian-gold fill-sumerian-gold"
                          aria-hidden="true"
                        />
                      )
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Dots Indicator - with proper touch targets */}
            <div className="flex justify-center gap-1 mt-6" role="tablist" aria-label="اختيار الشهادة">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  role="tab"
                  aria-selected={index === currentTestimonial}
                  aria-label={`شهادة ${index + 1} من ${testimonials.length}`}
                  className="min-w-[44px] min-h-[44px] p-4 flex items-center justify-center"
                >
                  <span
                    className={`block h-3 rounded-full transition-all ${
                      index === currentTestimonial
                        ? 'w-8 bg-sumerian-gold'
                        : 'w-3 bg-sumerian-gold/30'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 4. FEATURED COURSES SECTION ==================== */}
      <section className="py-20 relative bg-sumerian-dark">
        {/* Background pattern */}
        <div className="absolute inset-0 chevron-pattern opacity-50" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-3xl md:text-4xl font-bold text-sumerian-cream">
                  الكورسات
                </h2>
                <Badge className="bg-sumerian-gold/20 text-sumerian-gold border-sumerian-gold/30 flex items-center gap-1">
                  <Flame className="h-4 w-4" />
                  {coursesCount} كورس
                </Badge>
              </div>
              <p className="text-gray-400">اكتشف كورساتنا المتنوعة</p>
            </div>
            <Link href="/courses">
              <Button className="btn-lapis rounded-xl">
                عرض الكل
                <ArrowLeft className="mr-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>

          {/* Filter tabs with Mesopotamian style */}
          <div className="flex flex-wrap gap-2 mb-8 overflow-x-auto pb-2" role="tablist" aria-label="تصفية الكورسات">
            <button
              onClick={() => setActiveFilter('all')}
              role="tab"
              aria-selected={activeFilter === 'all'}
              aria-label="عرض جميع الكورسات"
              className={`px-4 py-2 min-h-[44px] rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                activeFilter === 'all'
                  ? 'bg-sumerian-gold text-sumerian-dark'
                  : 'bg-sumerian-gold/10 text-gray-400 hover:bg-sumerian-gold/20 border border-sumerian-gold/20'
              }`}
            >
              الكل
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveFilter(cat.id)}
                role="tab"
                aria-selected={activeFilter === cat.id}
                aria-label={`عرض كورسات ${cat.name}`}
                className={`px-4 py-2 min-h-[44px] rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  activeFilter === cat.id
                    ? 'bg-sumerian-gold text-sumerian-dark'
                    : 'bg-sumerian-gold/10 text-gray-400 hover:bg-sumerian-gold/20 border border-sumerian-gold/20'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Courses grid */}
          {filteredCourses.length > 0 ? (
            <motion.div
              layout
              className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              <AnimatePresence>
                {filteredCourses.slice(0, 8).map((course, index) => (
                  <CourseCard key={course.id} course={course} index={index} />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="text-center py-12 mesopotamian-card rounded-2xl">
              <BookOpen className="h-16 w-16 text-sumerian-gold/30 mx-auto mb-4" />
              <p className="text-gray-400">لا توجد كورسات في هذا التصنيف حالياً</p>
            </div>
          )}

          {filteredCourses.length > 8 && (
            <div className="text-center mt-8">
              <Link href="/courses">
                <Button size="lg" className="btn-sumerian rounded-xl">
                  عرض جميع الكورسات ({filteredCourses.length})
                  <ArrowLeft className="mr-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ==================== 5. FEATURES SECTION ==================== */}
      <section className="py-20 relative bg-sumerian-clay/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-sumerian-gold text-sm font-medium mb-2 block">
              𒁹 لماذا نحن؟ 𒁹
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-sumerian-cream mb-4">
              لماذا S7ee7 Academy؟
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              نقدم لك تجربة تعليمية لا مثيل لها مع ميزات حصرية تضمن نجاحك
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
          >
            {features.map((feature, index) => {
              const IconComponent = feature.icon
              return (
                <motion.div
                  key={index}
                  variants={item}
                  whileHover={{ y: -5 }}
                  className="group clay-tablet p-6 hover:border-sumerian-gold/40 transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-sumerian-gold/20 to-sumerian-gold/5 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <IconComponent className="h-6 w-6 text-sumerian-gold" />
                  </div>
                  <h3 className="font-bold text-sumerian-cream mb-2 text-sm md:text-base">
                    {feature.title}
                  </h3>
                  <p className="text-gray-500 text-xs md:text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* ==================== 6. CATEGORIES SECTION ==================== */}
      <section className="py-20 relative bg-sumerian-dark">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-sumerian-gold text-sm font-medium mb-2 block">
              𒌋 التصنيفات 𒌋
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-sumerian-cream mb-4">
              تصفح حسب التصنيف
            </h2>
            <p className="text-gray-400">اختر المجال الذي يناسبك وابدأ التعلم</p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4"
          >
            {categories.map((category) => {
              const IconComponent = category.icon
              return (
                <motion.div key={category.id} variants={item}>
                  <Link href={`/courses?category=${category.id}`}>
                    <motion.div
                      whileHover={{ scale: 1.05, y: -5 }}
                      className="group relative mesopotamian-card rounded-2xl p-5 text-center hover:border-sumerian-gold/40 transition-all duration-300"
                    >
                      <div
                        className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center shadow-lg`}
                      >
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-sumerian-cream text-sm group-hover:text-sumerian-gold transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {category.count} كورس
                      </p>
                    </motion.div>
                  </Link>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* ==================== 7. ABOUT PLATFORM SECTION ==================== */}
      <section className="py-20 relative overflow-hidden bg-sumerian-clay/30">
        {/* Background decorations */}
        <div className="absolute inset-0 ishtar-pattern-gold opacity-20" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Card side (Left) */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative order-2 md:order-1"
            >
              <div className="relative mesopotamian-card rounded-3xl p-8 shadow-2xl">
                {/* Gold border glow */}
                <div className="absolute inset-0 rounded-3xl animate-glow-pulse" />

                {/* Badge */}
                <div className="absolute -top-3 right-8">
                  <Badge className="bg-sumerian-gold text-sumerian-dark border-0 shadow-lg">
                    الأولى في العراق 🇮🇶
                  </Badge>
                </div>

                {/* Logo & Name */}
                <div className="text-center mb-8">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-sumerian-gold to-sumerian-sand flex items-center justify-center shadow-lg animate-glow-pulse">
                    <span className="text-4xl">🏛️</span>
                  </div>
                  <h3 className="text-2xl font-bold text-sumerian-cream">
                    S7EE7 Academy
                  </h3>
                  <p className="text-gray-400 text-sm">منصة تعليمية عراقية</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="clay-tablet rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold sumerian-gold-text">41+</div>
                    <div className="text-xs text-gray-400">كورس احترافي</div>
                  </div>
                  <div className="clay-tablet rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold sumerian-gold-text">7</div>
                    <div className="text-xs text-gray-400">تخصصات مختلفة</div>
                  </div>
                  <div className="clay-tablet rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold sumerian-gold-text">100%</div>
                    <div className="text-xs text-gray-400">عراقي بحت</div>
                  </div>
                  <div className="clay-tablet rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold sumerian-gold-text">∞</div>
                    <div className="text-xs text-gray-400">وصول مدى الحياة</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Content side (Right) */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6 order-1 md:order-2"
            >
              <div>
                <Badge className="bg-sumerian-gold/20 text-sumerian-gold border-sumerian-gold/30 mb-4">
                  عن المنصة
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-sumerian-cream mb-4">
                  S7EE7 Academy
                </h2>
                <p className="text-xl sumerian-gold-text mb-4">
                  أول منصة تعليمية عراقية متخصصة
                </p>
                <p className="text-gray-400 leading-relaxed">
                  أسسها حسين، انتقى أفضل الكورسات العربية من خبراء معتمدين عالمياً.
                  حتى تحصل على الشهادات العالمية من خلال هذه الكورسات.
                </p>
              </div>

              {/* Quote Box - Mesopotamian style */}
              <div className="clay-tablet border-r-4 border-sumerian-gold rounded-xl p-6">
                <p className="text-gray-300 italic leading-relaxed mb-4">
                  "ما لقيت منصة عراقية بحت كاملة تجمع كورسات جودة بأسعار مناسبة وطرق
                  دفع محلية. فقررت أبنيها."
                </p>
                <p className="text-sumerian-gold font-semibold">— حسين، مؤسس المنصة</p>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-3">
                {platformFeatures.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-sm text-gray-300"
                  >
                    <Check className="w-5 h-5 text-sumerian-gold flex-shrink-0" />
                    {feature}
                  </div>
                ))}
              </div>

              {/* CTA */}
              <Link href="/courses">
                <Button size="lg" className="btn-sumerian rounded-xl">
                  ابدأ رحلتك التعليمية
                  <ArrowLeft className="mr-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ==================== 8. PAYMENT METHODS ==================== */}
      <section className="py-20 relative bg-sumerian-dark">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-sumerian-gold text-sm font-medium mb-2 block">
              𒆠 طرق الدفع 𒆠
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-sumerian-cream mb-4">
              طرق الدفع المتاحة
            </h2>
            <p className="text-gray-400">ادفع بالطريقة التي تناسبك</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-12">
            {/* Zain Cash */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="clay-tablet rounded-2xl p-6 hover:border-green-500/30 transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">📱</span>
                </div>
                <div>
                  <h3 className="font-bold text-sumerian-cream">زين كاش</h3>
                  <p className="text-sm text-gray-500">Zain Cash</p>
                </div>
              </div>
              <div className="bg-black/30 rounded-xl p-4 flex items-center justify-between">
                <code className="text-green-400 font-mono">07801234567</code>
                <button
                  onClick={() => copyToClipboard('07801234567', 'zain')}
                  aria-label="نسخ رقم زين كاش"
                  className="text-gray-400 hover:text-white transition-colors p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  {copiedAccount === 'zain' ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>
            </motion.div>

            {/* Asia Hawala */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="clay-tablet rounded-2xl p-6 hover:border-blue-500/30 transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">💸</span>
                </div>
                <div>
                  <h3 className="font-bold text-sumerian-cream">آسيا حوالة</h3>
                  <p className="text-sm text-gray-500">Asia Hawala</p>
                </div>
              </div>
              <div className="bg-black/30 rounded-xl p-4 flex items-center justify-between">
                <code className="text-blue-400 font-mono">07701234567</code>
                <button
                  onClick={() => copyToClipboard('07701234567', 'asia')}
                  aria-label="نسخ رقم آسيا حوالة"
                  className="text-gray-400 hover:text-white transition-colors p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  {copiedAccount === 'asia' ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>
            </motion.div>
          </div>

          {/* Guarantee - Mesopotamian style */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <div className="mesopotamian-card rounded-2xl p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 ancient-seal">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-sumerian-cream mb-2">
                ضمان استرداد 7 أيام
              </h3>
              <p className="text-gray-400">
                إذا لم تكن راضياً عن الكورس خلال 7 أيام من الشراء، سنرد لك المبلغ
                كاملاً بدون أي أسئلة.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ==================== 9. FAQ SECTION ==================== */}
      <section className="py-20 relative bg-sumerian-clay/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-sumerian-gold text-sm font-medium mb-2 block">
              𒇷 الأسئلة الشائعة 𒇷
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-sumerian-cream mb-4">
              الأسئلة الشائعة
            </h2>
            <p className="text-gray-400">إجابات على أكثر الأسئلة شيوعاً</p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <button
                  onClick={() =>
                    setExpandedFAQ(expandedFAQ === index ? null : index)
                  }
                  aria-expanded={expandedFAQ === index}
                  aria-label={`${faq.question} - ${expandedFAQ === index ? 'إغلاق' : 'فتح'}`}
                  className="w-full clay-tablet rounded-xl p-5 min-h-[48px] text-right hover:border-sumerian-gold/40 transition-all"
                >
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="font-semibold text-sumerian-cream">
                      {faq.question}
                    </h3>
                    <ChevronDown
                      className={`w-5 h-5 text-sumerian-gold transition-transform flex-shrink-0 ${
                        expandedFAQ === index ? 'rotate-180' : ''
                      }`}
                      aria-hidden="true"
                    />
                  </div>
                  <AnimatePresence>
                    {expandedFAQ === index && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-gray-400 mt-4 text-sm leading-relaxed"
                      >
                        {faq.answer}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== 10. FINAL CTA - SUMERIAN STYLE ==================== */}
      <section className="py-20 relative overflow-hidden bg-sumerian-dark">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden"
          >
            {/* Background with Sumerian gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-sumerian-lapis via-sumerian-lapis to-sumerian-gold/50" />

            {/* Ishtar pattern overlay */}
            <div className="absolute inset-0 ishtar-pattern opacity-30" />

            {/* Ziggurat silhouette */}
            <div className="absolute bottom-0 left-0 right-0">
              <svg
                viewBox="0 0 1200 200"
                className="w-full h-32 text-sumerian-dark/30"
                preserveAspectRatio="none"
              >
                <polygon
                  fill="currentColor"
                  points="0,200 100,200 100,150 200,150 200,100 300,100 300,50 400,50 400,0 800,0 800,50 900,50 900,100 1000,100 1000,150 1100,150 1100,200 1200,200 1200,200 0,200"
                />
              </svg>
            </div>

            {/* Content */}
            <div className="relative z-10 p-8 md:p-16 text-center">
              {/* Cuneiform decoration */}
              <div className="text-sumerian-gold/30 text-2xl mb-6">
                𒀭 𒁹 𒌋 𒈦 𒀀 𒁀 𒂊 𒃻 𒄿 𒅆
              </div>

              <h2 className="text-3xl md:text-5xl font-bold text-sumerian-cream mb-4">
                جاهز تبدأ رحلتك؟
              </h2>
              <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
                انضم لآلاف الطلاب الذين غيروا مسارهم المهني مع S7ee7 Academy
              </p>

              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/courses">
                  <Button
                    size="lg"
                    className="h-14 px-8 text-lg bg-sumerian-gold text-sumerian-dark hover:bg-sumerian-sand shadow-xl rounded-xl font-bold"
                  >
                    ابدأ الآن
                    <ArrowLeft className="mr-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-14 px-8 text-lg border-sumerian-cream/30 text-sumerian-cream hover:bg-white/10 rounded-xl"
                  >
                    إنشاء حساب مجاني
                  </Button>
                </Link>
              </div>

              {/* Palm tree decorations */}
              <div className="absolute bottom-20 left-8 text-5xl opacity-20">
                🌴
              </div>
              <div className="absolute bottom-32 right-12 text-4xl opacity-20">
                🌴
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ==================== STICKY CTA ==================== */}
      <AnimatePresence>
        {showStickyCTA && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-sumerian-clay/95 backdrop-blur-lg border-t border-sumerian-gold/20 py-4"
          >
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between gap-4">
                <div className="hidden md:block">
                  <p className="text-sumerian-cream font-semibold">
                    ابدأ التعلم اليوم!
                  </p>
                  <p className="text-gray-400 text-sm">
                    +{coursesCount} كورس متاح الآن
                  </p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <Link href="/courses" className="flex-1 md:flex-initial">
                    <Button size="lg" className="w-full btn-sumerian rounded-xl">
                      تصفح الكورسات
                      <ArrowLeft className="mr-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    aria-label="العودة للأعلى"
                    className="p-3 min-w-[48px] min-h-[48px] bg-sumerian-gold/20 rounded-xl hover:bg-sumerian-gold/30 transition-colors flex items-center justify-center"
                  >
                    <ChevronDown className="w-5 h-5 text-sumerian-gold rotate-180" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== VIDEO MODAL ==================== */}
      <AnimatePresence>
        {showVideoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowVideoModal(false)}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl aspect-video mesopotamian-card rounded-2xl overflow-hidden"
            >
              {/* Close button */}
              <button
                onClick={() => setShowVideoModal(false)}
                aria-label="إغلاق الفيديو"
                className="absolute top-4 right-4 z-10 w-12 h-12 min-w-[48px] min-h-[48px] bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              >
                <X className="w-6 h-6" aria-hidden="true" />
              </button>

              {/* Video placeholder */}
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-gray-400">الفيديو التعريفي قريباً...</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}