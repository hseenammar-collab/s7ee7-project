import Image from 'next/image'
import { Star, Users, BookOpen, Award } from 'lucide-react'
import type { Profile } from '@/types/database'

interface InstructorCardProps {
  instructor: Pick<Profile, 'id' | 'full_name' | 'avatar_url' | 'bio'>
}

export default function InstructorCard({ instructor }: InstructorCardProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-cyan-500 to-purple-500">
            {instructor.avatar_url ? (
              <Image
                src={instructor.avatar_url}
                alt={instructor.full_name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold">
                {instructor.full_name.charAt(0)}
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 space-y-4">
          <div>
            <p className="text-cyan-400 text-sm font-medium mb-1">المدرب</p>
            <h3 className="text-2xl font-bold text-white">{instructor.full_name}</h3>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-lg">
              <Star className="h-4 w-4 text-amber-400" />
              <span className="text-gray-400">4.8 تقييم</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-lg">
              <Users className="h-4 w-4 text-cyan-400" />
              <span className="text-gray-400">+1000 طالب</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-lg">
              <BookOpen className="h-4 w-4 text-purple-400" />
              <span className="text-gray-400">+10 كورسات</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-lg">
              <Award className="h-4 w-4 text-green-400" />
              <span className="text-gray-400">معتمد</span>
            </div>
          </div>

          {/* Bio */}
          {instructor.bio && (
            <p className="text-gray-400 leading-relaxed">
              {instructor.bio}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
