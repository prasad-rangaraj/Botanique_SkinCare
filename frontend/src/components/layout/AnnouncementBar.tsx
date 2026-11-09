import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import api from '../../lib/api'
import { SiteSettings } from '../../types'

const DEFAULT_MESSAGES = [
  'Free shipping on orders above ₹999 · Use code BOTANICAL10 for 10% off your first order',
  'Thoughtfully formulated · Patch test recommended before use',
  'New arrivals: Rose Hip Face Oil & Neem-Tulsi Face Wash now available',
]

const AnnouncementBar: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDismissed, setIsDismissed] = useState(false)

  const { data: settings } = useQuery<SiteSettings>({
    queryKey: ['site-settings-public'],
    queryFn: async () => {
      const { data } = await api.get('/settings/public')
      return data
    },
    staleTime: 1000 * 60 * 10,
    retry: false,
  })

  const messages =
    settings?.announcementText
      ? [settings.announcementText]
      : DEFAULT_MESSAGES

  const enabled = settings?.announcementEnabled !== false

  useEffect(() => {
    if (messages.length <= 1) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [messages.length])

  if (isDismissed || !enabled) return null

  const prev = () => setCurrentIndex((i) => (i - 1 + messages.length) % messages.length)
  const next = () => setCurrentIndex((i) => (i + 1) % messages.length)

  return (
    <div className="bg-forest text-cream py-2 px-4 relative z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {messages.length > 1 && (
          <button
            onClick={prev}
            className="shrink-0 p-1 hover:opacity-70 transition-opacity"
            aria-label="Previous announcement"
          >
            <ChevronLeft size={14} />
          </button>
        )}

        <p className="flex-1 text-center text-xs tracking-wide font-medium leading-relaxed">
          {messages[currentIndex]}
        </p>

        <div className="flex items-center gap-2 shrink-0">
          {messages.length > 1 && (
            <button
              onClick={next}
              className="p-1 hover:opacity-70 transition-opacity"
              aria-label="Next announcement"
            >
              <ChevronRight size={14} />
            </button>
          )}
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 hover:opacity-70 transition-opacity"
            aria-label="Dismiss announcement"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {messages.length > 1 && (
        <div className="flex justify-center gap-1 mt-1">
          {messages.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-1 h-1 rounded-full transition-all ${
                i === currentIndex ? 'bg-cream w-3' : 'bg-cream/40'
              }`}
              aria-label={`Go to announcement ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default AnnouncementBar
