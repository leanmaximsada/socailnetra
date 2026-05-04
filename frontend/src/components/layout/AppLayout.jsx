import logo from '../../assets/logo.png'
import BottomNav from './BottomNav'

export default function AppLayout({ children, title }) {
  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <header
        className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md border-b flex items-center justify-center h-14 gap-2"
        style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', opacity: 0.9 }}
      >
        <img src={logo} alt="SocialNetra" className="w-8 h-8 rounded-xl" />
        <span className="font-bold text-lg tracking-tight" style={{ color: 'var(--text-primary)' }}>
          {title ?? 'SocialNetra'}
        </span>
      </header>
      <main className="pt-14 pb-20 max-w-lg mx-auto">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}