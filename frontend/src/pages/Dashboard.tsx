import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { Plus, BookOpen, CheckCircle, Clock, TrendingUp } from 'lucide-react'
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
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
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
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          {greeting()}, {user?.user_metadata?.name || 'there'}!
        </h2>
        <p className="text-gray-600 mt-1">Here's your learning progress today</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <BookOpen className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Tasks</p>
              <p className="text-xl font-bold text-gray-900">{stats?.total_tasks || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-xl font-bold text-gray-900">{stats?.completed_tasks || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Clock className="text-orange-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-xl font-bold text-gray-900">{stats?.pending_tasks || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <TrendingUp className="text-purple-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completion</p>
              <p className="text-xl font-bold text-gray-900">{stats?.completion_rate || 0}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Tasks */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Today's Tasks</h3>
          <Link 
            to="/tasks" 
            className="text-primary-600 text-sm font-medium hover:text-primary-700"
          >
            View all
          </Link>
        </div>

        {todayTasks.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <p className="text-gray-500 mb-4">No tasks scheduled for today</p>
            <Link
              to="/plans"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              <Plus size={18} />
              Create Study Plan
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {todayTasks.map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-lg border border-gray-200 p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{task.title}</h4>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {task.duration_minutes} min
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        task.priority === 'high' ? 'bg-red-100 text-red-700' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                  {task.status === 'pending' && (
                    <button
                      onClick={() => handleCompleteTask(task.id)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-full"
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
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-4">
          <Link
            to="/plans"
            className="flex flex-col items-center justify-center p-4 bg-primary-50 rounded-lg border border-primary-200"
          >
            <Plus className="text-primary-600 mb-2" size={24} />
            <span className="text-primary-700 font-medium">New Plan</span>
          </Link>
          <Link
            to="/tasks"
            className="flex flex-col items-center justify-center p-4 bg-secondary-50 rounded-lg border border-secondary-200"
          >
            <CheckCircle className="text-secondary-600 mb-2" size={24} />
            <span className="text-secondary-700 font-medium">View Tasks</span>
          </Link>
        </div>
      </div>
    </div>
  )
}