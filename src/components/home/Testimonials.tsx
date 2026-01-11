'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface Testimonial {
  id: number
  name: string
  role: string
  company: string
  avatar?: string | null
  rating: number
  text: string
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'أحمد محمد',
    role: 'Media Buyer',
    company: 'وكالة تسويق',
    avatar: null,
    rating: 5,
    text: 'بعد كورس Media Buying، صرت أدير حملات بميزانية $10,000+ شهرياً. المحتوى عملي 100% والنتائج ملموسة.',
  },
  {
    id: 2,
    name: 'سارة علي',
    role: 'مسوقة رقمية',
    company: 'شركة ناشئة',
    avatar: null,
    rating: 5,
    text: 'أفضل استثمار في حياتي المهنية. تعلمت استراتيجيات لم أجدها في أي مكان آخر.',
  },
  {
    id: 3,
    name: 'محمد حسين',
    role: 'صاحب متجر إلكتروني',
    company: 'متجر أونلاين',
    avatar: null,
    rating: 5,
    text: 'ضاعفت مبيعاتي 3 مرات خلال شهرين فقط بتطبيق ما تعلمته. شكراً S7ee7!',
  },
  {
    id: 4,
    name: 'زينب كريم',
    role: 'Freelancer',
    company: 'عمل حر',
    avatar: null,
    rating: 5,
    text: 'الآن أقدم خدمات إدارة الإعلانات للعملاء بأسعار عالية. الكورس غير حياتي.',
  },
  {
    id: 5,
    name: 'علي حسن',
    role: 'مطور ويب',
    company: 'شركة تقنية',
    avatar: null,
    rating: 5,
    text: 'الكورسات احترافية جداً والشرح واضح. أنصح بها لكل من يريد التطور.',
  },
]

interface TestimonialsProps {
  className?: string
}

export function Testimonials({ className = '' }: TestimonialsProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  // Auto-rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1)
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const goToPrevious = () => {
    setDirection(-1)
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const goToNext = () => {
    setDirection(1)
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1)
    setCurrentIndex(index)
  }

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 100 : -100,
      opacity: 0,
    }),
  }

  const currentTestimonial = testimonials[currentIndex]

  return (
    <section className={`py-20 relative bg-sumerian-clay/50 rosette-pattern ${className}`}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-sumerian-gold text-sm font-medium mb-2 block">
            آراء طلابنا
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-sumerian-cream mb-4">
            ماذا يقول طلابنا؟
          </h2>
          <p className="text-gray-400">آراء حقيقية من طلاب حققوا نتائج</p>
        </motion.div>

        {/* Testimonials Carousel */}
        <div className="relative max-w-4xl mx-auto">
          {/* Navigation Arrows */}
          <button
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-10 w-10 h-10 bg-sumerian-gold/20 hover:bg-sumerian-gold/30 rounded-full flex items-center justify-center text-sumerian-gold transition-all"
            aria-label="الشهادة السابقة"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-10 w-10 h-10 bg-sumerian-gold/20 hover:bg-sumerian-gold/30 rounded-full flex items-center justify-center text-sumerian-gold transition-all"
            aria-label="الشهادة التالية"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Testimonial Card */}
          <div className="overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="testimonial-ishtar rounded-2xl p-8 md:p-12 bg-gradient-to-br from-sumerian-clay/80 to-sumerian-dark/80 border border-sumerian-gold/20"
              >
                {/* Quote Icon */}
                <div className="text-sumerian-gold/30 mb-6">
                  <Quote className="w-12 h-12" />
                </div>

                {/* Text */}
                <p className="text-xl md:text-2xl text-sumerian-cream leading-relaxed mb-8">
                  "{currentTestimonial.text}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14 border-2 border-sumerian-gold/30">
                    {currentTestimonial.avatar ? (
                      <AvatarImage src={currentTestimonial.avatar} alt={currentTestimonial.name} />
                    ) : null}
                    <AvatarFallback className="bg-gradient-to-br from-sumerian-gold to-sumerian-sand text-sumerian-dark font-bold">
                      {currentTestimonial.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-bold text-sumerian-cream">
                      {currentTestimonial.name}
                    </h4>
                    <p className="text-gray-400 text-sm">
                      {currentTestimonial.role} • {currentTestimonial.company}
                    </p>
                  </div>
                  <div className="mr-auto flex gap-1">
                    {[...Array(currentTestimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 text-sumerian-gold fill-sumerian-gold"
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-6" role="tablist">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                role="tab"
                aria-selected={index === currentIndex}
                aria-label={`شهادة ${index + 1}`}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'w-8 bg-sumerian-gold'
                    : 'w-2 bg-sumerian-gold/30 hover:bg-sumerian-gold/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Testimonials
