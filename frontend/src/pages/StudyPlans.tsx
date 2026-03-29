import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { Plus, BookOpen, Calendar, Clock, Trash2, Eye } from 'lucide-react'
import { api } from '../services/api'

interface StudyPlan {
  id: string
  goal: string
  target_date: string
  status: string
  created_at: string
}

export default function StudyPlans() {
  const [plans, setPlans] = useState<StudyPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<any>(null)

  const [formData, setFormData] = useState({
    goal: '',
    target_date: '',
    daily_available_time: 60,
    skill_level: 'intermediate',
    strengths: '',
    weaknesses: '',
    additional_notes: ''
  })

  useEffect(() => {
    loadPlans()
  }, [])

  const loadPlans = async () => {
    try {
      const response = await api.getPlans()
      setPlans(response.plans)
    } catch (error) {
      console.error('Failed to load plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)

    try {
      await api.generatePlan({
        goal: formData.goal,
        target_date: formData.target_date,
        daily_available_time: formData.daily_available_time,
        skill_level: formData.skill_level,
        strengths: formData.strengths ? formData.strengths.split(',').map(s => s.trim()) : undefined,
        weaknesses: formData.weaknesses ? formData.weaknesses.split(',').map(s => s.trim()) : undefined,
        additional_notes: formData.additional_notes || undefined
      })

      setShowCreateModal(false)
      toast.success('Study plan created successfully!')
      setFormData({
        goal: '',
        target_date: '',
        daily_available_time: 60,
        skill_level: 'intermediate',
        strengths: '',
        weaknesses: '',
        additional_notes: ''
      })
      loadPlans()
    } catch (error) {
      console.error('Failed to create plan:', error)
      toast.error('Failed to create study plan')
    } finally {
      setCreating(false)
    }
  }

  const handleViewPlan = async (planId: string) => {
    try {
      const plan = await api.getPlan(planId)
      setSelectedPlan(plan)
    } catch (error) {
      console.error('Failed to load plan:', error)
    }
  }

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) return
    
    try {
      await api.deletePlan(planId)
      toast.success('Study plan deleted')
      loadPlans()
    } catch (error) {
      console.error('Failed to delete plan:', error)
      toast.error('Failed to delete plan')
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
        <h2 className="text-2xl font-bold text-gray-900">Study Plans</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          <Plus size={18} />
          New Plan
        </button>
      </div>

      {plans.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <BookOpen className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No study plans yet</h3>
          <p className="text-gray-600 mb-4">Create your first AI-powered study plan</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            <Plus size={18} />
            Create Plan
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white rounded-lg border border-gray-200 p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{plan.goal}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {new Date(plan.target_date).toLocaleDateString()}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      plan.status === 'active' ? 'bg-green-100 text-green-700' :
                      plan.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {plan.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleViewPlan(plan.id)}
                    className="p-2 text-gray-500 hover:bg-gray-50 rounded-full"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={() => handleDeletePlan(plan.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Create Study Plan</h3>
              <p className="text-sm text-gray-600">AI will generate a personalized plan for you</p>
            </div>

            <form onSubmit={handleCreatePlan} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Learning Goal *
                </label>
                <input
                  type="text"
                  value={formData.goal}
                  onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., Learn Python programming"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Date *
                </label>
                <input
                  type="date"
                  value={formData.target_date}
                  onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Daily Available Time (minutes)
                </label>
                <input
                  type="number"
                  value={formData.daily_available_time}
                  onChange={(e) => setFormData({ ...formData, daily_available_time: parseInt(e.target.value) })}
                  min={15}
                  max={480}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skill Level
                </label>
                <select
                  value={formData.skill_level}
                  onChange={(e) => setFormData({ ...formData, skill_level: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Strengths (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.strengths}
                  onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., good at math, quick learner"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weaknesses (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.weaknesses}
                  onChange={(e) => setFormData({ ...formData, weaknesses: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., struggles with theory"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes
                </label>
                <textarea
                  value={formData.additional_notes}
                  onChange={(e) => setFormData({ ...formData, additional_notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={3}
                  placeholder="Any other preferences or requirements..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-2 px-4 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Plan Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">{selectedPlan.goal}</h3>
              <p className="text-sm text-gray-600">AI-Generated Study Plan</p>
            </div>

            <div className="p-4">
              <div className="space-y-4">
                {selectedPlan.tasks?.map((task: any, index: number) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3">
                    <h4 className="font-medium text-gray-900">{task.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {task.duration_minutes} min
                      </span>
                      <span>Day {task.day_number}</span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setSelectedPlan(null)}
                className="w-full mt-4 py-2 px-4 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}