import { Skeleton } from '@/components/ui/skeleton'

export default function CoursesLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24">
        <div className="container-custom text-center">
          <Skeleton className="h-12 w-64 mx-auto mb-4 bg-white/10" />
          <Skeleton className="h-6 w-96 mx-auto bg-white/10" />
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 border-y border-white/10">
        <div className="container-custom">
          <div className="flex justify-center gap-12">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="text-center">
                <Skeleton className="h-10 w-16 mx-auto mb-2 bg-white/10" />
                <Skeleton className="h-4 w-20 mx-auto bg-white/10" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8">
        <div className="container-custom">
          <div className="flex flex-wrap justify-center gap-3">
            {[...Array(7)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-28 rounded-full bg-white/10" />
            ))}
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-12">
        <div className="container-custom">
          {/* Filters Bar */}
          <div className="flex flex-wrap gap-4 mb-8">
            <Skeleton className="h-10 flex-1 max-w-md rounded-lg bg-white/10" />
            <Skeleton className="h-10 w-32 rounded-lg bg-white/10" />
            <Skeleton className="h-10 w-32 rounded-lg bg-white/10" />
          </div>

          {/* Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
              >
                <Skeleton className="aspect-video w-full bg-white/10" />
                <div className="p-5 space-y-4">
                  <Skeleton className="h-6 w-full bg-white/10" />
                  <Skeleton className="h-6 w-3/4 bg-white/10" />
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-4 w-16 bg-white/10" />
                    <Skeleton className="h-4 w-20 bg-white/10" />
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <Skeleton className="h-6 w-24 bg-white/10" />
                    <Skeleton className="h-6 w-16 bg-white/10" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
