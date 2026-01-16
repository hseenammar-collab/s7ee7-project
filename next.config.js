// src/components/home/Testimonials.tsx
'use client'

import { useState, useEffect } from 'react'
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react'

interface Testimonial {
  id: number
  name: string
  role: string
  company: string
  rating: number
  text: string
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'أحمد محمد',
    role: 'Media Buyer',
    company: 'وكالة تسويق',
    rating: 5,
    text: 'بعد كورس Media Buying، صرت أدير حملات بميزانية $10,000+ شهرياً. المحتوى عملي 100% والنتائج ملموسة.',
  },
  {
    id: 2,
    name: 'سارة علي',
    role: 'مسوقة رقمية',
    company: 'شركة ناشئة',
    rating: 5,
    text: 'أفضل استثمار في حياتي المهنية. تعلمت استراتيجيات لم أجدها في أي مكان آخر.',
  },
  {
    id: 3,
    name: 'محمد حسين',
    role: 'صاحب متجر إلكتروني',
    company: 'متجر أونلاين',
    rating: 5,
    text: 'ضاعفت مبيعاتي 3 مرات خلال شهرين فقط بتطبيق ما تعلمته. شكراً S7ee7!',
  },
  {
    id: 4,
    name: 'زينب كريم',
    role: 'Freelancer',
    company: 'عمل حر',
    rating: 5,
    text: 'الآن أقدم خدمات إدارة الإعلانات للعملاء بأسعار عالية. الكورس غير حياتي.',
  },
  {
    id: 5,
    name: 'علي حسن',
    role: 'مطور ويب',
    company: 'شركة تقنية',
    rating: 5,
    text: 'الكورسات احترافية جداً والشرح واضح. أنصح بها لكل من يريد التطور.',
  },
]

export function Testimonials({ className = '' }: { className?: string }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      goToNext()
    }, 5000)
    return () => clearInterval(timer)
  }, [currentIndex])

  const goToPrevious = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
    setTimeout(() => setIsTransitioning(false), 300)
  }

  const goToNext = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    setTimeout(() => setIsTransitioning(false), 300)
  }

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentIndex) return
    setIsTransitioning(true)
    setCurrentIndex(index)
    setTimeout(() => setIsTransitioning(false), 300)
  }

  const currentTestimonial = testimonials[currentIndex]

  return (
    <section className={`py-20 relative bg-[#1A1A2E]/50 ${className}`}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-[#D4AF37] text-sm font-medium mb-2 block">
            آراء طلابنا
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#F5F5DC] mb-4">
            ماذا يقول طلابنا؟
          </h2>
          <p className="text-gray-400">آراء حقيقية من طلاب حققوا نتائج</p>
        </div>

        {/* Testimonials Carousel */}
        <div className="relative max-w-4xl mx-auto">
          {/* Navigation Arrows */}
          <button
            onClick={goToPrevious}
            aria-label="الشهادة السابقة"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-10 w-12 h-12 bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 rounded-full flex items-center justify-center text-[#D4AF37] transition-all"
          >
            <ChevronRight className="w-6 h-6" />
            <span className="sr-only">السابق</span>
          </button>
          <button
            onClick={goToNext}
            aria-label="الشهادة التالية"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-10 w-12 h-12 bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 rounded-full flex items-center justify-center text-[#D4AF37] transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
            <span className="sr-only">التالي</span>
          </button>

          {/* Testimonial Card */}
          <div className="overflow-hidden">
            <div
              className={`rounded-2xl p-8 md:p-12 bg-gradient-to-br from-[#1A1A2E]/80 to-[#0F0F1A]/80 border border-[#D4AF37]/20 transition-opacity duration-300 ${
                isTransitioning ? 'opacity-50' : 'opacity-100'
              }`}
            >
              {/* Quote Icon */}
              <div className="text-[#D4AF37]/30 mb-6">
                <Quote className="w-12 h-12" />
              </div>

              {/* Text */}
              <p className="text-xl md:text-2xl text-[#F5F5DC] leading-relaxed mb-8">
                "{currentTestimonial.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-[#D4AF37] to-[#C4A35A] rounded-full flex items-center justify-center text-[#1A1A2E] font-bold text-xl">
                  {currentTestimonial.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-[#F5F5DC]">
                    {currentTestimonial.name}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {currentTestimonial.role} • {currentTestimonial.company}
                  </p>
                </div>
                <div className="mr-auto flex gap-1" aria-label={`تقييم ${currentTestimonial.rating} من 5`}>
                  {[...Array(currentTestimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-[#D4AF37] fill-[#D4AF37]"
                      aria-hidden="true"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-3 mt-6" role="tablist" aria-label="اختيار الشهادة">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                role="tab"
                aria-selected={index === currentIndex}
                aria-label={`شهادة ${index + 1} من ${testimonials.length}`}
                className={`h-3 rounded-full transition-all ${
                  index === currentIndex
                    ? 'w-8 bg-[#D4AF37]'
                    : 'w-3 bg-[#D4AF37]/30 hover:bg-[#D4AF37]/50'
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