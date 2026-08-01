import React from 'react'

import type { PriceListBlock as PriceListBlockProps } from '@/payload-types'

import { Reveal } from '@/components/Reveal'
import { textWithBreaks } from '@/utilities/textWithBreaks'

export const PriceListBlock: React.FC<PriceListBlockProps> = ({ title, items }) => {
  if (!items || items.length === 0) return null

  return (
    <div className="container">
      {title && (
        <Reveal>
          <h2 className="font-display mb-10 text-3xl md:text-4xl">{textWithBreaks(title)}</h2>
        </Reveal>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {items.map((item, i) => (
          <Reveal key={item.id || i} delay={(i % 4) * 0.06}>
            <div className="border-border/60 bg-card flex items-center justify-between gap-6 rounded-2xl border p-6">
              <div>
                <h3 className="font-display text-lg">{textWithBreaks(item.name)}</h3>
                {item.description && (
                  <p className="text-muted-foreground mt-1 text-sm">{textWithBreaks(item.description)}</p>
                )}
              </div>
              <span className="stamp bg-primary text-primary-foreground font-display inline-flex shrink-0 rounded-full px-4 py-2 text-sm whitespace-nowrap">
                {item.price}
              </span>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  )
}
