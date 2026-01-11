// src/app/(admin)/admin/courses/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  MoreVertical,
  BookOpen,
  Users,
  Star,
  ChevronDown,
  ExternalLink,
  Filter,
  Grid,
  List,
} from 'lucide-react'

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════
interface Course {
  id: string
  title: string
  slug: string
  short_description: string
  thumbnail_url: string
  price_iqd: number
  discount_price_iqd: number
  category: string
  level: string
  lessons_count: number
  students_count: number
  average_rating: number
  is_published: boolean
  is_featured: boolean
  created_at: string
}

const categories = [
  { value: 'all', label: 'جميع الفئات' },
  { value: 'cybersecurity', label: 'الأمن السيبراني' },
  { value: 'programming', label: 'البرمجة' },
  { value: 'marketing', label: 'التسويق' },
  { value: 'networking', label: 'الشبكات' },
  { value: 'design', label: 'التصميم' },
  { value: 'app-development', label: 'تطوير التطبيقات' },
  { value: 'web-development', label: 'تطوير الويب' },
]

// ═══════════════════════════════════════════════════════════════
// COURSES PAGE
// ═══════════════════════════════════════════════════════════════
export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // ─────────────────────────────────────────────────────────────
  // FETCH COURSES
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchCourses = async () => {
      const supabase = createClient()

      let query = supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false })

      if (categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching courses:', error)
        toast.error('خطأ في جلب الكورسات')
      } else {
        setCourses(data || [])
      }

      setIsLoading(false)
    }

    fetchCourses()
  }, [categoryFilter])

  // ─────────────────────────────────────────────────────────────
  // FILTER COURSES
  // ─────────────────────────────────────────────────────────────
  const filteredCourses = courses.filter((course) => {
    if (!searchQuery) return true
    return course.title.toLowerCase().includes(searchQuery.toLowerCase())
  })

  // ─────────────────────────────────────────────────────────────
  // TOGGLE PUBLISH
  // ─────────────────────────────────────────────────────────────
  const togglePublish = async (courseId: string, currentStatus: boolean) => {
    const supabase = createClient()

    const { error } = await supabase
      .from('courses')
      .update({ is_published: !currentStatus })
      .eq('id', courseId)

    if (error) {
      toast.error('خطأ في تحديث الحالة')
    } else {
      setCourses(prev => prev.map(c => 
        c.id === courseId ? { ...c, is_published: !currentStatus } : c
      ))
      toast.success(currentStatus ? 'تم إلغاء النشر' : 'تم النشر بنجاح')
    }
  }

  // ─────────────────────────────────────────────────────────────
  // DELETE COURSE
  // ─────────────────────────────────────────────────────────────
  const deleteCourse = async (courseId: string) => {
    const supabase = createClient()

    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId)

    if (error) {
      toast.error('خطأ في حذف الكورس')
    } else {
      setCourses(prev => prev.filter(c => c.id !== courseId))
      toast.success('تم حذف الكورس')
    }
    
    setDeleteConfirm(null)
  }

  // ─────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-IQ').format(amount) + ' د.ع'
  }

  const getCategoryLabel = (category: string) => {
    return categories.find(c => c.value === category)?.label || category
  }

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6">
      {/* ─────────────────────────────────────────────────────────────
          PAGE HEADER
      ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">إدارة الكورسات</h1>
          <p className="text-gray-400 mt-1">{filteredCourses.length} كورس</p>
        </div>
        
        <Link
          href="/admin/courses/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-l from-cyan-500 to-cyan-400 text-black font-bold rounded-xl hover:opacity-90 transition-opacity"
        >
          <Plus className="w-5 h-5" />
          <span>إضافة كورس</span>
        </Link>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          FILTERS
      ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="بحث عن كورس..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pr-11 pl-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-11 px-4 pr-10 bg-white/5 border border-white/10 rounded-xl text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value} className="bg-[#111118]">
                {cat.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        {/* View Toggle */}
        <div className="flex bg-white/5 border border-white/10 rounded-xl p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-gray-400'}`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-gray-400'}`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          COURSES GRID/LIST
      ───────────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-[#111118] border border-white/10 rounded-2xl overflow-hidden animate-pulse">
              <div className="h-40 bg-white/10" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-white/10 rounded w-3/4" />
                <div className="h-4 bg-white/10 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="bg-[#111118] border border-white/10 rounded-2xl p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">لا توجد كورسات</h3>
          <p className="text-gray-400 mb-6">ابدأ بإضافة كورس جديد</p>
          <Link
            href="/admin/courses/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500 text-black font-bold rounded-xl"
          >
            <Plus className="w-5 h-5" />
            <span>إضافة كورس</span>
          </Link>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div 
              key={course.id}
              className="bg-[#111118] border border-white/10 rounded-2xl overflow-hidden group hover:border-white/20 transition-all"
            >
              {/* Thumbnail */}
              <div className="relative h-40 bg-white/5">
                {course.thumbnail_url ? (
                  <img 
                    src={course.thumbnail_url} 
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-gray-600" />
                  </div>
                )}
                
                {/* Status Badges */}
                <div className="absolute top-3 right-3 flex gap-2">
                  {!course.is_published && (
                    <span className="px-2 py-1 bg-yellow-500/90 text-yellow-900 text-xs font-bold rounded-lg">
                      مسودة
                    </span>
                  )}
                  {course.is_featured && (
                    <span className="px-2 py-1 bg-cyan-500/90 text-black text-xs font-bold rounded-lg">
                      مميز
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-cyan-400 bg-cyan-500/20 px-2 py-0.5 rounded">
                    {getCategoryLabel(course.category)}
                  </span>
                  <span className="text-xs text-gray-400">{course.level}</span>
                </div>

                <h3 className="font-bold mb-2 line-clamp-2">{course.title}</h3>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {course.students_count || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    {course.lessons_count || 0} درس
                  </span>
                  {course.average_rating > 0 && (
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400" />
                      {course.average_rating.toFixed(1)}
                    </span>
                  )}
                </div>

                {/* Price */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    {course.discount_price_iqd ? (
                      <>
                        <span className="text-lg font-bold text-cyan-400">
                          {formatCurrency(course.discount_price_iqd)}
                        </span>
                        <span className="text-sm text-gray-500 line-through mr-2">
                          {formatCurrency(course.price_iqd)}
                        </span>
                      </>
                    ) : (
                      <span className="text-lg font-bold text-cyan-400">
                        {formatCurrency(course.price_iqd)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-white/10">
                  <Link
                    href={`/admin/courses/${course.id}`}
                    className="flex-1 h-9 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="text-sm">تعديل</span>
                  </Link>
                  
                  <button
                    onClick={() => togglePublish(course.id, course.is_published)}
                    className={`h-9 px-3 flex items-center gap-2 rounded-lg transition-colors ${
                      course.is_published 
                        ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                        : 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                    }`}
                    title={course.is_published ? 'إلغاء النشر' : 'نشر'}
                  >
                    {course.is_published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  
                  <button
                    onClick={() => setDeleteConfirm(course.id)}
                    className="h-9 px-3 flex items-center gap-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-[#111118] border border-white/10 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-400">الكورس</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-400">الفئة</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-400">السعر</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-400">الطلاب</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-400">الحالة</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-400">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredCourses.map((course) => (
                <tr key={course.id} className="hover:bg-white/5">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-10 bg-white/10 rounded-lg overflow-hidden">
                        {course.thumbnail_url && (
                          <img src={course.thumbnail_url} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <span className="font-medium">{course.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-gray-400">{getCategoryLabel(course.category)}</td>
                  <td className="px-4 py-4 text-cyan-400 font-bold">{formatCurrency(course.discount_price_iqd || course.price_iqd)}</td>
                  <td className="px-4 py-4 text-gray-400">{course.students_count || 0}</td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${course.is_published ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {course.is_published ? 'منشور' : 'مسودة'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/courses/${course.id}`} className="p-2 hover:bg-white/10 rounded-lg">
                        <Edit className="w-4 h-4 text-gray-400" />
                      </Link>
                      <button onClick={() => setDeleteConfirm(course.id)} className="p-2 hover:bg-red-500/20 rounded-lg">
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          DELETE CONFIRMATION MODAL
      ───────────────────────────────────────────────────────────── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-[#111118] border border-white/10 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">تأكيد الحذف</h3>
            <p className="text-gray-400 mb-6">هل أنت متأكد من حذف هذا الكورس؟ لا يمكن التراجع عن هذا الإجراء.</p>
            <div className="flex gap-3">
              <button
                onClick={() => deleteCourse(deleteConfirm)}
                className="flex-1 h-11 bg-red-500 hover:bg-red-400 text-white font-bold rounded-xl transition-colors"
              >
                حذف
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 h-11 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
