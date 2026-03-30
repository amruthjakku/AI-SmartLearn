import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { Plus, BookOpen, Calendar, Clock, Trash2, Eye, Loader2 } from 'lucide-react'
import { api } from '../services/api'

interface StudyPlan {
  id: string
  title: string
  description: string
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
      setPlans(response.plans || [])
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
      <div className="flex flex-col items-center justify-center min-h-[50vh] animate-fade-in">
        <div className="w-12 h-12 rounded-2xl bg-base-100 flex items-center justify-center animate-pulse">
          <Loader2 className="animate-spin text-base-400" size={24} />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-2xl mx-auto">
      <div className="flex items-center justify-between pb-4 border-b border-base-200/50">
        <div>
          <h2 className="text-2xl font-bold text-base-900 tracking-tight">Study Plans</h2>
          <p className="text-sm text-base-500 mt-1">Your personalized AI learning paths</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-base-900 text-white rounded-xl hover:bg-black transition-all active:scale-95 text-sm font-medium shadow-sm"
        >
          <Plus size={16} />
          New Plan
        </button>
      </div>

      {!plans || plans.length === 0 ? (
        <div className="bg-white rounded-3xl border border-base-200/60 p-12 text-center shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-400 to-primary-600 opacity-20"></div>
          <div className="w-20 h-20 bg-base-50 rounded-full flex items-center justify-center mx-auto mb-6 text-base-300">
            <BookOpen size={40} className="transform -rotate-6" />
          </div>
          <h3 className="text-xl font-semibold text-base-900 mb-2 tracking-tight">No learning paths yet</h3>
          <p className="text-base-500 mb-8 max-w-sm mx-auto">Let SmartBud create a perfectly optimized learning journey based on your goals and schedule.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-base-200 text-base-900 rounded-xl hover:bg-base-50 transition-all font-medium shadow-sm"
          >
            <Plus size={18} />
            Generate First Plan
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="group bg-white rounded-2xl border border-base-200/60 p-5 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-400 to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex flex-col h-full justify-between gap-4">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                      plan.status === 'active' ? 'bg-primary-50 text-primary-700' :
                      plan.status === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                      'bg-base-100 text-base-600'
                    }`}>
                      {plan.status}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleViewPlan(plan.id)}
                        className="p-1.5 text-base-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleDeletePlan(plan.id)}
                        className="p-1.5 text-base-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-semibold text-base-900 text-lg leading-tight mt-3">{plan.title}</h3>
                </div>
                
                <div className="flex items-center gap-2 text-xs font-medium text-base-500 bg-base-50 px-3 py-2 rounded-xl mt-2 w-fit">
                  <Calendar size={14} className="text-base-400" />
                  {plan.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-base-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up hide-scrollbar">
            <div className="p-6 border-b border-base-200/50 sticky top-0 bg-white/90 backdrop-blur-md z-10 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold tracking-tight text-base-900">Craft Learning Path</h3>
                <p className="text-sm text-base-500 mt-0.5">Tell SmartBud what you want to achieve</p>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 flex items-center justify-center bg-base-100 text-base-500 rounded-full hover:bg-base-200 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-[13px] font-semibold text-base-700 mb-1.5 uppercase tracking-wide">
                    The Goal *
                  </label>
                  <input
                    type="text"
                    value={formData.goal}
                    onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-base-50 border border-base-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-base-900 focus:border-transparent transition-all placeholder:text-base-400 text-base-900 text-[15px]"
                    placeholder="e.g., Master React Fundamentals"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-semibold text-base-700 mb-1.5 uppercase tracking-wide">
                      Deadline *
                    </label>
                    <input
                      type="date"
                      value={formData.target_date}
                      onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 bg-base-50 border border-base-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-base-900 focus:border-transparent transition-all text-base-900 text-[15px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-base-700 mb-1.5 uppercase tracking-wide">
                      Daily Time (min)
                    </label>
                    <input
                      type="number"
                      value={formData.daily_available_time}
                      onChange={(e) => setFormData({ ...formData, daily_available_time: parseInt(e.target.value) })}
                      min={15}
                      max={480}
                      className="w-full px-4 py-3 bg-base-50 border border-base-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-base-900 focus:border-transparent transition-all text-base-900 text-[15px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-base-700 mb-1.5 uppercase tracking-wide">
                    Skill Level
                  </label>
                  <select
                    value={formData.skill_level}
                    onChange={(e) => setFormData({ ...formData, skill_level: e.target.value })}
                    className="w-full px-4 py-3 bg-base-50 border border-base-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-base-900 focus:border-transparent transition-all text-base-900 text-[15px] appearance-none"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-base-700 mb-1.5 uppercase tracking-wide text-green-700">
                    Strengths
                  </label>
                  <input
                    type="text"
                    value={formData.strengths}
                    onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
                    className="w-full px-4 py-3 bg-base-50 border border-base-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all placeholder:text-base-400 text-base-900 text-[15px]"
                    placeholder="e.g., math, visuals (comma separated)"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-base-700 mb-1.5 uppercase tracking-wide text-orange-700">
                    Weaknesses
                  </label>
                  <input
                    type="text"
                    value={formData.weaknesses}
                    onChange={(e) => setFormData({ ...formData, weaknesses: e.target.value })}
                    className="w-full px-4 py-3 bg-base-50 border border-base-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all placeholder:text-base-400 text-base-900 text-[15px]"
                    placeholder="e.g., reading long text, theory"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-base-700 mb-1.5 uppercase tracking-wide">
                    Extra Notes
                  </label>
                  <textarea
                    value={formData.additional_notes}
                    onChange={(e) => setFormData({ ...formData, additional_notes: e.target.value })}
                    className="w-full px-4 py-3 bg-base-50 border border-base-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-base-900 focus:border-transparent transition-all placeholder:text-base-400 text-base-900 text-[15px] resize-none"
                    rows={3}
                    placeholder="Any specific tools or formats?"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t border-base-200/50">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3.5 px-4 bg-white border border-base-200 text-base-700 font-medium rounded-xl hover:bg-base-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-3.5 px-4 bg-base-900 text-white font-medium rounded-xl hover:bg-black transition-colors disabled:opacity-50 flex justify-center items-center gap-2 relative overflow-hidden group"
                >
                  {creating ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Designing...
                    </>
                  ) : (
                    <>
                      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <span className="relative z-10">Generate Plan with AI</span>
                      <span className="relative z-10">✨</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Plan Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-base-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up hide-scrollbar relative">
            <div className="sticky top-0 bg-white/90 backdrop-blur-md z-10 p-6 border-b border-base-200/50">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="text-[10px] font-bold tracking-widest text-primary-600 uppercase mb-2 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse"></span>
                    AI Learning Path
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight text-base-900 leading-tight">{selectedPlan.title}</h3>
                </div>
                <button 
                  onClick={() => setSelectedPlan(null)}
                  className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-base-100 text-base-500 rounded-full hover:bg-base-200 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 pb-24">
              <div className="space-y-4">
                {selectedPlan.tasks?.map((task: any, index: number) => (
                  <div key={index} className="bg-base-50 rounded-2xl p-4 border border-base-200/40 hover:border-base-300 transition-colors">
                    <div className="flex justify-between items-start mb-2 gap-4">
                      <h4 className="font-semibold text-base-900 leading-snug">{task.title}</h4>
                      <span className="flex-shrink-0 px-2.5 py-1 bg-white border border-base-200 rounded-md text-[10px] font-bold text-base-500 uppercase">
                        Day {task.day_number}
                      </span>
                    </div>
                    <p className="text-[13px] text-base-600 leading-relaxed">{task.description}</p>
                    <div className="flex items-center gap-1.5 mt-4 text-[11px] font-semibold text-base-500 uppercase tracking-wide">
                      <Clock size={12} className="text-primary-500" />
                      {task.duration_minutes} Minutes
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-white via-white to-transparent pt-12">
              <button
                onClick={() => setSelectedPlan(null)}
                className="w-full py-3.5 px-4 bg-base-900 text-white font-medium rounded-xl hover:bg-black transition-colors shadow-sm"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}