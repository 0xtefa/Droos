/**
 * Reusable skeleton loading components for the Droos application.
 * These provide visual feedback while content is loading.
 */

export function Skeleton({ className = '', ...props }) {
  return (
    <div
      className={`animate-pulse rounded bg-slate-200 ${className}`}
      {...props}
    />
  );
}

export function SkeletonText({ lines = 1, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 ${i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'}`}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = '' }) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}
    >
      <div className="flex flex-row-reverse items-center justify-between">
        <div className="flex-1 space-y-3 text-right">
          <Skeleton className="h-6 w-3/4 mr-auto" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
  );
}

export function SkeletonCourseGrid({ count = 4 }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonLectureList({ count = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-10">
      {/* Header skeleton */}
      <div className="flex flex-row-reverse items-start justify-end">
        <div className="ml-auto max-w-xl text-right space-y-2">
          <Skeleton className="h-9 w-64" />
        </div>
      </div>

      {/* Next lecture card skeleton */}
      <div className="rounded-2xl border border-sky-200 bg-sky-50 p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3 flex-1">
            <Skeleton className="h-4 w-24 bg-sky-200" />
            <Skeleton className="h-6 w-48 bg-sky-200" />
            <Skeleton className="h-4 w-40 bg-sky-200" />
            <Skeleton className="h-3 w-36 bg-sky-200" />
          </div>
          <Skeleton className="h-20 w-48 rounded-xl bg-sky-200" />
        </div>
      </div>

      {/* Courses grid skeleton */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-6 w-40" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
          <SkeletonCourseGrid count={2} />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonQuiz() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      <div className="text-center space-y-2">
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-4 w-64 mx-auto" />
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <Skeleton className="h-6 w-3/4" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      </div>
      <div className="flex justify-between">
        <Skeleton className="h-10 w-24 rounded-lg" />
        <Skeleton className="h-10 w-24 rounded-lg" />
      </div>
    </div>
  );
}

export default Skeleton;
