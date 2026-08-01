import React, { Fragment } from 'react'

/** Splits `"...**accent**..."` into plain text + an amber-highlighted <span>. */
export function highlightAccent(text: string): React.ReactNode {
  const parts = text.split(/\*\*(.+?)\*\*/g)
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className="text-primary">
        {part}
      </span>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  )
}
