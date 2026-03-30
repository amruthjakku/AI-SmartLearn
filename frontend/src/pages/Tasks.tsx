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
    <div className="space-y-8 animate-fade-in max-w-2xl mx-auto">
      <div className="flex items-center justify-between pb-4 border-b border-base-200/50">
        <div>
          <h2 className="text-2xl font-bold text-base-900 tracking-tight">Tasks</h2>
          <p className="text-sm text-base-500 mt-1">Manage your daily learning objectives</p>
        </div>
        <button
          onClick={loadTasks}
          className="p-2.5 text-base-500 hover:text-base-900 hover:bg-base-100 rounded-xl transition-all active:scale-95 border border-transparent hover:border-base-200"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 hide-scrollbar">
        {(['all', 'pending', 'completed', 'missed'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
              filter === status
                ? 'bg-base-900 text-white shadow-md'
                : 'bg-white text-base-600 border border-base-200/60 hover:border-base-300 hover:bg-base-50'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <div className="bg-white rounded-3xl border border-base-200/60 p-12 text-center shadow-sm relative overflow-hidden mt-4">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-base-200 to-base-300 opacity-50"></div>
          <div className="w-20 h-20 bg-base-50 rounded-full flex items-center justify-center mx-auto mb-6 text-base-300">
            <Clock size={40} className="opacity-80" />
          </div>
          <h3 className="text-xl font-semibold text-base-900 mb-2 tracking-tight">No tasks found</h3>
          <p className="text-base-500 max-w-sm mx-auto">
            {filter === 'all' 
              ? 'Create a study plan to generate your personalized daily tasks.'
              : `You don't have any ${filter} tasks right now.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`group bg-white rounded-2xl border border-base-200/60 p-5 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden ${
                task.status === 'completed' ? 'opacity-70 grayscale-[20%]' : ''
              }`}
            >
              {task.status === 'completed' && (
                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
              )}
              {task.status === 'missed' && (
                <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
              )}
              {task.status === 'pending' && (
                <div className="absolute top-0 left-0 w-1 h-full bg-primary-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              )}
              
              <div className="flex items-start gap-4">
                <div className={`mt-0.5 w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                   task.status === 'completed' ? 'bg-emerald-50 text-emerald-500' :
                   task.status === 'missed' ? 'bg-red-50 text-red-500' :
                   'bg-base-50 text-primary-500'
                }`}>
                  {getStatusIcon(task.status)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold text-[17px] leading-tight mb-1.5 ${
                    task.status === 'completed' ? 'text-base-400 line-through' : 'text-base-900'
                  }`}>
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-[13px] text-base-500 leading-relaxed mb-3">{task.description}</p>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-base-50 rounded-lg text-xs font-medium text-base-500">
                      <Calendar size={12} className="text-base-400" />
                      {formatDate(task.scheduled_time)}
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-base-50 rounded-lg text-xs font-medium text-base-500">
                      <Clock size={12} className="text-base-400" />
                      {formatTime(task.scheduled_time)}
                    </div>
                    <span className="px-2.5 py-1 bg-base-50 rounded-lg text-[11px] font-bold text-base-500 uppercase tracking-wide">
                      {task.duration_minutes} min
                    </span>
                    <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide border ${
                      task.priority === 'high' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                      task.priority === 'medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                      'bg-green-50 text-green-700 border-green-100'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  {task.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleCompleteTask(task.id)}
                        className="p-2.5 bg-white border border-base-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 rounded-xl transition-all shadow-sm"
                        title="Mark as complete"
                      >
                        <CheckCircle size={18} />
                      </button>
                      <button
                        onClick={() => handleMissTask(task.id)}
                        className="p-2.5 bg-white border border-base-200 text-orange-600 hover:bg-orange-50 hover:border-orange-200 rounded-xl transition-all shadow-sm"
                        title="Mark as missed"
                      >
                        <AlertCircle size={18} />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-2.5 bg-white border border-base-200 text-base-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 rounded-xl transition-all shadow-sm"
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