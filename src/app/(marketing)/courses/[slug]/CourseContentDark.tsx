'use client'

import { useState } from 'react'
import { PlayCircle, Lock, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatSeconds } from '@/lib/constants'
import type { Section, Lesson } from '@/types/database'

interface SectionWithLessons extends Section {
  lessons: Lesson[]
}

interface CourseContentDarkProps {
  sections: SectionWithLessons[]
  totalLessons: number
  totalDuration: number
}

export default function CourseContentDark({
  sections,
  totalLessons,
  totalDuration,
}: CourseContentDarkProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(
    sections.length > 0 ? [sections[0].id] : []
  )

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  const formatTotalDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins} دقيقة`
    if (mins === 0) return `${hours} ساعة`
    return `${hours} ساعة و ${mins} دقيقة`
  }

  const freeLessonsCount = sections.reduce(
    (acc, section) => acc + section.lessons.filter((l) => l.is_free).length,
    0
  )

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white/5 border border-white/10 rounded-xl p-4 text-sm">
        <div className="flex items-center gap-6 text-gray-400">
          <span className="flex items-center gap-2">
            <span className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center text-cyan-400 font-bold">
              {sections.length}
            </span>
            أقسام
          </span>
          <span className="flex items-center gap-2">
            <span className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center text-cyan-400 font-bold">
              {totalLessons}
            </span>
            درس
          </span>
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-cyan-400" />
            {formatTotalDuration(totalDuration)}
          </span>
        </div>
        {freeLessonsCount > 0 && (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            {freeLessonsCount} دروس مجانية
          </Badge>
        )}
      </div>

      {/* Sections Accordion */}
      <div className="space-y-3">
        {sections
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((section, sectionIndex) => {
            const isExpanded = expandedSections.includes(section.id)
            const sectionDuration = section.lessons.reduce(
              (acc, lesson) => acc + lesson.duration_seconds,
              0
            )
            const freeLessons = section.lessons.filter((l) => l.is_free).length

            return (
              <div
                key={section.id}
                className="bg-white/5 border border-white/10 rounded-xl overflow-hidden"
              >
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full px-5 py-4 flex items-center gap-4 hover:bg-white/5 transition-colors"
                >
                  <span className="w-10 h-10 bg-gradient-to-br from-cyan-500/30 to-purple-500/30 rounded-xl flex items-center justify-center text-cyan-400 font-bold flex-shrink-0">
                    {sectionIndex + 1}
                  </span>
                  <div className="flex-1 text-right">
                    <h4 className="font-semibold text-white text-lg">{section.title}</h4>
                    <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
                      <span>{section.lessons.length} درس</span>
                      <span>•</span>
                      <span>{Math.round(sectionDuration / 60)} دقيقة</span>
                      {freeLessons > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-green-400">{freeLessons} مجاني</span>
                        </>
                      )}
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </button>

                {/* Lessons List */}
                {isExpanded && (
                  <div className="border-t border-white/10">
                    {section.lessons
                      .sort((a, b) => a.sort_order - b.sort_order)
                      .map((lesson, lessonIndex) => (
                        <div
                          key={lesson.id}
                          className="flex items-center gap-4 px-5 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-b-0"
                        >
                          {/* Icon */}
                          {lesson.is_free ? (
                            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                              <PlayCircle className="h-4 w-4 text-green-400" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                              <Lock className="h-4 w-4 text-gray-500" />
                            </div>
                          )}

                          {/* Lesson Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">
                                {sectionIndex + 1}.{lessonIndex + 1}
                              </span>
                              <span className="text-white truncate">{lesson.title}</span>
                              {lesson.is_free && (
                                <Badge className="bg-green-500/20 text-green-400 border-0 text-xs">
                                  مجاني
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Duration */}
                          <div className="flex items-center gap-1 text-sm text-gray-500 flex-shrink-0">
                            <Clock className="h-4 w-4" />
                            <span>{formatSeconds(lesson.duration_seconds)}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )
          })}
      </div>
    </div>
  )
}
