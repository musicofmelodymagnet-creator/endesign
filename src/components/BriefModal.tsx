'use client'

import type { Form as FormType } from '@payloadcms/plugin-form-builder/types'
import { X } from 'lucide-react'
import React, { useEffect } from 'react'

import { FormBlock } from '@/blocks/Form/Component'
import { useBrief } from '@/providers/Brief'
import type { Locale } from '@/i18n/config'

export const BriefModal: React.FC<{ form: FormType | null; locale?: Locale }> = ({ form, locale }) => {
  const { isOpen, close } = useBrief()

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, close])

  if (!form || !isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto py-10">
      <div
        aria-hidden
        onClick={close}
        className="bg-foreground/70 fixed inset-0 backdrop-blur-sm"
      />
      <div className="relative container flex min-h-full items-start justify-center">
        <div className="bg-background relative w-full max-w-2xl rounded-3xl p-2 shadow-2xl">
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="border-border/60 bg-background hover:border-primary absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="py-6">
            <FormBlock form={form} enableIntro={false} locale={locale} />
          </div>
        </div>
      </div>
    </div>
  )
}
