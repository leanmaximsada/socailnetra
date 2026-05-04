import { useNavigate } from 'react-router-dom'

export default function EmptyState({ icon, title, subtitle, actionLabel, actionPath }) {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>{title}</h3>
      {subtitle && <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>}
      {actionLabel && actionPath && (
        <button
          onClick={() => navigate(actionPath)}
          className="px-6 py-2.5 bg-[#3B9FE4] text-white text-sm font-bold rounded-full hover:bg-[#2d8fd4] transition"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}