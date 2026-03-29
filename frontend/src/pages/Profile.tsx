import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { User, Mail, Calendar, Trophy, TrendingUp, Save } from 'lucide-react'
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
      setProfile(profileRes)
      setName(profileRes.name || '')
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
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Profile</h2>

      {/* Profile Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="text-primary-600" size={32} />
          </div>
          <div className="flex-1">
            {editMode ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter your name"
                />
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="p-2 text-primary-600 hover:bg-primary-50 rounded-md"
                >
                  <Save size={20} />
                </button>
                <button
                  onClick={() => {
                    setEditMode(false)
                    setName(profile?.name || '')
                  }}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {profile?.name || user?.user_metadata?.name || 'User'}
                </h3>
                <button
                  onClick={() => setEditMode(true)}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Edit profile
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 text-gray-600">
            <Mail size={18} />
            <span>{profile?.email || user?.email}</span>
          </div>
          {profile?.created_at && (
            <div className="flex items-center gap-3 text-gray-600">
              <Calendar size={18} />
              <span>Joined {new Date(profile.created_at).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <Trophy className="mx-auto text-yellow-500 mb-2" size={24} />
          <p className="text-2xl font-bold text-gray-900">{stats?.streak_days || 0}</p>
          <p className="text-sm text-gray-600">Day Streak</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <TrendingUp className="mx-auto text-green-500 mb-2" size={24} />
          <p className="text-2xl font-bold text-gray-900">{stats?.completion_rate || 0}%</p>
          <p className="text-sm text-gray-600">Completion Rate</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="mx-auto mb-2 text-blue-500 font-bold text-xl">✓</div>
          <p className="text-2xl font-bold text-gray-900">{stats?.completed_tasks || 0}</p>
          <p className="text-sm text-gray-600">Tasks Completed</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="mx-auto mb-2 text-purple-500 font-bold text-xl">📋</div>
          <p className="text-2xl font-bold text-gray-900">{stats?.total_tasks || 0}</p>
          <p className="text-sm text-gray-600">Total Tasks</p>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Settings</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-gray-700">Push Notifications</span>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary-600">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6 transition" />
            </button>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-gray-700">Email Reminders</span>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1 transition" />
            </button>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-gray-700">Study Reminders</span>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary-600">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6 transition" />
            </button>
          </div>
        </div>
      </div>

      {/* Sign Out Button */}
      <button
        onClick={async () => {
          await signOut()
          toast.success('Signed out')
        }}
        className="w-full py-3 px-4 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
      >
        Sign Out
      </button>
    </div>
  )
}