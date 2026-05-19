import { useCallback, useEffect, useState } from 'react'

export default function BackToTop({ scrollRef }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const container = scrollRef?.current
    if (!container) return undefined

    const handleScroll = () => {
      setVisible(container.scrollTop > 400)
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [scrollRef])

  const scrollToTop = useCallback(() => {
    scrollRef?.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [scrollRef])

  if (!visible) return null

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      className="focus-ring fixed bottom-5 right-5 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg shadow-primary-600/30 transition hover:bg-primary-500"
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
      </svg>
    </button>
  )
}
