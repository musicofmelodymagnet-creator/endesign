import type { EmailField } from '@payloadcms/plugin-form-builder/types'
import type { FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React from 'react'

import { Error } from '../Error'
import { Width } from '../Width'
import { getDictionary } from '@/i18n/dictionary'
import type { Locale } from '@/i18n/config'

export const Email: React.FC<
  EmailField & {
    errors: Partial<FieldErrorsImpl>
    register: UseFormRegister<FieldValues>
    locale?: Locale
  }
> = ({ name, defaultValue, errors, label, register, required, width, locale = 'uk' }) => {
  const hasError = Boolean(errors[name])
  const t = getDictionary(locale)

  return (
    <Width width={width}>
      <Label htmlFor={name}>
        {label}

        {required && (
          <span className="required">
            * <span className="sr-only">(required)</span>
          </span>
        )}
      </Label>
      <Input
        aria-invalid={hasError}
        defaultValue={defaultValue}
        id={name}
        type="text"
        {...register(name, {
          pattern: { value: /^\S[^\s@]*@\S+$/, message: t.form.invalidEmail },
          required,
        })}
      />

      {hasError && <Error locale={locale} name={name} />}
    </Width>
  )
}
