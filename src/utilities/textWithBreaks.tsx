import React, { Fragment } from 'react'

/**
 * Some legacy TV fields stored a literal `<br>` inside a plain-text value
 * (the old theme injected it via innerHTML). React escapes text by default,
 * so we split on it here instead of reaching for dangerouslySetInnerHTML.
 */
export function textWithBreaks(text?: string | null): React.ReactNode {
  if (!text) return text
  const parts = text.split(/<br(?:\s+[^>]*)?\/?>/gi)
  if (parts.length === 1) return text

  return parts.map((part, i) => (
    <Fragment key={i}>
      {i > 0 && <br />}
      {part}
    </Fragment>
  ))
}
