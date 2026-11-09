import React, { useState, useRef, useEffect } from 'react'
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  AlertCircle,
  Phone,
} from 'lucide-react'
import api from '../../lib/api'

interface Message {
  id: string
  role: 'user' | 'bot'
  content: string
  timestamp: Date
}

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'bot',
  content:
    "Hello! I'm BOTANIQUE's botanical assistant. I can help you find the right product for your skincare routine, answer questions about our ingredients, or guide you through our collection. How can I help you today?",
  timestamp: new Date(),
}

const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [escalated, setEscalated] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || isLoading) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      const { data } = await api.post('/chatbot/message', {
        message: text,
        history: messages.slice(-6).map((m) => ({
          role: m.role,
          content: m.content,
        })),
      })

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: data.reply || data.message || 'I\'m here to help. Could you rephrase your question?',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botMsg])
    } catch {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content:
          "I'm having trouble connecting right now. Please try again in a moment, or contact us directly.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleEscalate = () => {
    const escalateMsg: Message = {
      id: Date.now().toString(),
      role: 'bot',
      content:
        'Of course! To speak with our team, please visit our Contact page or use the email listed there. Our team typically responds within 1–2 business days.',
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, escalateMsg])
    setEscalated(true)
  }

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed bottom-20 right-4 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl
                     border border-beige z-50 flex flex-col overflow-hidden animate-fade-in"
          style={{ maxHeight: '70vh', minHeight: '400px' }}
          role="dialog"
          aria-label="BOTANIQUE Chat Assistant"
        >
          {/* Header */}
          <div className="bg-forest text-cream px-5 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-cream/20 rounded-full flex items-center justify-center">
                <Bot size={16} className="text-cream" />
              </div>
              <div>
                <p className="text-sm font-semibold">BOTANIQUE Assistant</p>
                <p className="text-xs text-cream/70">Usually replies instantly</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-cream/10 rounded-full transition-colors"
              aria-label="Close chat"
            >
              <X size={16} />
            </button>
          </div>

          {/* Disclaimer */}
          <div className="bg-amber-50 border-b border-amber-100 px-4 py-2 flex items-start gap-2 shrink-0">
            <AlertCircle size={12} className="text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-700 leading-snug">
              AI responses are for general guidance only and not medical advice.
            </p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === 'user' ? 'bg-forest' : 'bg-beige'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <User size={13} className="text-cream" />
                  ) : (
                    <Bot size={13} className="text-forest" />
                  )}
                </div>
                <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  <div
                    className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-forest text-cream rounded-tr-sm'
                        : 'bg-cream text-charcoal rounded-tl-sm border border-beige'
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-sage/60 px-1">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 bg-beige rounded-full flex items-center justify-center shrink-0">
                  <Bot size={13} className="text-forest" />
                </div>
                <div className="bg-cream rounded-2xl rounded-tl-sm border border-beige px-4 py-3">
                  <div className="flex gap-1 items-center">
                    <div className="w-1.5 h-1.5 bg-sage rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-sage rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-sage rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Escalation */}
          {!escalated && (
            <div className="px-4 pb-2 shrink-0">
              <button
                onClick={handleEscalate}
                className="flex items-center gap-2 text-xs text-sage hover:text-forest transition-colors"
              >
                <Phone size={11} />
                Talk to a human
              </button>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-beige px-4 py-3 flex items-center gap-3 shrink-0 bg-white">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about our products…"
              className="flex-1 text-sm bg-cream rounded-full px-4 py-2.5 outline-none border border-beige
                         focus:border-forest transition-colors placeholder-sage/60"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="w-9 h-9 bg-forest text-cream rounded-full flex items-center justify-center
                         hover:bg-opacity-80 transition-all disabled:opacity-40 shrink-0"
              aria-label="Send message"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 w-14 h-14 bg-forest text-cream rounded-full shadow-lg
                   flex items-center justify-center hover:scale-105 transition-all z-50
                   hover:shadow-forest/30 hover:shadow-xl"
        aria-label={isOpen ? 'Close chat' : 'Open chat assistant'}
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </>
  )
}

export default ChatbotWidget
