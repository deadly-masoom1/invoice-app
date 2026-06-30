'use client'
import { useEffect, useState } from 'react'

export default function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 })
  const [hovering, setHovering] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function move(e: MouseEvent) {
      setPos({ x: e.clientX, y: e.clientY })
      setVisible(true)
      const target = e.target as HTMLElement
      const isInteractive = target.closest('button, a, input, select, textarea, [role="button"]')
      setHovering(!!isInteractive)
    }
    function leave() { setVisible(false) }

    window.addEventListener('mousemove', move)
    document.addEventListener('mouseleave', leave)
    return () => {
      window.removeEventListener('mousemove', move)
      document.removeEventListener('mouseleave', leave)
    }
  }, [])

  return (
    <>
      <style>{`
        @media (hover: hover) and (pointer: fine) {
          * { cursor: none !important; }
        }
      `}</style>
      <div
        style={{
          position: 'fixed',
          left: pos.x,
          top: pos.y,
          width: hovering ? 36 : 16,
          height: hovering ? 36 : 16,
          borderRadius: '50%',
          background: hovering ? 'rgba(99,102,241,0.15)' : 'var(--accent)',
          border: hovering ? '1.5px solid var(--accent)' : 'none',
          pointerEvents: 'none',
          transform: 'translate(-50%, -50%)',
          transition: 'width 0.15s ease, height 0.15s ease, background 0.15s ease, opacity 0.15s ease',
          zIndex: 9999,
          opacity: visible ? 1 : 0,
          mixBlendMode: hovering ? 'normal' : 'normal',
        }}
      />
    </>
  )
}
