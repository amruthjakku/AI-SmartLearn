import { supabase } from './supabase'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

interface RequestOptions {
  method?: string
  headers?: Record<string, string>
  body?: any
}

class ApiService {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async getAuthToken(): Promise<string | null> {
    const { data } = await supabase.auth.getSession()
    return data.session?.access_token || null
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', headers = {}, body } = options

    const token = await this.getAuthToken()
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    }

    const config: RequestInit = {
      method,
      headers: defaultHeaders,
      ...(body ? { body: JSON.stringify(body) } : {}),
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, config)

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'An error occurred' }))
      throw new Error(error.detail || 'An error occurred')
    }

    return response.json()
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request<{ access_token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: { email, password },
    })
  }

  async register(email: string, password: string, name: string) {
    return this.request<{ access_token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: { email, password, name },
    })
  }

  // User endpoints
  async getProfile() {
    return this.request<any>('/users/profile')
  }

  async updateProfile(data: any) {
    return this.request<any>('/users/profile', {
      method: 'PUT',
      body: data,
    })
  }

  async getUserStats() {
    return this.request<any>('/users/stats')
  }

  // Study Plans endpoints
  async generatePlan(data: {
    goal: string
    target_date: string
    daily_available_time: number
    skill_level: string
    strengths?: string[]
    weaknesses?: string[]
    additional_notes?: string
  }) {
    return this.request<{ message: string; plan: any }>('/plans/generate', {
      method: 'POST',
      body: data,
    })
  }

  async getPlans() {
    return this.request<{ plans: any[] }>('/plans')
  }

  async getPlan(planId: string) {
    return this.request<any>(`/plans/${planId}`)
  }

  async updatePlanStatus(planId: string, status: string) {
    return this.request<any>(`/plans/${planId}/status?status=${status}`, {
      method: 'PUT',
    })
  }

  async deletePlan(planId: string) {
    return this.request<{ message: string }>(`/plans/${planId}`, {
      method: 'DELETE',
    })
  }

  async adjustPlan(planId: string, progressData: any) {
    return this.request<{ message: string; plan: any }>(`/plans/${planId}/adjust`, {
      method: 'POST',
      body: progressData,
    })
  }

  // Tasks endpoints
  async createTask(data: {
    title: string
    description?: string
    scheduled_time?: string
    duration_minutes: number
    priority: string
    study_plan_id?: string
  }) {
    return this.request<{ message: string; task: any }>('/tasks', {
      method: 'POST',
      body: data,
    })
  }

  async getTasks(params?: { status?: string; priority?: string; date?: string }) {
    const query = new URLSearchParams()
    if (params?.status) query.set('status', params.status)
    if (params?.priority) query.set('priority', params.priority)
    if (params?.date) query.set('date', params.date)
    
    const queryString = query.toString()
    return this.request<{ tasks: any[] }>(`/tasks${queryString ? `?${queryString}` : ''}`)
  }

  async getTodayTasks() {
    return this.request<{ tasks: any[]; date: string }>('/tasks/today')
  }

  async getUpcomingTasks(days: number = 7) {
    return this.request<{ tasks: any[] }>(`/tasks/upcoming?days=${days}`)
  }

  async getTask(taskId: string) {
    return this.request<any>(`/tasks/${taskId}`)
  }

  async updateTask(taskId: string, data: any) {
    return this.request<{ message: string; task: any }>(`/tasks/${taskId}`, {
      method: 'PUT',
      body: data,
    })
  }

  async completeTask(taskId: string) {
    return this.request<{ message: string; task: any }>(`/tasks/${taskId}/complete`, {
      method: 'POST',
    })
  }

  async missTask(taskId: string) {
    return this.request<{ message: string; task: any }>(`/tasks/${taskId}/miss`, {
      method: 'POST',
    })
  }

  async rescheduleTask(taskId: string, newTime: string) {
    return this.request<{ message: string; task: any }>(`/tasks/${taskId}/reschedule?new_time=${newTime}`, {
      method: 'POST',
    })
  }

  async deleteTask(taskId: string) {
    return this.request<{ message: string }>(`/tasks/${taskId}`, {
      method: 'DELETE',
    })
  }

  // Chat endpoints
  async getChatHistory() {
    return this.request<{ history: any[] }>('/chat/history')
  }

  async sendMessage(message: string) {
    return this.request<any>('/chat/message', {
      method: 'POST',
      body: { message },
    })
  }

  async clearChatHistory() {
    return this.request<{ message: string }>('/chat/history', {
      method: 'DELETE',
    })
  }
}

export const api = new ApiService(API_BASE_URL)