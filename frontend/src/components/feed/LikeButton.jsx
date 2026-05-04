import { useState } from 'react'
import { Heart } from 'lucide-react'

export default function LikeButton({ liked, count, onToggle, size = 'md' }) {
  const [animate, setAnimate] = useState(false)

  const handleClick = () => {
    if (!liked) {
      setAnimate(true)
      setTimeout(() => setAnimate(false), 600)
    }
    onToggle()
  }

  const iconSize = size === 'sm' ? 15 : 18

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-1.5 transition-all duration-200 select-none ${
        liked ? 'text-pink-500' : 'text-zinc-500 hover:text-pink-400'
      }`}
    >
      <div className="relative">
        <Heart
          size={iconSize}
          fill={liked ? 'currentColor' : 'none'}
          className={`transition-transform duration-200 ${animate ? 'scale-150' : 'scale-100'}`}
        />
        {animate && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-pink-500 rounded-full"
                style={{
                  animation: `particle 0.6s ease-out forwards`,
                  transform: `rotate(${i * 60}deg)`,
                  transformOrigin: '0 0',
                }}
              />
            ))}
          </div>
        )}
      </div>
      <span className="text-xs tabular-nums">{count}</span>
    </button>
  )
}