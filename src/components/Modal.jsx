import React from 'react'
import { X } from 'lucide-react'

export function Modal({ open, onClose, title, subtitle, children }) {
  if (!open) return null
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={e => e.stopPropagation()}>
        <div className="modal-head">
          <div><h3>{title}</h3>{subtitle && <p>{subtitle}</p>}</div>
          <button className="icon-btn" onClick={onClose}><X size={19} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}
