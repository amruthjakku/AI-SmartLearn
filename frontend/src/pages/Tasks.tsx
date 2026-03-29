import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { CheckCircle, Clock, Calendar, AlertCircle, RefreshCw, Trash2 } from 'lucide-react'
import { api } from '../services/api'

interface Task {
  id: string
  title: string
  description?: string
  scheduled_time: string
  duration_minutes: number
  priority: string
  status: string
  study_plan_id?: string
}

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'missed'>('all')

  useEffect(() => {
    loadTasks()
  }, [filter])

  const loadTasks = async () => {
    try {
      setLoading(true)
      const params = filter !== 'all' ? { status: filter } : undefined
      const response = await api.getTasks(params)
      setTasks(response.tasks)
    } catch (error) {
      console.error('Failed to load tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteTask = async (taskId: string) => {
    try {
      await api.completeTask(taskId)
      toast.success('Task completed!')
      loadTasks()
    } catch (error) {
      console.error('Failed to complete task:', error)
      toast.error('Failed to complete task')
    }
  }

  const handleMissTask = async (taskId: string) => {
    try {
      await api.missTask(taskId)
      toast.success('Task marked as missed')
      loadTasks()
    } catch (error) {
      console.error('Failed to mark task as missed:', error)
      toast.error('Failed to update task')
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return
    
    try {
      await api.deleteTask(taskId)
      toast.success('Task deleted')
      loadTasks()
    } catch (error) {
      console.error('Failed to delete task:', error)
      toast.error('Failed to delete task')
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) return 'Today'
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
    return date.toLocaleDateString()
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700'
      case 'medium': return 'bg-yellow-100 text-yellow-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="text-green-500" size={18} />
      case 'missed': return <AlertCircle className="text-red-500" size={18} />
      default: return <Clock className="text-blue-500" size={18} />
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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
        <button
          onClick={loadTasks}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {(['all', 'pending', 'completed', 'missed'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              filter === status
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <Clock className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
          <p className="text-gray-600">
            {filter === 'all' 
              ? 'Create a study plan to generate tasks'
              : `No ${filter} tasks`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-lg border border-gray-200 p-4"
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {getStatusIcon(task.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-medium ${
                    task.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-900'
                  }`}>
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {formatDate(task.scheduled_time)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {formatTime(task.scheduled_time)}
                    </span>
                    <span>{task.duration_minutes} min</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {task.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleCompleteTask(task.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                        title="Mark as complete"
                      >
                        <CheckCircle size={18} />
                      </button>
                      <button
                        onClick={() => handleMissTask(task.id)}
                        className="p-2 text-orange-600 hover:bg-orange-50 rounded-full"
                        title="Mark as missed"
                      >
                        <AlertCircle size={18} />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                    title="Delete task"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}