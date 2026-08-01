import { cn } from '@/utilities/ui'
import React from 'react'
import RichText from '@/components/RichText'

import type { ContentBlock as ContentBlockProps } from '@/payload-types'

import { CMSLink } from '../../components/Link'
import { Reveal } from '@/components/Reveal'

export const ContentBlock: React.FC<ContentBlockProps> = (props) => {
  const { columns } = props

  const colsSpanClasses = {
    full: '12',
    half: '6',
    oneThird: '4',
    twoThirds: '8',
  }

  return (
    <div className="container">
      <div className="grid grid-cols-4 lg:grid-cols-12 gap-x-16 gap-y-8">
        {columns &&
          columns.length > 0 &&
          columns.map((col, index) => {
            const { enableLink, link, richText, size } = col

            return (
              <Reveal
                key={index}
                delay={index * 0.06}
                className={cn(`col-span-4 lg:col-span-${colsSpanClasses[size!]}`, {
                  'md:col-span-2': size !== 'full',
                })}
              >
                {richText && <RichText data={richText} enableGutter={false} />}

                {enableLink && (
                  <CMSLink
                    {...link}
                    className="link-underline font-display mt-4 inline-block text-sm tracking-wide uppercase"
                  />
                )}
              </Reveal>
            )
          })}
      </div>
    </div>
  )
}
