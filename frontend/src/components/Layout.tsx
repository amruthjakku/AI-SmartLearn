import { ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { MessageSquare, Layout as LayoutIcon, BookOpen, CheckSquare, User, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { signOut } = useAuth()
  const location = useLocation()
  
  const navItems = [
    { path: '/', icon: MessageSquare, label: 'Chat' },
    { path: '/overview', icon: LayoutIcon, label: 'Overview' },
    { path: '/plans', icon: BookOpen, label: 'Plans' },
    { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
    { path: '/profile', icon: User, label: 'Profile' },
  ]

  return (
    <div className="min-h-screen bg-base-50 flex flex-col font-sans">
      {/* Floating Glass Header */}
      <header className="fixed top-0 w-full z-50 glass border-b border-base-200/50 safe-area-top">
        <div className="flex items-center justify-between max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center shadow-glow">
              <span className="text-white font-bold text-lg leading-none">A</span>
            </div>
            <h1 className="text-xl font-bold text-base-900 tracking-tight">SmartLearn</h1>
          </div>
          <button
            onClick={signOut}
            className="p-2 text-base-500 hover:text-base-900 hover:bg-base-100 rounded-full transition-all duration-300 active:scale-95"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Main Content (padded to account for fixed header and footer) */}
      <main className="flex-1 overflow-y-auto pt-20 pb-32 hide-scrollbar">
        <div className="max-w-lg mx-auto px-4 h-full">
          {children}
        </div>
      </main>

      {/* Floating Pill Bottom Navigation */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-lg z-50 safe-area-bottom">
        <nav className="glass rounded-2xl border border-white/60 shadow-float px-2 py-2">
          <div className="flex justify-between items-center">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`relative flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all duration-300 ${
                    isActive 
                      ? 'text-primary-600 bg-primary-50/80 shadow-sm' 
                      : 'text-base-400 hover:text-base-700 hover:bg-base-50/50'
                  }`}
                >
                  <Icon size={22} className={`transition-transform duration-300 ${isActive ? 'scale-110 mb-0.5' : ''}`} />
                  <span className={`text-[10px] font-medium transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0 h-0 w-0 absolute'}`}>
                    {item.label}
                  </span>
                </NavLink>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}