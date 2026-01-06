import { Skeleton } from '@/components/ui/skeleton'

export default function CourseDetailLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Breadcrumb Skeleton */}
      <div className="bg-[#0f0f0f] border-b border-white/10">
        <div className="container-custom py-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-16 bg-white/10" />
            <Skeleton className="h-4 w-4 bg-white/10" />
            <Skeleton className="h-4 w-20 bg-white/10" />
            <Skeleton className="h-4 w-4 bg-white/10" />
            <Skeleton className="h-4 w-32 bg-white/10" />
          </div>
        </div>
      </div>

      {/* Hero Section Skeleton */}
      <section className="relative py-12 md:py-16">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* Course Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Badges */}
              <div className="flex gap-2">
                <Skeleton className="h-6 w-24 rounded-full bg-white/10" />
                <Skeleton className="h-6 w-16 rounded-full bg-white/10" />
              </div>

              {/* Title */}
              <div className="space-y-3">
                <Skeleton className="h-10 w-full bg-white/10" />
                <Skeleton className="h-10 w-3/4 bg-white/10" />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Skeleton className="h-5 w-full bg-white/10" />
                <Skeleton className="h-5 w-4/5 bg-white/10" />
              </div>

              {/* Meta Info */}
              <div className="flex flex-wrap gap-4">
                <Skeleton className="h-10 w-32 rounded-lg bg-white/10" />
                <Skeleton className="h-10 w-24 rounded-lg bg-white/10" />
                <Skeleton className="h-10 w-20 rounded-lg bg-white/10" />
                <Skeleton className="h-10 w-28 rounded-lg bg-white/10" />
              </div>

              {/* Instructor Preview */}
              <div className="flex items-center gap-3 pt-2">
                <Skeleton className="w-12 h-12 rounded-full bg-white/10" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-12 bg-white/10" />
                  <Skeleton className="h-4 w-24 bg-white/10" />
                </div>
              </div>
            </div>

            {/* Sidebar Skeleton */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <Skeleton className="aspect-video w-full bg-white/10" />
              <div className="p-6 space-y-6">
                <Skeleton className="h-10 w-32 bg-white/10" />
                <Skeleton className="h-12 w-full rounded-xl bg-white/10" />
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-5 w-5 rounded bg-white/10" />
                      <Skeleton className="h-4 w-32 bg-white/10" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Skeleton */}
      <section className="py-12">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-12">
              {/* What You'll Learn */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
                <Skeleton className="h-8 w-40 mb-6 bg-white/10" />
                <div className="grid sm:grid-cols-2 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-start gap-3 bg-white/5 rounded-xl p-4">
                      <Skeleton className="h-5 w-5 rounded-full bg-white/10" />
                      <Skeleton className="h-4 flex-1 bg-white/10" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Course Content */}
              <div>
                <Skeleton className="h-8 w-40 mb-6 bg-white/10" />
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5">
                      <div className="flex items-center gap-4">
                        <Skeleton className="w-10 h-10 rounded-xl bg-white/10" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-48 bg-white/10" />
                          <Skeleton className="h-4 w-32 bg-white/10" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
