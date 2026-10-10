import { useEffect } from 'react'

export default function Modal({ title, cor = 'var(--ac)', onClose, children }) {
  useEffect(() => {
    const h = e => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])
  return (
    <div className="ov" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="md" role="dialog" aria-modal="true" style={{ '--mc': cor }}>
        <div className="mh"><h2>{title}</h2><button className="xb" onClick={onClose}>✕</button></div>
        {children}
      </div>
    </div>
  )
}
