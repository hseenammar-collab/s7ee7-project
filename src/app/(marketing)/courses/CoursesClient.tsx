'use client'

import { useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import {
  Search,
  X,
  BookOpen,
  SlidersHorizontal,
  Star,
  Users,
  Clock,
  Play,
  ChevronLeft,
  Filter,
  GraduationCap,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  formatPrice,
  formatDuration,
  getLevelLabel,
  getCategoryLabel,
} from '@/lib/constants'

// Type for course with details
interface CourseWithDetails {
  id: string
  title: string
  slug: string
  description: string | null
  short_description: string | null
  thumbnail_url: string | null
  preview_video_url: string | null
  price_iqd: number
  discount_price_iqd: number | null
  category: string | null
  level: 'beginner' | 'intermediate' | 'advanced'
  language: string
  duration_minutes: number
  lessons_count: number
  students_count: number
  average_rating: number
  is_published: boolean
  is_featured: boolean
  requirements: string[]
  what_you_learn: string[]
  created_at: string
  updated_at: string
  instructor: {
    id: string
    full_name: string
    avatar_url: string | null
    bio: string | null
  } | null
}

interface Category {
  id: string
  name: string
  slug: string
  icon: string
  courses_count: number
}

interface Stats {
  coursesCount: number
  studentsCount: number
  lessonsCount: number
}

interface CoursesClientProps {
  initialCourses: CourseWithDetails[]
  categories: Category[]
  stats: Stats
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export default function CoursesClient({
  initialCourses,
  categories,
  stats,
}: CoursesClientProps) {
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('category') || 'all'
  )
  const [selectedLevel, setSelectedLevel] = useState('all')
  const [sortBy, setSortBy] = useState('featured')

  // Filter and sort courses
  const filteredCourses = useMemo(() => {
    let result = [...initialCourses]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (course) =>
          course.title.toLowerCase().includes(query) ||
          course.description?.toLowerCase().includes(query) ||
          course.short_description?.toLowerCase().includes(query)
      )
    }

    // Category filter
    if (selectedCategory && selectedCategory !== 'all') {
      result = result.filter((course) => course.category === selectedCategory)
    }

    // Level filter
    if (selectedLevel && selectedLevel !== 'all') {
      result = result.filter((course) => course.level === selectedLevel)
    }

    // Sort
    switch (sortBy) {
      case 'featured':
        result.sort((a, b) => {
          if (a.is_featured && !b.is_featured) return -1
          if (!a.is_featured && b.is_featured) return 1
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        })
        break
      case 'newest':
        result.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        break
      case 'price-low':
        result.sort((a, b) => a.price_iqd - b.price_iqd)
        break
      case 'price-high':
        result.sort((a, b) => b.price_iqd - a.price_iqd)
        break
      case 'rating':
        result.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0))
        break
      case 'popular':
        result.sort((a, b) => (b.students_count || 0) - (a.students_count || 0))
        break
    }

    return result
  }, [initialCourses, searchQuery, selectedCategory, selectedLevel, sortBy])

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setSelectedLevel('all')
    setSortBy('featured')
  }

  const hasActiveFilters =
    searchQuery ||
    selectedCategory !== 'all' ||
    selectedLevel !== 'all' ||
    sortBy !== 'featured'

  const levels = [
    { value: 'beginner', label: 'مبتدئ' },
    { value: 'intermediate', label: 'متوسط' },
    { value: 'advanced', label: 'متقدم' },
  ]

  // Filter controls component
  const FilterControls = () => (
    <div className="space-y-4">
      {/* Category */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">التصنيف</label>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="bg-white/5 border-white/10 text-white">
            <SelectValue placeholder="جميع التصنيفات" />
          </SelectTrigger>
          <SelectContent className="bg-[#141414] border-white/10">
            <SelectItem value="all" className="text-white hover:bg-white/10">
              جميع التصنيفات
            </SelectItem>
            {categories.map((cat) => (
              <SelectItem
                key={cat.id}
                value={cat.id}
                className="text-white hover:bg-white/10"
              >
                {cat.icon} {cat.name} ({cat.courses_count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Level */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">المستوى</label>
        <Select value={selectedLevel} onValueChange={setSelectedLevel}>
          <SelectTrigger className="bg-white/5 border-white/10 text-white">
            <SelectValue placeholder="جميع المستويات" />
          </SelectTrigger>
          <SelectContent className="bg-[#141414] border-white/10">
            <SelectItem value="all" className="text-white hover:bg-white/10">
              جميع المستويات
            </SelectItem>
            {levels.map((level) => (
              <SelectItem
                key={level.value}
                value={level.value}
                className="text-white hover:bg-white/10"
              >
                {level.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sort */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">الترتيب</label>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="bg-white/5 border-white/10 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#141414] border-white/10">
            <SelectItem value="featured" className="text-white hover:bg-white/10">
              المميزة أولاً
            </SelectItem>
            <SelectItem value="newest" className="text-white hover:bg-white/10">
              الأحدث
            </SelectItem>
            <SelectItem value="price-low" className="text-white hover:bg-white/10">
              السعر: من الأقل
            </SelectItem>
            <SelectItem value="price-high" className="text-white hover:bg-white/10">
              السعر: من الأعلى
            </SelectItem>
            <SelectItem value="rating" className="text-white hover:bg-white/10">
              الأعلى تقييماً
            </SelectItem>
            <SelectItem value="popular" className="text-white hover:bg-white/10">
              الأكثر شعبية
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <Button
          variant="outline"
          className="w-full border-white/20 text-white hover:bg-white/10"
          onClick={clearFilters}
        >
          <X className="h-4 w-4 ml-2" />
          مسح الفلاتر
        </Button>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-16">
      {/* Background Effects */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-cyan-500 rounded-full filter blur-[200px] opacity-10 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-amber-500 rounded-full filter blur-[200px] opacity-5 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            استكشف الكورسات
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
            اكتشف مجموعة واسعة من الكورسات الاحترافية وابدأ رحلة التعلم
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-6">
            <div className="flex items-center gap-2 text-gray-400">
              <BookOpen className="w-5 h-5 text-cyan-400" />
              <span>{stats.coursesCount} كورس</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Play className="w-5 h-5 text-cyan-400" />
              <span>{stats.lessonsCount}+ درس</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Users className="w-5 h-5 text-cyan-400" />
              <span>{stats.studentsCount}+ طالب</span>
            </div>
          </div>
        </motion.div>

        {/* Category Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap justify-center gap-2 mb-8"
        >
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === 'all'
                ? 'bg-cyan-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
            }`}
          >
            الكل ({initialCourses.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat.id
                  ? 'bg-cyan-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
              }`}
            >
              {cat.icon} {cat.name} ({cat.courses_count})
            </button>
          ))}
        </motion.div>

        {/* Search and Filters Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="bg-[#141414] border border-white/10 rounded-2xl p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="ابحث عن كورس..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-500"
                />
              </div>

              {/* Desktop Filters */}
              <div className="hidden lg:flex items-center gap-3">
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger className="w-[140px] bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="المستوى" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#141414] border-white/10">
                    <SelectItem value="all" className="text-white hover:bg-white/10">
                      جميع المستويات
                    </SelectItem>
                    {levels.map((level) => (
                      <SelectItem
                        key={level.value}
                        value={level.value}
                        className="text-white hover:bg-white/10"
                      >
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[150px] bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="الترتيب" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#141414] border-white/10">
                    <SelectItem value="featured" className="text-white hover:bg-white/10">
                      المميزة أولاً
                    </SelectItem>
                    <SelectItem value="newest" className="text-white hover:bg-white/10">
                      الأحدث
                    </SelectItem>
                    <SelectItem value="price-low" className="text-white hover:bg-white/10">
                      السعر: من الأقل
                    </SelectItem>
                    <SelectItem value="price-high" className="text-white hover:bg-white/10">
                      السعر: من الأعلى
                    </SelectItem>
                    <SelectItem value="rating" className="text-white hover:bg-white/10">
                      الأعلى تقييماً
                    </SelectItem>
                    <SelectItem value="popular" className="text-white hover:bg-white/10">
                      الأكثر شعبية
                    </SelectItem>
                  </SelectContent>
                </Select>

                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearFilters}
                    className="text-gray-400 hover:text-white hover:bg-white/10"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                )}
              </div>

              {/* Mobile Filter Button */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    className="lg:hidden border-white/20 text-white hover:bg-white/10"
                  >
                    <SlidersHorizontal className="h-5 w-5 ml-2" />
                    الفلاتر
                    {hasActiveFilters && (
                      <span className="mr-2 w-2 h-2 bg-cyan-500 rounded-full" />
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-[#141414] border-white/10">
                  <SheetHeader>
                    <SheetTitle className="text-white">فلترة الكورسات</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterControls />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </motion.div>

        {/* Results Count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-between mb-6"
        >
          <p className="text-gray-400">
            عرض <span className="text-white font-semibold">{filteredCourses.length}</span>{' '}
            كورس
          </p>
        </motion.div>

        {/* Courses Grid */}
        <AnimatePresence mode="wait">
          {filteredCourses.length > 0 ? (
            <motion.div
              key="courses"
              variants={container}
              initial="hidden"
              animate="show"
              className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredCourses.map((course, index) => (
                <CourseCard key={course.id} course={course} index={index} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-20 bg-[#141414] border border-white/10 rounded-2xl"
            >
              <BookOpen className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">لا توجد كورسات</h3>
              <p className="text-gray-400 mb-6">لم نجد كورسات تطابق معايير البحث</p>
              <Button
                onClick={clearFilters}
                className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700"
              >
                مسح الفلاتر
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Course Card Component
function CourseCard({
  course,
  index,
}: {
  course: CourseWithDetails
  index: number
}) {
  const hasDiscount =
    course.discount_price_iqd && course.discount_price_iqd < course.price_iqd
  const isFree = course.price_iqd === 0

  return (
    <motion.div variants={item}>
      <Link href={`/courses/${course.slug}`}>
        <div className="group relative bg-[#141414] border border-white/10 rounded-2xl overflow-hidden hover:border-cyan-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/10">
          {/* Thumbnail */}
          <div className="relative aspect-video overflow-hidden">
            {course.thumbnail_url ? (
              <Image
                src={course.thumbnail_url}
                alt={course.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-cyan-600/20 via-cyan-500/10 to-amber-500/10 flex items-center justify-center">
                <GraduationCap className="h-12 w-12 text-white/30" />
              </div>
            )}

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />

            {/* Badges */}
            <div className="absolute top-3 right-3 flex flex-wrap gap-2">
              {course.is_featured && (
                <Badge className="bg-amber-500/90 text-white border-0 backdrop-blur-sm">
                  <Star className="h-3 w-3 ml-1 fill-current" />
                  مميز
                </Badge>
              )}
              {course.category && (
                <Badge className="bg-cyan-500/80 text-white border-0 backdrop-blur-sm">
                  {getCategoryLabel(course.category)}
                </Badge>
              )}
            </div>

            {/* Free Badge */}
            {isFree && (
              <div className="absolute top-3 left-3">
                <Badge className="bg-green-500/90 text-white border-0 backdrop-blur-sm">
                  مجاني
                </Badge>
              </div>
            )}

            {/* Play button on hover */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-14 h-14 bg-cyan-500/90 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Play className="w-6 h-6 text-white fill-white mr-[-2px]" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-5 space-y-4">
            {/* Title */}
            <h3 className="font-bold text-lg text-white line-clamp-2 group-hover:text-cyan-300 transition-colors min-h-[56px]">
              {course.title}
            </h3>

            {/* Instructor */}
            {course.instructor && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center">
                  <span className="text-xs text-white font-bold">
                    {course.instructor.full_name.charAt(0)}
                  </span>
                </div>
                <span className="text-sm text-gray-400">{course.instructor.full_name}</span>
              </div>
            )}

            {/* Meta */}
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                <span>{course.average_rating?.toFixed(1) || '0.0'}</span>
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                <span>{course.lessons_count} درس</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{formatDuration(course.duration_minutes)}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              {/* Price */}
              <div className="flex items-center gap-2">
                {isFree ? (
                  <span className="text-lg font-bold text-green-400">مجاني</span>
                ) : hasDiscount ? (
                  <>
                    <span className="text-lg font-bold text-cyan-400">
                      {formatPrice(course.discount_price_iqd!)} د.ع
                    </span>
                    <span className="text-sm text-gray-500 line-through">
                      {formatPrice(course.price_iqd)}
                    </span>
                  </>
                ) : (
                  <span className="text-lg font-bold text-cyan-400">
                    {formatPrice(course.price_iqd)} د.ع
                  </span>
                )}
              </div>

              {/* Level */}
              <Badge variant="outline" className="border-white/20 text-gray-400">
                {getLevelLabel(course.level)}
              </Badge>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
