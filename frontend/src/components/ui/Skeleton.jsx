export function SkeletonBox({ className = '' }) {
  return (
    <div
      className={`animate-pulse rounded-lg ${className}`}
      style={{ backgroundColor: 'var(--bg-card)' }}
    />
  )
}

export function PostSkeleton() {
  return (
    <div className="flex gap-3 px-4 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
      <SkeletonBox className="w-10 h-10 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex gap-2">
          <SkeletonBox className="h-3 w-24" />
          <SkeletonBox className="h-3 w-16" />
        </div>
        <SkeletonBox className="h-3 w-full" />
        <SkeletonBox className="h-3 w-3/4" />
        <div className="flex gap-6 mt-3">
          <SkeletonBox className="h-4 w-8" />
          <SkeletonBox className="h-4 w-8" />
          <SkeletonBox className="h-4 w-8" />
          <SkeletonBox className="h-4 w-8" />
        </div>
      </div>
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="px-4 pt-4">
      <div className="flex items-start justify-between mb-4">
        <SkeletonBox className="w-20 h-20 rounded-full" />
        <SkeletonBox className="w-28 h-9 rounded-full" />
      </div>
      <SkeletonBox className="h-5 w-32 mb-2" />
      <SkeletonBox className="h-3 w-24 mb-3" />
      <SkeletonBox className="h-3 w-full mb-1" />
      <SkeletonBox className="h-3 w-2/3 mb-4" />
      <div className="flex divide-x" style={{ borderColor: 'var(--border)' }}>
        {[1,2,3].map(i => (
          <div key={i} className="flex-1 flex flex-col items-center py-3 gap-1">
            <SkeletonBox className="h-5 w-8" />
            <SkeletonBox className="h-3 w-12" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function NotificationSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
      <SkeletonBox className="w-2 h-2 rounded-full shrink-0" />
      <SkeletonBox className="w-11 h-11 rounded-full shrink-0" />
      <div className="flex-1 space-y-1.5">
        <SkeletonBox className="h-3 w-3/4" />
        <SkeletonBox className="h-3 w-1/2" />
      </div>
    </div>
  )
}

export function StoryAvatarSkeleton() {
  return (
    <div className="flex flex-col items-center gap-1.5 shrink-0">
      <SkeletonBox className="w-14 h-14 rounded-full" />
      <SkeletonBox className="h-2 w-12" />
    </div>
  )
}

export function MessageSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
      <SkeletonBox className="w-12 h-12 rounded-full shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="flex justify-between">
          <SkeletonBox className="h-3 w-24" />
          <SkeletonBox className="h-3 w-8" />
        </div>
        <SkeletonBox className="h-3 w-3/4" />
      </div>
    </div>
  )
}