import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Bot, Mail, Lock, Loader2, ArrowRight } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await signIn(email, password)
    
    if (error) {
      setError(error.message)
      toast.error(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-50 px-4 py-12 sm:px-6 lg:px-8 font-sans selection:bg-primary-100 italic-selection:text-primary-900">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-base-900 rounded-2xl flex items-center justify-center text-white shadow-xl mb-6 transform -rotate-6 hover:rotate-0 transition-all duration-500">
            <Bot size={32} />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-base-900">Welcome back</h2>
          <p className="mt-2 text-sm font-medium text-base-500">Continue your learning journey with SmartBud</p>
        </div>

        <div className="bg-white rounded-3xl border border-base-200/60 p-8 shadow-glass relative overflow-hidden">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-xs font-bold text-red-600 uppercase tracking-widest text-center animate-shake">
                {error}
              </div>
            )}
            
            <div className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-xs font-bold text-base-400 uppercase tracking-widest mb-2 ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-base-400 group-focus-within:text-base-900 transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 bg-base-50 border border-base-100 rounded-2xl outline-none focus:bg-white focus:border-base-900 focus:shadow-sm transition-all text-base-900 placeholder:text-base-300 sm:text-sm font-medium"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-bold text-base-400 uppercase tracking-widest mb-2 ml-1">
                  Secret Key
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-base-400 group-focus-within:text-base-900 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 bg-base-50 border border-base-100 rounded-2xl outline-none focus:bg-white focus:border-base-900 focus:shadow-sm transition-all text-base-900 placeholder:text-base-300 sm:text-sm font-medium"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center items-center py-4 px-4 border border-transparent text-sm font-bold uppercase tracking-widest rounded-2xl text-white bg-base-900 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-base-900 transition-all active:scale-[0.98] disabled:opacity-50 shadow-md"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm font-medium text-base-500">
          New to SmartBud?{' '}
          <Link to="/register" className="font-bold text-primary-600 hover:text-primary-700 underline underline-offset-4 transition-all">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}