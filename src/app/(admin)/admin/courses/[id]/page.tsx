'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  ArrowRight,
  Loader2,
  Plus,
  X,
  Upload,
  Save,
  BookOpen,
  Award,
} from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import SectionManager from '@/components/admin/SectionManager'
import { categories, levels } from '@/lib/constants'
import type { Course, Section, Lesson } from '@/types/database'

const courseSchema = z.object({
  title: z.string().min(3, 'العنوان مطلوب'),
  slug: z
    .string()
    .min(3, 'الـ slug مطلوب')
    .regex(
      /^[a-z0-9-]+$/,
      'الـ slug يجب أن يحتوي على حروف صغيرة وأرقام وشرطات فقط'
    ),
  description: z.string().optional(),
  short_description: z.string().optional(),
  category: z.string().min(1, 'التصنيف مطلوب'),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  price_iqd: z.number().min(0, 'السعر مطلوب'),
  discount_price_iqd: z.number().optional().nullable(),
  is_published: z.boolean(),
  is_featured: z.boolean(),
})

type CourseFormData = z.infer<typeof courseSchema>

interface SectionWithLessons extends Section {
  lessons: Lesson[]
}

export default function EditCoursePage() {
  const router = useRouter()
  const params = useParams()
  const courseId = params.id as string

  const [course, setCourse] = useState<Course | null>(null)
  const [sections, setSections] = useState<SectionWithLessons[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [whatYouLearn, setWhatYouLearn] = useState<string[]>([''])
  const [requirements, setRequirements] = useState<string[]>([''])
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [certificateProvider, setCertificateProvider] = useState<string>('')
  const [certificateName, setCertificateName] = useState<string>('')
  const [certificateUrl, setCertificateUrl] = useState<string>('')

  const supabase = createClient()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
  })

  useEffect(() => {
    fetchCourse()
  }, [courseId])

  const fetchCourse = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('courses')
      .select(
        `
        *,
        sections(
          *,
          lessons(*)
        )
      `
      )
      .eq('id', courseId)
      .single()

    if (error || !data) {
      toast.error('الكورس غير موجود')
      router.push('/admin/courses')
      return
    }

    setCourse(data as Course)

    // Sort sections and lessons by sort_order
    const sortedSections = ((data as any).sections || [])
      .sort((a: Section, b: Section) => a.sort_order - b.sort_order)
      .map((section: SectionWithLessons) => ({
        ...section,
        lessons: (section.lessons || []).sort(
          (a: Lesson, b: Lesson) => a.sort_order - b.sort_order
        ),
      }))

    setSections(sortedSections)

    // Set form values
    reset({
      title: data.title,
      slug: data.slug,
      description: data.description || '',
      short_description: data.short_description || '',
      category: data.category || '',
      level: data.level,
      price_iqd: data.price_iqd,
      discount_price_iqd: data.discount_price_iqd,
      is_published: data.is_published,
      is_featured: data.is_featured,
    })

    setWhatYouLearn(
      data.what_you_learn?.length ? data.what_you_learn : ['']
    )
    setRequirements(data.requirements?.length ? data.requirements : [''])
    setThumbnailPreview(data.thumbnail_url)
    setCertificateProvider(data.certificate_provider || '')
    setCertificateName(data.certificate_name || '')
    setCertificateUrl(data.certificate_url || '')

    setIsLoading(false)
  }

  const updateCourseStats = async () => {
    // Calculate total lessons and duration from sections state
    let totalLessons = 0
    let totalDuration = 0

    sections.forEach((section) => {
      section.lessons?.forEach((lesson) => {
        if (lesson.is_published) {
          totalLessons++
          totalDuration += lesson.duration_seconds
        }
      })
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('courses')
      .update({
        lessons_count: totalLessons,
        duration_minutes: Math.ceil(totalDuration / 60),
      })
      .eq('id', courseId)
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setThumbnailFile(file)
      setThumbnailPreview(URL.createObjectURL(file))
    }
  }

  const addListItem = (list: string[], setList: (val: string[]) => void) => {
    setList([...list, ''])
  }

  const removeListItem = (
    list: string[],
    setList: (val: string[]) => void,
    index: number
  ) => {
    setList(list.filter((_, i) => i !== index))
  }

  const updateListItem = (
    list: string[],
    setList: (val: string[]) => void,
    index: number,
    value: string
  ) => {
    const newList = [...list]
    newList[index] = value
    setList(newList)
  }

  const onSubmit = async (data: CourseFormData) => {
    setIsSaving(true)

    try {
      let thumbnail_url = course?.thumbnail_url || null

      // Upload new thumbnail if exists
      if (thumbnailFile) {
        const fileExt = thumbnailFile.name.split('.').pop()
        const fileName = `${data.slug}-${Date.now()}.${fileExt}`
        const filePath = `courses/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('thumbnails')
          .upload(filePath, thumbnailFile)

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from('thumbnails')
          .getPublicUrl(filePath)

        thumbnail_url = urlData.publicUrl
      }

      // Update course
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('courses')
        .update({
          ...data,
          thumbnail_url,
          what_you_learn: whatYouLearn.filter((item) => item.trim()),
          requirements: requirements.filter((item) => item.trim()),
          certificate_provider: certificateProvider || null,
          certificate_name: certificateName || null,
          certificate_url: certificateUrl || null,
        })
        .eq('id', courseId)

      if (error) throw error

      // Update stats
      await updateCourseStats()

      toast.success('تم حفظ التغييرات')
    } catch (error: any) {
      toast.error(error.message || 'حدث خطأ')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">جاري تحميل بيانات الكورس...</p>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 mb-4">الكورس غير موجود</p>
        <Link href="/admin/courses">
          <Button variant="outline">العودة للقائمة</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/courses">
            <Button variant="ghost" size="icon">
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">تعديل الكورس</h1>
            <p className="text-gray-500">{course.title}</p>
          </div>
        </div>
        <Button onClick={handleSubmit(onSubmit)} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 ml-2 animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 ml-2" />
              حفظ التغييرات
            </>
          )}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="basic">المعلومات الأساسية</TabsTrigger>
          <TabsTrigger value="pricing">التسعير</TabsTrigger>
          <TabsTrigger value="content">المحتوى</TabsTrigger>
          <TabsTrigger value="settings">الإعدادات</TabsTrigger>
        </TabsList>

        {/* Basic Info Tab */}
        <TabsContent value="basic" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">المعلومات الأساسية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>العنوان *</Label>
                  <Input
                    {...register('title')}
                    onChange={(e) => {
                      register('title').onChange(e)
                      setValue('slug', generateSlug(e.target.value))
                    }}
                    placeholder="مثال: كورس التسويق الرقمي"
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500">
                      {errors.title.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Slug *</Label>
                  <Input
                    {...register('slug')}
                    placeholder="course-slug"
                    dir="ltr"
                  />
                  {errors.slug && (
                    <p className="text-sm text-red-500">
                      {errors.slug.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>وصف مختصر</Label>
                <Textarea
                  {...register('short_description')}
                  placeholder="وصف مختصر يظهر في البطاقة"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>الوصف الكامل</Label>
                <Textarea
                  {...register('description')}
                  placeholder="وصف تفصيلي للكورس"
                  rows={4}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>التصنيف *</Label>
                  <Select
                    value={watch('category')}
                    onValueChange={(value) => setValue('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر التصنيف" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-red-500">
                      {errors.category.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>المستوى *</Label>
                  <Select
                    value={watch('level')}
                    onValueChange={(value: any) => setValue('level', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map((lvl) => (
                        <SelectItem key={lvl.value} value={lvl.value}>
                          {lvl.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing Tab */}
        <TabsContent value="pricing" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">التسعير</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>السعر (د.ع) *</Label>
                  <Input
                    type="number"
                    {...register('price_iqd', { valueAsNumber: true })}
                    placeholder="0"
                  />
                  {errors.price_iqd && (
                    <p className="text-sm text-red-500">
                      {errors.price_iqd.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>سعر الخصم (د.ع)</Label>
                  <Input
                    type="number"
                    {...register('discount_price_iqd', { valueAsNumber: true })}
                    placeholder="اختياري"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">محتوى الكورس</CardTitle>
              <p className="text-sm text-gray-500">
                {sections.reduce((sum, s) => sum + (s.lessons?.length || 0), 0)}{' '}
                درس في {sections.length} قسم
              </p>
            </CardHeader>
            <CardContent>
              <SectionManager
                courseId={courseId}
                sections={sections}
                onSectionsChange={setSections}
                onStatsUpdate={updateCourseStats}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          {/* Thumbnail */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">صورة الكورس</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                {thumbnailPreview ? (
                  <div className="relative w-40 h-24 rounded-lg overflow-hidden">
                    <img
                      src={thumbnailPreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setThumbnailFile(null)
                        setThumbnailPreview(null)
                      }}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <label className="w-40 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                    <Upload className="h-6 w-6 text-gray-400" />
                    <span className="text-xs text-gray-400 mt-1">رفع صورة</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </CardContent>
          </Card>

          {/* What You'll Learn */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">ماذا ستتعلم</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {whatYouLearn.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={item}
                    onChange={(e) =>
                      updateListItem(
                        whatYouLearn,
                        setWhatYouLearn,
                        index,
                        e.target.value
                      )
                    }
                    placeholder={`النقطة ${index + 1}`}
                  />
                  {whatYouLearn.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        removeListItem(whatYouLearn, setWhatYouLearn, index)
                      }
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addListItem(whatYouLearn, setWhatYouLearn)}
              >
                <Plus className="h-4 w-4 ml-1" />
                إضافة نقطة
              </Button>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">المتطلبات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {requirements.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={item}
                    onChange={(e) =>
                      updateListItem(
                        requirements,
                        setRequirements,
                        index,
                        e.target.value
                      )
                    }
                    placeholder={`المتطلب ${index + 1}`}
                  />
                  {requirements.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        removeListItem(requirements, setRequirements, index)
                      }
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addListItem(requirements, setRequirements)}
              >
                <Plus className="h-4 w-4 ml-1" />
                إضافة متطلب
              </Button>
            </CardContent>
          </Card>

          {/* Certificate Settings */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                الشهادة المعترف بها
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>مزود الشهادة</Label>
                  <Select
                    value={certificateProvider}
                    onValueChange={setCertificateProvider}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المزود" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Google">Google</SelectItem>
                      <SelectItem value="Meta">Meta (Facebook)</SelectItem>
                      <SelectItem value="LinkedIn">LinkedIn Learning</SelectItem>
                      <SelectItem value="HubSpot">HubSpot</SelectItem>
                      <SelectItem value="IBM">IBM</SelectItem>
                      <SelectItem value="CompTIA">CompTIA</SelectItem>
                      <SelectItem value="Microsoft">Microsoft</SelectItem>
                      <SelectItem value="AWS">Amazon AWS</SelectItem>
                      <SelectItem value="Coursera">Coursera</SelectItem>
                      <SelectItem value="Udemy">Udemy</SelectItem>
                      <SelectItem value="S7EE7">S7EE7 Academy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>اسم الشهادة</Label>
                  <Input
                    value={certificateName}
                    onChange={(e) => setCertificateName(e.target.value)}
                    placeholder="مثال: Google Ads Certification"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>رابط الشهادة</Label>
                <Input
                  type="url"
                  value={certificateUrl}
                  onChange={(e) => setCertificateUrl(e.target.value)}
                  placeholder="https://..."
                  dir="ltr"
                />
              </div>
            </CardContent>
          </Card>

          {/* Publish Settings */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">إعدادات النشر</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label>منشور</Label>
                  <p className="text-sm text-gray-500">إظهار الكورس للزوار</p>
                </div>
                <Switch
                  checked={watch('is_published')}
                  onCheckedChange={(checked) =>
                    setValue('is_published', checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label>مميز</Label>
                  <p className="text-sm text-gray-500">
                    إظهار الكورس في القسم المميز
                  </p>
                </div>
                <Switch
                  checked={watch('is_featured')}
                  onCheckedChange={(checked) =>
                    setValue('is_featured', checked)
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
