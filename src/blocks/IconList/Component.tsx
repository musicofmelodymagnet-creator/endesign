import React from 'react'

import type { IconListBlock as IconListBlockProps } from '@/payload-types'

import { Media } from '@/components/Media'
import { Reveal } from '@/components/Reveal'
import { StampBadge } from '@/components/StampBadge'
import { textWithBreaks } from '@/utilities/textWithBreaks'

export const IconListBlock: React.FC<IconListBlockProps> = ({ kicker, title, subtitle, items }) => {
  if (!items || items.length === 0) return null

  return (
    <div className="container">
      {(kicker || title || subtitle) && (
        <Reveal className="mb-10 max-w-2xl">
          {kicker && <StampBadge className="mb-5">{kicker}</StampBadge>}
          {title && <h2 className="font-display text-3xl md:text-4xl">{textWithBreaks(title)}</h2>}
          {subtitle && <p className="text-muted-foreground mt-3">{textWithBreaks(subtitle)}</p>}
        </Reveal>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <Reveal key={item.id || i} delay={(i % 6) * 0.06}>
            <div className="border-border/60 bg-card group h-full rounded-2xl border p-6 transition-colors hover:border-primary">
              {item.icon && typeof item.icon === 'object' ? (
                <div className="bg-primary/10 mb-5 flex h-16 w-20 items-center justify-center rounded-xl">
                  <Media resource={item.icon} imgClassName="h-10 w-auto object-contain" />
                </div>
              ) : (
                <span className="font-display text-primary mb-5 block text-3xl">
                  {String(i + 1).padStart(2, '0')}
                </span>
              )}
              {item.title && (
                <h3 className="font-display mb-2 text-lg">{textWithBreaks(item.title)}</h3>
              )}
              {item.text && (
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {textWithBreaks(item.text)}
                </p>
              )}
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  )
}
