'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowRight, Loader2, Plus, X, Upload } from 'lucide-react'
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
import { categories, levels } from '@/lib/constants'

const courseSchema = z.object({
  title: z.string().min(3, 'العنوان مطلوب'),
  slug: z.string().min(3, 'الـ slug مطلوب').regex(/^[a-z0-9-]+$/, 'الـ slug يجب أن يحتوي على حروف صغيرة وأرقام وشرطات فقط'),
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

export default function NewCoursePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [whatYouLearn, setWhatYouLearn] = useState<string[]>([''])
  const [requirements, setRequirements] = useState<string[]>([''])
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)

  const supabase = createClient()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      level: 'beginner',
      price_iqd: 0,
      is_published: false,
      is_featured: false,
    },
  })

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
    setIsLoading(true)

    try {
      let thumbnail_url = null

      // Upload thumbnail if exists
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

      // Create course
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: course, error } = await (supabase as any)
        .from('courses')
        .insert({
          ...data,
          thumbnail_url,
          what_you_learn: whatYouLearn.filter((item) => item.trim()),
          requirements: requirements.filter((item) => item.trim()),
        })
        .select()
        .single()

      if (error) throw error

      toast.success('تم إنشاء الكورس بنجاح')
      router.push(`/admin/courses/${course.id}`)
    } catch (error: any) {
      toast.error(error.message || 'حدث خطأ')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/courses">
          <Button variant="ghost" size="icon">
            <ArrowRight className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">إضافة كورس جديد</h1>
          <p className="text-gray-500">أدخل بيانات الكورس</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
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
                  <p className="text-sm text-red-500">{errors.title.message}</p>
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
                  <p className="text-sm text-red-500">{errors.slug.message}</p>
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
                <Select onValueChange={(value) => setValue('category', value)}>
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
                  <p className="text-sm text-red-500">{errors.category.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>المستوى *</Label>
                <Select
                  defaultValue="beginner"
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

        {/* Pricing */}
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
                  <p className="text-sm text-red-500">{errors.price_iqd.message}</p>
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
                    updateListItem(whatYouLearn, setWhatYouLearn, index, e.target.value)
                  }
                  placeholder={`النقطة ${index + 1}`}
                />
                {whatYouLearn.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeListItem(whatYouLearn, setWhatYouLearn, index)}
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
                    updateListItem(requirements, setRequirements, index, e.target.value)
                  }
                  placeholder={`المتطلب ${index + 1}`}
                />
                {requirements.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeListItem(requirements, setRequirements, index)}
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

        {/* Settings */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">الإعدادات</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>منشور</Label>
                <p className="text-sm text-gray-500">إظهار الكورس للزوار</p>
              </div>
              <Switch
                checked={watch('is_published')}
                onCheckedChange={(checked) => setValue('is_published', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>مميز</Label>
                <p className="text-sm text-gray-500">إظهار الكورس في القسم المميز</p>
              </div>
              <Switch
                checked={watch('is_featured')}
                onCheckedChange={(checked) => setValue('is_featured', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading} className="min-w-32">
            {isLoading ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              'حفظ الكورس'
            )}
          </Button>
          <Link href="/admin/courses">
            <Button type="button" variant="outline">
              إلغاء
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
