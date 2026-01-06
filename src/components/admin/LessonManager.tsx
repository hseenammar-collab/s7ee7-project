'use client'

import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  GripVertical,
  Video,
  Plus,
  Pencil,
  Trash2,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { formatDuration } from '@/lib/constants'
import type { Lesson } from '@/types/database'

interface LessonManagerProps {
  sectionId: string
  courseId: string
  lessons: Lesson[]
  onLessonsChange: (lessons: Lesson[]) => void
  onStatsUpdate: () => void
}

interface SortableLessonProps {
  lesson: Lesson
  onEdit: () => void
  onDelete: () => void
}

function SortableLesson({ lesson, onEdit, onDelete }: SortableLessonProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-white border rounded-lg group"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab text-gray-400 hover:text-gray-600"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <Video className="h-4 w-4 text-gray-400 flex-shrink-0" />

      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{lesson.title}</p>
        <p className="text-sm text-gray-500">
          {formatDuration(lesson.duration_seconds)}
        </p>
      </div>

      {lesson.is_free && (
        <Badge variant="secondary" className="text-xs">
          مجاني
        </Badge>
      )}

      {!lesson.is_published && (
        <Badge variant="outline" className="text-xs text-yellow-600">
          مسودة
        </Badge>
      )}

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" onClick={onEdit}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-red-600"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

interface LessonFormData {
  title: string
  description: string
  duration_minutes: number
  video_url: string
  video_id: string
  is_free: boolean
  is_published: boolean
}

const defaultFormData: LessonFormData = {
  title: '',
  description: '',
  duration_minutes: 0,
  video_url: '',
  video_id: '',
  is_free: false,
  is_published: true,
}

export default function LessonManager({
  sectionId,
  courseId,
  lessons,
  onLessonsChange,
  onStatsUpdate,
}: LessonManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [formData, setFormData] = useState<LessonFormData>(defaultFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const supabase = createClient()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = lessons.findIndex((l) => l.id === active.id)
      const newIndex = lessons.findIndex((l) => l.id === over?.id)
      const newLessons = arrayMove(lessons, oldIndex, newIndex)

      // Update local state
      onLessonsChange(newLessons)

      // Update sort_order in database
      const updates = newLessons.map((lesson, index) => ({
        id: lesson.id,
        sort_order: index + 1,
      }))

      for (const update of updates) {
        await supabase
          .from('lessons')
          .update({ sort_order: update.sort_order })
          .eq('id', update.id)
      }
    }
  }

  const openAddDialog = () => {
    setEditingLesson(null)
    setFormData(defaultFormData)
    setIsDialogOpen(true)
  }

  const openEditDialog = (lesson: Lesson) => {
    setEditingLesson(lesson)
    setFormData({
      title: lesson.title,
      description: lesson.description || '',
      duration_minutes: Math.floor(lesson.duration_seconds / 60),
      video_url: lesson.video_url || '',
      video_id: lesson.video_id || '',
      is_free: lesson.is_free,
      is_published: lesson.is_published,
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error('عنوان الدرس مطلوب')
      return
    }

    if (!formData.duration_minutes || formData.duration_minutes <= 0) {
      toast.error('مدة الدرس مطلوبة')
      return
    }

    setIsSubmitting(true)

    try {
      const lessonData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        duration_seconds: formData.duration_minutes * 60,
        video_url: formData.video_url.trim() || null,
        video_id: formData.video_id.trim() || null,
        is_free: formData.is_free,
        is_published: formData.is_published,
      }

      if (editingLesson) {
        // Update existing lesson
        const { data, error } = await supabase
          .from('lessons')
          .update(lessonData)
          .eq('id', editingLesson.id)
          .select()
          .single()

        if (error) throw error

        onLessonsChange(
          lessons.map((l) => (l.id === editingLesson.id ? data : l))
        )
        toast.success('تم تحديث الدرس')
      } else {
        // Create new lesson
        const nextSortOrder = lessons.length + 1

        const { data, error } = await supabase
          .from('lessons')
          .insert({
            ...lessonData,
            section_id: sectionId,
            course_id: courseId,
            sort_order: nextSortOrder,
          })
          .select()
          .single()

        if (error) throw error

        onLessonsChange([...lessons, data])
        toast.success('تم إضافة الدرس')
      }

      setIsDialogOpen(false)
      onStatsUpdate()
    } catch (error: any) {
      toast.error(error.message || 'حدث خطأ')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', deleteId)

      if (error) throw error

      onLessonsChange(lessons.filter((l) => l.id !== deleteId))
      toast.success('تم حذف الدرس')
      onStatsUpdate()
    } catch (error: any) {
      toast.error(error.message || 'حدث خطأ')
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <div className="space-y-2">
      {lessons.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={lessons.map((l) => l.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {lessons.map((lesson) => (
                <SortableLesson
                  key={lesson.id}
                  lesson={lesson}
                  onEdit={() => openEditDialog(lesson)}
                  onDelete={() => setDeleteId(lesson.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={openAddDialog}
        className="w-full border-2 border-dashed"
      >
        <Plus className="h-4 w-4 ml-1" />
        إضافة درس
      </Button>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingLesson ? 'تعديل الدرس' : 'إضافة درس جديد'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>عنوان الدرس *</Label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="مثال: مقدمة في التسويق"
              />
            </div>

            <div className="space-y-2">
              <Label>الوصف</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="وصف مختصر للدرس"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>المدة بالدقائق *</Label>
              <Input
                type="number"
                min="1"
                value={formData.duration_minutes || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    duration_minutes: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="10"
              />
            </div>

            <div className="space-y-2">
              <Label>رابط الفيديو</Label>
              <Input
                value={formData.video_url}
                onChange={(e) =>
                  setFormData({ ...formData, video_url: e.target.value })
                }
                placeholder="https://..."
                dir="ltr"
              />
            </div>

            <div className="space-y-2">
              <Label>Video ID (Bunny/Vimeo)</Label>
              <Input
                value={formData.video_id}
                onChange={(e) =>
                  setFormData({ ...formData, video_id: e.target.value })
                }
                placeholder="abc123..."
                dir="ltr"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <Label>درس مجاني</Label>
                <p className="text-xs text-gray-500">متاح للمعاينة</p>
              </div>
              <Switch
                checked={formData.is_free}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_free: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <Label>منشور</Label>
                <p className="text-xs text-gray-500">إظهار الدرس للطلاب</p>
              </div>
              <Switch
                checked={formData.is_published}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_published: checked })
                }
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  جاري الحفظ...
                </>
              ) : editingLesson ? (
                'حفظ التغييرات'
              ) : (
                'إضافة الدرس'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الدرس</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا الدرس؟ سيتم حذف جميع بيانات التقدم المرتبطة
              به.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
