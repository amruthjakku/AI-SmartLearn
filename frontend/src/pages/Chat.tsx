import { useState, useEffect, useRef } from 'react'
import { Send, Trash2, Bot, CheckCircle, Loader2 } from 'lucide-react'
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
      <div className="flex flex-col items-center justify-center h-full">
        <Loader2 className="animate-spin text-base-300" size={32} />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full relative -mx-4 px-4">
      {/* Contextual Header */}
      <div className="flex items-center justify-between pb-4 mb-2 border-b border-base-200/50">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-base-100 flex items-center justify-center text-base-700">
              <Bot size={18} />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-base-50 rounded-full"></span>
          </div>
          <div>
            <h2 className="font-semibold text-sm text-base-900 leading-none">SmartBud AI</h2>
            <p className="text-[11px] text-base-500 mt-0.5">Always here to help</p>
          </div>
        </div>
        <button
          onClick={handleClearHistory}
          className="p-2 text-base-400 hover:text-red-500 hover:bg-red-50/50 rounded-full transition-all"
          title="Clear session"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto hide-scrollbar space-y-6 pb-32">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-[280px] mx-auto mt-12 animate-fade-in">
            <div className="w-16 h-16 bg-gradient-to-tr from-primary-100 to-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm transform -rotate-6">
              <Bot size={32} className="transform rotate-6" />
            </div>
            <h3 className="text-xl font-bold text-base-900 tracking-tight mb-2">How can I help you learn today?</h3>
            <p className="text-sm text-base-500 leading-relaxed mb-8">
              I can help you build study plans, explain complex topics, or track your progress.
            </p>
            <div className="flex flex-col gap-3 w-full">
              <button 
                onClick={() => setInput('I want to learn something new!')}
                className="w-full px-4 py-3 bg-white hover:bg-base-50 rounded-xl text-sm font-medium text-base-700 border border-base-200 shadow-sm transition-all text-left flex items-center gap-3"
              >
                <span className="text-xl">🎯</span> Plan a new goal
              </button>
              <button 
                onClick={() => setInput('How am I doing today?')}
                className="w-full px-4 py-3 bg-white hover:bg-base-50 rounded-xl text-sm font-medium text-base-700 border border-base-200 shadow-sm transition-all text-left flex items-center gap-3"
              >
                <span className="text-xl">📈</span> Check my progress
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 mt-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex w-full animate-slide-up ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-[88%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-600 to-primary-400 text-white flex-shrink-0 flex items-center justify-center shadow-sm mt-1">
                      <Bot size={16} />
                    </div>
                  )}
                  <div className="space-y-2">
                    <div className={`px-4 py-3 text-[15px] leading-relaxed shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-base-900 text-white rounded-2xl rounded-tr-sm' 
                        : 'bg-white border border-base-200/60 text-base-800 rounded-2xl rounded-tl-sm'
                    }`}>
                      {msg.content}
                    </div>
                    
                    {/* Action UI for Pending Plans */}
                    {msg.metadata?.pending_plan && (
                      <div className="bg-white border border-primary-200/60 rounded-2xl p-4 shadow-sm space-y-4 mt-2">
                         <h4 className="font-semibold text-base-900 flex items-center gap-2 text-sm">
                           <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                             <CheckCircle size={14} />
                           </div>
                           Proposed Study Plan
                         </h4>
                         <div className="bg-base-50 rounded-xl p-3 text-[13px] text-base-600 space-y-2 font-medium">
                            <p className="flex justify-between"><span className="text-base-400">Goal</span> <span className="text-base-900">{msg.metadata.pending_plan.goal}</span></p>
                            <p className="flex justify-between"><span className="text-base-400">Deadline</span> <span className="text-base-900">{msg.metadata.pending_plan.target_date}</span></p>
                            <p className="flex justify-between"><span className="text-base-400">Daily Time</span> <span className="text-base-900">{msg.metadata.pending_plan.daily_available_time} min</span></p>
                         </div>
                         <div className="flex gap-2 pt-1">
                            <button 
                              onClick={() => handleSendMessage(undefined, "Looks perfect, go ahead and create it!")}
                              className="flex-1 bg-base-900 text-white text-sm py-2.5 rounded-xl hover:bg-base-800 font-medium transition-colors"
                            >
                              Confirm Plan
                            </button>
                            <button 
                              onClick={() => handleSendMessage(undefined, "Let me adjust some details first.")}
                              className="flex-1 bg-white border border-base-200 text-base-700 text-sm py-2.5 rounded-xl hover:bg-base-50 font-medium transition-colors"
                            >
                              Adjust
                            </button>
                         </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start animate-fade-in">
                <div className="flex gap-3 max-w-[85%]">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-600 to-primary-400 text-white flex-shrink-0 flex items-center justify-center shadow-sm">
                    <Bot size={16} />
                  </div>
                  <div className="px-4 py-3.5 bg-white border border-base-200/60 rounded-2xl rounded-tl-sm flex items-center gap-1.5 shadow-sm">
                    <span className="w-1.5 h-1.5 bg-base-300 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-base-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-base-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        )}
      </div>

      {/* Floating Input Area */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-base-50 via-base-50 to-transparent pt-12 pb-4">
        <form onSubmit={handleSendMessage} className="relative max-w-lg mx-auto">
          <div className="relative flex items-center bg-white border border-base-200 shadow-glass rounded-2xl overflow-hidden transition-all focus-within:border-base-300 focus-within:shadow-md">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message SmartBud..."
              className="w-full pl-5 pr-14 py-4 bg-transparent outline-none text-[15px] placeholder:text-base-400 text-base-900"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="absolute right-2 p-2.5 bg-base-900 text-white rounded-xl hover:bg-black disabled:opacity-30 disabled:hover:bg-base-900 transition-all active:scale-95"
            >
              <Send size={18} className="transform translate-x-[1px] translate-y-[-1px]"/>
            </button>
          </div>
          <p className="text-[10px] text-center text-base-400 mt-3 font-medium tracking-wide">
            SMARTBUD AI CAN MAKE MISTAKES. VERIFY IMPORTANT INFO.
          </p>
        </form>
      </div>
    </div>
  )
}
