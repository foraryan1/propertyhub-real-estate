import React from 'react'

export function StatusBadge({ status }) {
  const cls = status.toLowerCase().replace(/\s/g, '-')
  return <span className={`status-badge ${cls}`}><i />{status}</span>
}
