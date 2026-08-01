import React from 'react'

import type { GalleryBlock as GalleryBlockProps } from '@/payload-types'

import { Media } from '@/components/Media'
import { Reveal } from '@/components/Reveal'
import { cn } from '@/utilities/ui'
import { textWithBreaks } from '@/utilities/textWithBreaks'

const colsClass: Record<string, string> = {
  '2': 'sm:grid-cols-2',
  '3': 'sm:grid-cols-2 lg:grid-cols-3',
  '4': 'sm:grid-cols-2 lg:grid-cols-4',
}

export const GalleryBlock: React.FC<GalleryBlockProps> = ({ title, images, columns }) => {
  if (!images || images.length === 0) return null

  return (
    <div className="container">
      {title && (
        <Reveal>
          <h2 className="font-display mb-8 text-3xl md:text-4xl">{textWithBreaks(title)}</h2>
        </Reveal>
      )}
      <div className={cn('grid grid-cols-1 gap-4 md:gap-6', colsClass[columns || '3'])}>
        {images.map((item, i) => {
          const image = item.image
          if (!image || typeof image !== 'object') return null

          return (
            <Reveal key={item.id || i} delay={(i % 6) * 0.06}>
              <figure
                className={cn(
                  'group border-border/60 bg-card relative overflow-hidden rounded-2xl border',
                  i % 5 === 2 && 'sm:-rotate-1',
                  i % 5 === 4 && 'sm:rotate-1',
                )}
              >
                <div className="bg-secondary aspect-square overflow-hidden">
                  <Media
                    resource={image}
                    imgClassName="h-full w-full object-contain transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                </div>
                {item.caption && (
                  <figcaption className="from-foreground/85 absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t to-transparent p-4 text-sm text-white transition-transform duration-500 group-hover:translate-y-0">
                    {textWithBreaks(item.caption)}
                  </figcaption>
                )}
              </figure>
            </Reveal>
          )
        })}
      </div>
    </div>
  )
}
