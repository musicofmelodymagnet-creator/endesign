import React from 'react'

import type { CallToActionBlock as CTABlockProps } from '@/payload-types'

import RichText from '@/components/RichText'
import { CMSLink } from '@/components/Link'
import { Reveal } from '@/components/Reveal'

export const CallToActionBlock: React.FC<CTABlockProps> = ({ links, richText }) => {
  return (
    <div className="container">
      <Reveal>
        <div className="border-border/60 bg-secondary relative flex flex-col gap-8 overflow-hidden rounded-3xl border p-8 md:flex-row md:items-center md:justify-between md:p-12">
          <div
            aria-hidden
            className="bg-primary/25 absolute -top-10 -right-10 h-48 w-48 rounded-full blur-3xl"
          />
          <div className="prose-headings:font-display relative max-w-2xl">
            {richText && <RichText className="mb-0" data={richText} enableGutter={false} />}
          </div>
          <div className="relative flex flex-col gap-4 md:flex-row">
            {(links || []).map(({ link }, i) => (
              <CMSLink
                key={i}
                {...link}
                className="stamp bg-primary text-primary-foreground font-display inline-flex rounded-full px-6 py-3 text-center text-sm tracking-wide uppercase"
              />
            ))}
          </div>
        </div>
      </Reveal>
    </div>
  )
}
