'use client'

import { useState } from 'react'
import { PlayCircle, Lock, Clock, ChevronDown } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { formatSeconds } from '@/lib/constants'
import type { Section, Lesson } from '@/types/database'

interface SectionWithLessons extends Section {
  lessons: Lesson[]
}

interface CourseContentProps {
  sections: SectionWithLessons[]
  totalLessons: number
  totalDuration: number
}

export default function CourseContent({
  sections,
  totalLessons,
  totalDuration,
}: CourseContentProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(
    sections.length > 0 ? [sections[0].id] : []
  )

  const formatTotalDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins} دقيقة`
    if (mins === 0) return `${hours} ساعة`
    return `${hours} ساعة و ${mins} دقيقة`
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
        <span>{sections.length} أقسام</span>
        <span>{totalLessons} درس</span>
        <span>{formatTotalDuration(totalDuration)}</span>
      </div>

      {/* Sections Accordion */}
      <Accordion
        type="multiple"
        value={expandedSections}
        onValueChange={setExpandedSections}
        className="space-y-2"
      >
        {sections
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((section, sectionIndex) => {
            const sectionDuration = section.lessons.reduce(
              (acc, lesson) => acc + lesson.duration_seconds,
              0
            )

            return (
              <AccordionItem
                key={section.id}
                value={section.id}
                className="border rounded-lg overflow-hidden"
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-gray-50">
                  <div className="flex items-center gap-3 text-right w-full">
                    <span className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium text-primary flex-shrink-0">
                      {sectionIndex + 1}
                    </span>
                    <div className="flex-1">
                      <h4 className="font-medium text-right">{section.title}</h4>
                      <p className="text-sm text-gray-500">
                        {section.lessons.length} درس •{' '}
                        {Math.round(sectionDuration / 60)} دقيقة
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-0">
                  <div className="divide-y divide-gray-100">
                    {section.lessons
                      .sort((a, b) => a.sort_order - b.sort_order)
                      .map((lesson, lessonIndex) => (
                        <div
                          key={lesson.id}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                        >
                          {lesson.is_free ? (
                            <PlayCircle className="h-5 w-5 text-primary flex-shrink-0" />
                          ) : (
                            <Lock className="h-5 w-5 text-gray-400 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">
                                {sectionIndex + 1}.{lessonIndex + 1}
                              </span>
                              <span className="truncate">{lesson.title}</span>
                              {lesson.is_free && (
                                <Badge variant="secondary" className="text-xs">
                                  مجاني
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-500 flex-shrink-0">
                            <Clock className="h-4 w-4" />
                            <span>{formatSeconds(lesson.duration_seconds)}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )
          })}
      </Accordion>
    </div>
  )
}
