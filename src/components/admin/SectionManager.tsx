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
  ChevronDown,
  ChevronUp,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  FolderOpen,
} from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import LessonManager from './LessonManager'
import type { Section, Lesson } from '@/types/database'

interface SectionWithLessons extends Section {
  lessons: Lesson[]
}

interface SectionManagerProps {
  courseId: string
  sections: SectionWithLessons[]
  onSectionsChange: (sections: SectionWithLessons[]) => void
  onStatsUpdate: () => void
}

interface SortableSectionProps {
  section: SectionWithLessons
  index: number
  isExpanded: boolean
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
  onLessonsChange: (lessons: Lesson[]) => void
  onStatsUpdate: () => void
}

function SortableSection({
  section,
  index,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
  onLessonsChange,
  onStatsUpdate,
}: SortableSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border rounded-lg overflow-hidden"
    >
      <Collapsible open={isExpanded} onOpenChange={onToggle}>
        <div className="flex items-center gap-3 p-4 bg-gray-50">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab text-gray-400 hover:text-gray-600"
          >
            <GripVertical className="h-5 w-5" />
          </button>

          <CollapsibleTrigger asChild>
            <button className="flex items-center gap-2 flex-1 text-right">
              {isExpanded ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    القسم {index + 1}:
                  </span>
                  <span className="font-semibold">{section.title}</span>
                </div>
                {section.description && (
                  <p className="text-sm text-gray-500 mt-0.5">
                    {section.description}
                  </p>
                )}
              </div>
            </button>
          </CollapsibleTrigger>

          <Badge variant="secondary" className="flex-shrink-0">
            {section.lessons?.length || 0} درس
          </Badge>

          <div className="flex items-center gap-1">
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

        <CollapsibleContent>
          <div className="p-4 border-t bg-gray-25">
            <LessonManager
              sectionId={section.id}
              courseId={section.course_id}
              lessons={section.lessons || []}
              onLessonsChange={onLessonsChange}
              onStatsUpdate={onStatsUpdate}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

interface SectionFormData {
  title: string
  description: string
}

const defaultFormData: SectionFormData = {
  title: '',
  description: '',
}

export default function SectionManager({
  courseId,
  sections,
  onSectionsChange,
  onStatsUpdate,
}: SectionManagerProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  )
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSection, setEditingSection] = useState<Section | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [formData, setFormData] = useState<SectionFormData>(defaultFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const supabase = createClient()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(sectionId)) {
        next.delete(sectionId)
      } else {
        next.add(sectionId)
      }
      return next
    })
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id)
      const newIndex = sections.findIndex((s) => s.id === over?.id)
      const newSections = arrayMove(sections, oldIndex, newIndex)

      // Update local state
      onSectionsChange(newSections)

      // Update sort_order in database
      const updates = newSections.map((section, index) => ({
        id: section.id,
        sort_order: index + 1,
      }))

      for (const update of updates) {
        await supabase
          .from('sections')
          .update({ sort_order: update.sort_order })
          .eq('id', update.id)
      }
    }
  }

  const openAddDialog = () => {
    setEditingSection(null)
    setFormData(defaultFormData)
    setIsDialogOpen(true)
  }

  const openEditDialog = (section: Section) => {
    setEditingSection(section)
    setFormData({
      title: section.title,
      description: section.description || '',
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error('عنوان القسم مطلوب')
      return
    }

    setIsSubmitting(true)

    try {
      const sectionData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
      }

      if (editingSection) {
        // Update existing section
        const { data, error } = await supabase
          .from('sections')
          .update(sectionData)
          .eq('id', editingSection.id)
          .select()
          .single()

        if (error) throw error

        onSectionsChange(
          sections.map((s) =>
            s.id === editingSection.id
              ? { ...s, ...data }
              : s
          )
        )
        toast.success('تم تحديث القسم')
      } else {
        // Create new section
        const nextSortOrder = sections.length + 1

        const { data, error } = await supabase
          .from('sections')
          .insert({
            ...sectionData,
            course_id: courseId,
            sort_order: nextSortOrder,
          })
          .select()
          .single()

        if (error) throw error

        onSectionsChange([...sections, { ...data, lessons: [] }])
        toast.success('تم إضافة القسم')

        // Expand the new section
        setExpandedSections((prev) => new Set([...Array.from(prev), data.id]))
      }

      setIsDialogOpen(false)
    } catch (error: any) {
      toast.error(error.message || 'حدث خطأ')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      // Delete section (lessons will be deleted by CASCADE)
      const { error } = await supabase
        .from('sections')
        .delete()
        .eq('id', deleteId)

      if (error) throw error

      onSectionsChange(sections.filter((s) => s.id !== deleteId))
      toast.success('تم حذف القسم')
      onStatsUpdate()
    } catch (error: any) {
      toast.error(error.message || 'حدث خطأ')
    } finally {
      setDeleteId(null)
    }
  }

  const handleLessonsChange = (sectionId: string, lessons: Lesson[]) => {
    onSectionsChange(
      sections.map((s) =>
        s.id === sectionId ? { ...s, lessons } : s
      )
    )
  }

  return (
    <div className="space-y-4">
      {sections.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
          <FolderOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">لا توجد أقسام بعد</p>
          <Button onClick={openAddDialog}>
            <Plus className="h-4 w-4 ml-2" />
            إضافة قسم
          </Button>
        </div>
      ) : (
        <>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sections.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {sections.map((section, index) => (
                  <SortableSection
                    key={section.id}
                    section={section}
                    index={index}
                    isExpanded={expandedSections.has(section.id)}
                    onToggle={() => toggleSection(section.id)}
                    onEdit={() => openEditDialog(section)}
                    onDelete={() => setDeleteId(section.id)}
                    onLessonsChange={(lessons) =>
                      handleLessonsChange(section.id, lessons)
                    }
                    onStatsUpdate={onStatsUpdate}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <Button variant="outline" onClick={openAddDialog} className="w-full">
            <Plus className="h-4 w-4 ml-2" />
            إضافة قسم جديد
          </Button>
        </>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingSection ? 'تعديل القسم' : 'إضافة قسم جديد'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>عنوان القسم *</Label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="مثال: المقدمة"
              />
            </div>

            <div className="space-y-2">
              <Label>الوصف</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="وصف مختصر للقسم (اختياري)"
                rows={2}
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
              ) : editingSection ? (
                'حفظ التغييرات'
              ) : (
                'إضافة القسم'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف القسم</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا القسم؟ سيتم حذف جميع الدروس المرتبطة به
              نهائياً.
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
