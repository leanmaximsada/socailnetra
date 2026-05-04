export default function ProfileStats({ profile }) {
  const stats = [
    { label: 'Posts',     value: profile.posts_count     ?? 0 },
    { label: 'Followers', value: profile.followers_count ?? 0 },
    { label: 'Following', value: profile.following_count ?? 0 },
  ]

  return (
    <div className="flex divide-x divide-zinc-800 border-y border-zinc-900 my-4">
      {stats.map(({ label, value }) => (
        <div key={label} className="flex-1 flex flex-col items-center py-3 gap-0.5">
          <span className="text-white font-bold text-lg leading-none">{value}</span>
          <span className="text-zinc-500 text-xs">{label}</span>
        </div>
      ))}
    </div>
  )
}