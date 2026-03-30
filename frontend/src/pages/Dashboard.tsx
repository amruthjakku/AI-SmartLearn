import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { Plus, BookOpen, CheckCircle, Clock, TrendingUp, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'

interface Task {
  id: string
  title: string
  scheduled_time: string
  duration_minutes: number
  priority: string
  status: string
}

interface Stats {
  total_tasks: number
  completed_tasks: number
  pending_tasks: number
  completion_rate: number
}

export default function Dashboard() {
  const { user } = useAuth()
  const [todayTasks, setTodayTasks] = useState<Task[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [tasksRes, statsRes] = await Promise.all([
        api.getTodayTasks(),
        api.getUserStats()
      ])
      setTodayTasks(tasksRes.tasks)
      setStats(statsRes)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteTask = async (taskId: string) => {
    try {
      await api.completeTask(taskId)
      toast.success('Task completed!')
      loadDashboardData()
    } catch (error) {
      console.error('Failed to complete task:', error)
      toast.error('Failed to complete task')
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full animate-fade-in">
        <div className="w-12 h-12 rounded-2xl bg-base-100 flex items-center justify-center animate-pulse">
          <Loader2 className="animate-spin text-base-400" size={24} />
        </div>
      </div>
    )
  }

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-2xl mx-auto pb-6">
      {/* Greeting */}
      <div className="pb-2 border-b border-base-200/50">
        <h2 className="text-3xl font-bold tracking-tight text-base-900">
          {greeting()}, <span className="text-primary-600">{user?.user_metadata?.name?.split(' ')[0] || 'there'}</span>
        </h2>
        <p className="text-[15px] font-medium text-base-500 mt-1.5">Here's your learning progress today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-base-200/60 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-2 -top-2 w-16 h-16 bg-blue-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex flex-col gap-3 relative z-10">
            <div className="w-10 h-10 bg-white border border-base-100 rounded-xl flex items-center justify-center shadow-sm text-blue-500">
              <BookOpen size={20} />
            </div>
            <div>
              <p className="text-[28px] font-bold text-base-900 tracking-tight leading-none mb-1">{stats?.total_tasks || 0}</p>
              <p className="text-[12px] font-semibold text-base-500 uppercase tracking-widest">Total Tasks</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl border border-base-200/60 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-2 -top-2 w-16 h-16 bg-emerald-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex flex-col gap-3 relative z-10">
            <div className="w-10 h-10 bg-white border border-base-100 rounded-xl flex items-center justify-center shadow-sm text-emerald-500">
              <CheckCircle size={20} />
            </div>
            <div>
              <p className="text-[28px] font-bold text-base-900 tracking-tight leading-none mb-1">{stats?.completed_tasks || 0}</p>
              <p className="text-[12px] font-semibold text-base-500 uppercase tracking-widest">Completed</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl border border-base-200/60 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-2 -top-2 w-16 h-16 bg-orange-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex flex-col gap-3 relative z-10">
            <div className="w-10 h-10 bg-white border border-base-100 rounded-xl flex items-center justify-center shadow-sm text-orange-500">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-[28px] font-bold text-base-900 tracking-tight leading-none mb-1">{stats?.pending_tasks || 0}</p>
              <p className="text-[12px] font-semibold text-base-500 uppercase tracking-widest">Pending</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-base-900 to-base-800 rounded-2xl sm:rounded-3xl border border-base-800 p-4 sm:p-5 shadow-float relative overflow-hidden group text-white">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white opacity-5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex flex-col gap-3 relative z-10">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-primary-300 backdrop-blur-sm">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-[28px] font-bold tracking-tight leading-none mb-1">{stats?.completion_rate || 0}%</p>
              <p className="text-[12px] font-semibold text-base-400 uppercase tracking-widest whitespace-nowrap overflow-hidden text-ellipsis">Completion</p>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Tasks */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="text-[15px] font-bold text-base-900 uppercase tracking-widest">Today's Focus</h3>
          <Link 
            to="/tasks" 
            className="text-primary-600 text-sm font-semibold hover:text-primary-700 hover:underline underline-offset-4 transition-all"
          >
            Review all
          </Link>
        </div>

        {todayTasks.length === 0 ? (
          <div className="bg-white rounded-3xl border border-base-200/60 flex flex-col items-center justify-center p-8 text-center shadow-sm">
            <div className="w-16 h-16 bg-base-50 rounded-full flex items-center justify-center mb-4 text-base-300">
              <CheckCircle size={32} />
            </div>
            <p className="text-base-900 font-semibold mb-1">You're all caught up!</p>
            <p className="text-base-500 text-sm mb-6 max-w-[200px]">No tasks scheduled for today.</p>
            <Link
              to="/plans"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-base-900 text-white font-medium rounded-xl hover:bg-black transition-all active:scale-95 shadow-sm text-sm"
            >
              <Plus size={16} />
              Set a New Goal
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {todayTasks.map((task) => (
              <div
                key={task.id}
                className="group bg-white rounded-2xl border border-base-200/60 p-4 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-base-900 leading-tight mb-1">{task.title}</h4>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="flex items-center gap-1.5 px-2 py-1 bg-base-50 rounded-lg text-[11px] font-bold text-base-500 uppercase tracking-wide">
                        <Clock size={12} className="text-base-400" />
                        {task.duration_minutes} min
                      </span>
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${
                        task.priority === 'high' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                        task.priority === 'medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                        'bg-green-50 text-green-700 border-green-100'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                  {task.status === 'pending' && (
                    <button
                      onClick={() => handleCompleteTask(task.id)}
                      className="p-3 bg-white border border-base-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 rounded-xl transition-all shadow-sm flex-shrink-0"
                      title="Mark complete"
                    >
                      <CheckCircle size={20} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="pt-2">
        <h3 className="text-[15px] font-bold text-base-900 uppercase tracking-widest mb-4 px-1">Quick Launch</h3>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <Link
            to="/plans"
            className="flex flex-col items-center justify-center p-5 bg-gradient-to-br from-primary-50 to-white rounded-2xl border border-primary-100 hover:border-primary-300 hover:shadow-sm transition-all group"
          >
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform text-primary-600">
              <Plus size={24} />
            </div>
            <span className="text-primary-900 font-semibold text-sm">Create Plan</span>
          </Link>
          <Link
            to="/tasks"
            className="flex flex-col items-center justify-center p-5 bg-gradient-to-br from-base-50 to-white rounded-2xl border border-base-200 hover:border-base-300 hover:shadow-sm transition-all group"
          >
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform text-base-600">
              <CheckCircle size={24} />
            </div>
            <span className="text-base-900 font-semibold text-sm">Review Tasks</span>
          </Link>
        </div>
      </div>
    </div>
  )
}