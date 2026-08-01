import React from 'react'
import type { UIFieldServerProps } from 'payload'

import { SUBMISSION_FIELD_LABELS } from './labels'

type SubmissionItem = { field: string; value: string }

export const SubmissionPreview: React.FC<UIFieldServerProps> = ({ data }) => {
  const items = (data?.submissionData as SubmissionItem[] | undefined) || []

  if (items.length === 0) return null

  return (
    <div
      style={{
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: 4,
        marginBottom: 'var(--base)',
        overflow: 'hidden',
      }}
    >
      {items.map((item, i) => (
        <div
          key={`${item.field}-${i}`}
          style={{
            background: i % 2 === 0 ? 'var(--theme-elevation-50)' : 'transparent',
            borderTop: i === 0 ? 'none' : '1px solid var(--theme-elevation-100)',
            display: 'grid',
            gap: 16,
            gridTemplateColumns: '220px 1fr',
            padding: '10px 16px',
          }}
        >
          <div style={{ fontWeight: 600 }}>{SUBMISSION_FIELD_LABELS[item.field] || item.field}</div>
          <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{item.value || '—'}</div>
        </div>
      ))}
    </div>
  )
}
