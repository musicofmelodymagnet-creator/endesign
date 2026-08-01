import React from 'react'
import type { DefaultServerCellComponentProps } from 'payload'

import { SUBMISSION_FIELD_LABELS } from './labels'

type SubmissionItem = { field: string; value: string }

const PREVIEW_FIELDS = ['name', 'phone', 'email']

export const SubmissionCell: React.FC<DefaultServerCellComponentProps> = ({ rowData }) => {
  const items = (rowData?.submissionData as SubmissionItem[] | undefined) || []

  const preview = PREVIEW_FIELDS.map((key) => items.find((item) => item.field === key))
    .filter((item): item is SubmissionItem => Boolean(item?.value))
    .map((item) => `${SUBMISSION_FIELD_LABELS[item.field] || item.field}: ${item.value}`)
    .join(' · ')

  return <span>{preview || `${items.length} полів`}</span>
}
