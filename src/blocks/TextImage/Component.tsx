import React from 'react'

import type { TextImageBlock as TextImageBlockProps } from '@/payload-types'

import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { Reveal } from '@/components/Reveal'
import { cn } from '@/utilities/ui'
import { textWithBreaks } from '@/utilities/textWithBreaks'

export const TextImageBlock: React.FC<TextImageBlockProps> = ({
  title,
  richText,
  image,
  imagePosition,
  background,
}) => {
  const hasImage = image && typeof image === 'object'

  const wrapperClass = cn(
    background === 'dark' && 'bg-foreground text-background py-16 rounded-3xl',
    background === 'light' && 'bg-secondary py-16 rounded-3xl',
  )

  return (
    <div className={background && background !== 'default' ? 'container' : undefined}>
      <div className={wrapperClass}>
        <div
          className={cn(
            'container grid items-center gap-10 md:grid-cols-2 md:gap-16',
            !hasImage && 'md:grid-cols-1',
          )}
        >
          <Reveal className={cn(hasImage && imagePosition === 'left' && 'md:order-2')}>
            {title && <h2 className="font-display text-3xl md:text-4xl">{textWithBreaks(title)}</h2>}
            {richText && (
              <div className="prose-p:text-current prose-headings:text-current mt-4 max-w-xl">
                <RichText data={richText} enableGutter={false} />
              </div>
            )}
          </Reveal>

          {hasImage && (
            <Reveal delay={0.1} className={cn(imagePosition === 'left' && 'md:order-1')}>
              <div className="border-border/60 overflow-hidden rounded-2xl border md:-rotate-1">
                <Media resource={image} imgClassName="w-full object-cover" />
              </div>
            </Reveal>
          )}
        </div>
      </div>
    </div>
  )
}
