import type { CheckboxField } from '@payloadcms/plugin-form-builder/types'
import type { Control, FieldErrorsImpl, FieldValues } from 'react-hook-form'

import { Controller } from 'react-hook-form'

import { Checkbox as CheckboxUi } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import React from 'react'

import { Error } from '../Error'
import { Width } from '../Width'
import type { Locale } from '@/i18n/config'

// Radix's Checkbox is a button, not a native <input> — it exposes
// checked/onCheckedChange, not the change/blur/value contract register()
// expects. Spreading register() onto it silently never wires up validation
// (a submit with this required and unchecked would still succeed). Controller
// is react-hook-form's documented way to hook up a controlled, non-native
// input like this one, and its `rules` enforce `required` regardless.
export const Checkbox: React.FC<
  CheckboxField & {
    control: Control<FieldValues>
    errors: Partial<FieldErrorsImpl>
    locale?: Locale
  }
> = ({ name, defaultValue, control, errors, label, required, width, locale }) => {
  const hasError = Boolean(errors[name])

  return (
    <Width width={width}>
      <div className="flex items-center gap-2">
        <Controller
          control={control}
          defaultValue={defaultValue || false}
          name={name}
          rules={{ required }}
          render={({ field: { onChange, value } }) => (
            <CheckboxUi
              aria-invalid={hasError}
              checked={value ?? false}
              id={name}
              onCheckedChange={onChange}
            />
          )}
        />
        <Label htmlFor={name}>
          {required && (
            <span className="required">
              * <span className="sr-only">(required)</span>
            </span>
          )}
          {label}
        </Label>
      </div>
      {hasError && <Error locale={locale} name={name} />}
    </Width>
  )
}
