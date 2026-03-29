import { useState, useEffect, useRef } from 'react'
import { Send, Trash2, Bot, User, CheckCircle, Loader2 } from 'lucide-react'
import { api } from '../services/api'
import { toast } from 'react-hot-toast'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  metadata?: any
  created_at: string
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadHistory()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadHistory = async () => {
    try {
      const { history } = await api.getChatHistory()
      setMessages(history)
    } catch (error) {
      console.error('Failed to load chat history:', error)
    } finally {
      setInitialLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (e?: React.FormEvent, customMsg?: string) => {
    e?.preventDefault()
    const msg = customMsg || input
    if (!msg.trim() || loading) return

    if (!customMsg) setInput('')
    
    // Optimistic user message
    const tempUserMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: msg,
      created_at: new Date().toISOString()
    }
    setMessages(prev => [...prev, tempUserMsg])
    setLoading(true)

    try {
      const response = await api.sendMessage(msg)
      await loadHistory() // Reload to get real IDs and meta
      
      if (response.action === 'execute_plan') {
         toast.success('Study plan successfully created!')
      } else if (response.action === 'task_update') {
         toast.success('Task updated!')
      }
    } catch (error) {
      toast.error('Failed to send message')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleClearHistory = async () => {
    if (!confirm('Clear all conversation history?')) return
    try {
      await api.clearChatHistory()
      setMessages([])
      toast.success('Conversation cleared')
    } catch (error) {
      toast.error('Failed to clear history')
    }
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-primary-600" size={32} />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white">
            <Bot size={24} />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">SmartBud</h2>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Online & Ready to help
            </p>
          </div>
        </div>
        <button
          onClick={handleClearHistory}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="Clear session"
        >
          <Trash2 size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto">
            <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-4">
              <Bot size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Hey there! I'm SmartBud.</h3>
            <p className="text-gray-600">
              I'm your study partner. I can help you plan your learning, track your goals, and keep you motivated!
            </p>
            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              <button 
                onClick={() => setInput('I want to learn something new!')}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 border border-gray-200"
              >
                Plan a new goal 🎯
              </button>
              <button 
                onClick={() => setInput('How am I doing today?')}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 border border-gray-200"
              >
                Check progress 📈
              </button>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                  msg.role === 'user' ? 'bg-gray-200 text-gray-600' : 'bg-primary-600 text-white'
                }`}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className="space-y-2">
                  <div className={`p-3 rounded-2xl shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-primary-600 text-white rounded-tr-none' 
                      : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                  }`}>
                    {msg.content}
                  </div>
                  
                  {/* Action UI */}
                  {msg.metadata?.pending_plan && (
                    <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 space-y-3 mt-2">
                       <h4 className="font-bold text-primary-900 flex items-center gap-2">
                         <CheckCircle size={18} className="text-primary-600" />
                         Proposed Study Plan
                       </h4>
                       <div className="text-sm text-primary-800 space-y-1">
                          <p><strong>Goal:</strong> {msg.metadata.pending_plan.goal}</p>
                          <p><strong>Deadline:</strong> {msg.metadata.pending_plan.target_date}</p>
                          <p><strong>Daily:</strong> {msg.metadata.pending_plan.daily_available_time} min</p>
                       </div>
                       <div className="flex gap-2">
                          <button 
                            onClick={() => handleSendMessage(undefined, "Looks perfect, go ahead and create it!")}
                            className="flex-1 bg-primary-600 text-white text-sm py-2 rounded-lg hover:bg-primary-700 font-medium"
                          >
                            Yes, Create it!
                          </button>
                          <button 
                            onClick={() => handleSendMessage(undefined, "Let me adjust some details first.")}
                            className="flex-1 bg-white border border-primary-300 text-primary-600 text-sm py-2 rounded-lg hover:bg-primary-50"
                          >
                            Adjust
                          </button>
                       </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-primary-600 text-white">
                <Bot size={16} />
              </div>
              <div className="p-3 bg-gray-100 rounded-2xl rounded-tl-none flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer */}
      <form onSubmit={handleSendMessage} className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Talk to SmartBud..."
            className="w-full pl-4 pr-12 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2 top-1.5 p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
        <p className="text-[10px] text-gray-500 mt-2 text-center uppercase tracking-widest font-semibold">
          AI-Powered SmartBud Assistant • v1.0
        </p>
      </form>
    </div>
  )
}
