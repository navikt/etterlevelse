'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

interface IStickyHorizontalScrollProps {
  children: React.ReactNode
  className?: string
}

const isBrowser = typeof window !== 'undefined'

export const StickyHorizontalScroll = ({ children, className }: IStickyHorizontalScrollProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const fakeScrollRef = useRef<HTMLDivElement>(null)
  const [scrollWidth, setScrollWidth] = useState(0)
  const [clientWidth, setClientWidth] = useState(0)
  const [left, setLeft] = useState(0)
  const [visible, setVisible] = useState(false)
  const syncing = useRef(false)

  const updateDimensions = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setScrollWidth(el.scrollWidth)
    setClientWidth(el.clientWidth)
    setLeft(el.getBoundingClientRect().left)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    updateDimensions()
    const observer = new ResizeObserver(updateDimensions)
    observer.observe(el)
    window.addEventListener('scroll', updateDimensions, true)
    window.addEventListener('resize', updateDimensions)
    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', updateDimensions, true)
      window.removeEventListener('resize', updateDimensions)
    }
  }, [updateDimensions])

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0,
    })
    observer.observe(wrapper)
    return () => observer.disconnect()
  }, [])

  const handleScrollContent = () => {
    if (syncing.current) return
    syncing.current = true
    if (fakeScrollRef.current && scrollRef.current) {
      fakeScrollRef.current.scrollLeft = scrollRef.current.scrollLeft
    }
    syncing.current = false
  }

  const handleFakeScroll = () => {
    if (syncing.current) return
    syncing.current = true
    if (scrollRef.current && fakeScrollRef.current) {
      scrollRef.current.scrollLeft = fakeScrollRef.current.scrollLeft
    }
    syncing.current = false
  }

  const needsScroll = scrollWidth > clientWidth

  return (
    <div ref={wrapperRef} className={className}>
      <div
        ref={scrollRef}
        onScroll={handleScrollContent}
        style={{ overflow: 'auto', maxHeight: '80vh' }}
      >
        {children}
      </div>
      {isBrowser &&
        visible &&
        needsScroll &&
        createPortal(
          <div
            ref={fakeScrollRef}
            onScroll={handleFakeScroll}
            className='sticky-fake-scrollbar'
            style={{
              overflowX: 'scroll',
              position: 'fixed',
              bottom: 0,
              left: left,
              width: clientWidth,
              zIndex: 9999,
            }}
          >
            <div style={{ width: scrollWidth, height: 1 }} />
          </div>,
          document.body
        )}
    </div>
  )
}
