"use client"

import React, { useRef, useState, useEffect } from 'react'

export default function AccessibleAccordion({
  title,
  children,
  defaultOpen = false,
  className = '',
}: {
  title: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
  className?: string
}) {
  const [open, setOpen] = useState(defaultOpen)
  const ref = useRef<HTMLDivElement | null>(null)
  const [maxH, setMaxH] = useState<string>('0px')

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (open) {
      const h = el.scrollHeight
      // add small buffer
      setMaxH(h + 24 + 'px')
    } else {
      setMaxH('0px')
    }
  }, [open, children])

  return (
    <div className={`w-full ${className}`}>
      <button
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left flex items-center justify-between py-2 cursor-pointer"
      >
        <span className="font-semibold">{title}</span>
        <span className="ml-2 text-gray-500">{open ? '−' : '+'}</span>
      </button>

      <div
        ref={ref}
        style={{ maxHeight: maxH }}
        className="overflow-hidden transition-[max-height] duration-300 ease-[cubic-bezier(.2,.8,.2,1)]"
      >
        <div className="pt-2 pb-4">
          {children}
        </div>
      </div>
    </div>
  )
}
