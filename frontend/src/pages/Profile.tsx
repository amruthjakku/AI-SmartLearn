import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { User, Mail, Calendar, Trophy, TrendingUp, Save, CheckCircle, BookOpen, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'

interface UserProfile {
  name: string
  email: string
  created_at: string
}

interface UserStats {
  total_tasks: number
  completed_tasks: number
  streak_days: number
  completion_rate: number
}

export default function Profile() {
  const { user, signOut } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [name, setName] = useState('')

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const [profileRes, statsRes] = await Promise.all([
        api.getProfile(),
        api.getUserStats()
      ])
      if (profileRes) {
        setProfile(profileRes)
        setName(profileRes.name || '')
      }
      setStats(statsRes)
    } catch (error) {
      console.error('Failed to load profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      await api.updateProfile({ name })
      setProfile(prev => prev ? { ...prev, name } : null)
      setEditMode(false)
      toast.success('Profile updated!')
    } catch (error) {
      console.error('Failed to save profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-2xl mx-auto pb-8">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl border border-base-200/60 p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
        <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
          <div className="w-24 h-24 bg-base-900 rounded-3xl flex items-center justify-center text-white shadow-lg transform -rotate-3 hover:rotate-0 transition-transform duration-500">
            <User size={48} strokeWidth={1.5} />
          </div>
          <div className="flex-1 text-center sm:text-left">
            {editMode ? (
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="px-4 py-2 bg-base-50 border border-base-200 rounded-xl outline-none focus:border-primary-500 transition-all font-semibold text-lg"
                  autoFocus
                />
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="px-4 py-1.5 bg-base-900 text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-black transition-all flex items-center gap-2"
                  >
                    {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setEditMode(false)
                      setName(profile?.name || '')
                    }}
                    className="px-4 py-1.5 bg-white border border-base-200 text-base-500 text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-base-50 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-3xl font-bold text-base-900 tracking-tight mb-1">
                  {profile?.name || user?.user_metadata?.name || 'User'}
                </h2>
                <button
                  onClick={() => setEditMode(true)}
                  className="text-xs font-bold text-primary-600 uppercase tracking-widest hover:text-primary-700 transition-colors"
                >
                  Edit Profile Details
                </button>
              </div>
            )}
            
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-4 text-[13px] font-medium text-base-500">
              <div className="flex items-center gap-2 px-3 py-1 bg-base-50 rounded-full border border-base-100">
                <Mail size={14} className="text-base-400" />
                {profile?.email || user?.email}
              </div>
              {profile?.created_at && (
                <div className="flex items-center gap-2 px-3 py-1 bg-base-50 rounded-full border border-base-100">
                  <Calendar size={14} className="text-base-400" />
                  Joined {new Date(profile.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl border border-base-200/60 p-5 shadow-sm text-center group hover:shadow-md transition-all">
          <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center mx-auto mb-3 text-orange-500 group-hover:scale-110 transition-transform">
            <Trophy size={20} />
          </div>
          <p className="text-2xl font-bold text-base-900 leading-none mb-1">{stats?.streak_days || 0}</p>
          <p className="text-[10px] font-bold text-base-400 uppercase tracking-widest">Day Streak</p>
        </div>

        <div className="bg-white rounded-2xl border border-base-200/60 p-5 shadow-sm text-center group hover:shadow-md transition-all">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-3 text-emerald-500 group-hover:scale-110 transition-transform">
            <TrendingUp size={20} />
          </div>
          <p className="text-2xl font-bold text-base-900 leading-none mb-1">{stats?.completion_rate || 0}%</p>
          <p className="text-[10px] font-bold text-base-400 uppercase tracking-widest">Rate</p>
        </div>

        <div className="bg-white rounded-2xl border border-base-200/60 p-5 shadow-sm text-center group hover:shadow-md transition-all text-blue-500 font-bold text-xl">
           <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3 text-blue-500 group-hover:scale-110 transition-transform">
            <CheckCircle size={20} />
          </div>
          <p className="text-2xl font-bold text-base-900 leading-none mb-1">{stats?.completed_tasks || 0}</p>
          <p className="text-[10px] font-bold text-base-400 uppercase tracking-widest">Completed</p>
        </div>

        <div className="bg-gradient-to-br from-base-900 to-base-800 rounded-2xl border border-base-800 p-5 shadow-sm text-center group hover:shadow-lg transition-all text-white">
           <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-3 text-primary-300 group-hover:scale-110 transition-transform">
            <BookOpen size={20} />
          </div>
          <p className="text-2xl font-bold text-white leading-none mb-1">{stats?.total_tasks || 0}</p>
          <p className="text-[10px] font-bold text-base-400 uppercase tracking-widest">Total</p>
        </div>
      </div>

      {/* Settings Section */}
      <div className="bg-white rounded-3xl border border-base-200/60 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-base-100 bg-base-50/30">
          <h3 className="text-sm font-bold text-base-900 uppercase tracking-widest">Preferences & Account</h3>
        </div>
        
        <div className="divide-y divide-base-50">
          <div className="flex items-center justify-between px-6 py-5 hover:bg-base-50/50 transition-colors">
            <div>
              <p className="text-[15px] font-semibold text-base-900">Push Notifications</p>
              <p className="text-xs text-base-500 mt-0.5">Receive alerts for upcoming study sessions</p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-base-900 transition-all outline-none">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6 transition shadow-sm" />
            </button>
          </div>

          <div className="flex items-center justify-between px-6 py-5 hover:bg-base-50/50 transition-colors">
            <div>
              <p className="text-[15px] font-semibold text-base-900">Email Reminders</p>
              <p className="text-xs text-base-500 mt-0.5">Summary of your progress delivered weekly</p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-base-200 transition-all outline-none">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1 transition shadow-sm" />
            </button>
          </div>
        </div>
      </div>

      {/* Sign Out Action */}
      <div className="pt-4">
        <button
          onClick={async () => {
            await signOut()
            toast.success('Signed out')
          }}
          className="w-full py-4 px-6 bg-white border border-red-200 text-red-600 font-bold text-sm uppercase tracking-widest rounded-2xl hover:bg-red-50 hover:border-red-300 transition-all active:scale-[0.98] shadow-sm"
        >
          Sign Out of Account
        </button>
      </div>
    </div>
  )
}