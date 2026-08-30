import React from 'react'
import { Building2 } from 'lucide-react'

export function Logo({ light = false }) {
  return (
    <div className={`logo ${light ? 'logo-light' : ''}`}>
      <span className="logo-mark"><Building2 size={18} strokeWidth={2.4} /></span>
      <span>Property<span>Hub</span></span>
    </div>
  )
}
