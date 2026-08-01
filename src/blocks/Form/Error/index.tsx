'use client'

import * as React from 'react'
import { useFormContext } from 'react-hook-form'

import { getDictionary } from '@/i18n/dictionary'
import type { Locale } from '@/i18n/config'

export const Error = ({ name, locale = 'uk' }: { name: string; locale?: Locale }) => {
  const {
    formState: { errors },
  } = useFormContext()
  const t = getDictionary(locale)

  return (
    <div className="text-destructive mt-2 text-sm">
      {(errors[name]?.message as string) || t.form.required}
    </div>
  )
}
