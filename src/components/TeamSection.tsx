import React from 'react'

import { Media } from '@/components/Media'
import { Reveal } from '@/components/Reveal'
import { getCachedGlobal } from '@/utilities/getGlobals'
import type { Locale } from '@/i18n/config'

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export async function TeamSection({ locale }: { locale: Locale }) {
  const team = await getCachedGlobal('team', 1, locale)()
  const members = team?.members || []
  if (members.length === 0) return null

  return (
    <section className="container py-20 md:py-28">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,20rem)_1fr]">
        <Reveal>
          {team.heading && <h2 className="font-display text-3xl md:text-4xl">{team.heading}</h2>}
          {team.subtitle && <p className="text-muted-foreground mt-5 leading-relaxed">{team.subtitle}</p>}
        </Reveal>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {members.map((member, i) => (
            <Reveal key={member.id || i} delay={(i % 6) * 0.06}>
              <div className="border-border/60 bg-card group flex h-full flex-col items-center rounded-2xl border p-6 text-center transition-colors hover:border-primary">
                {member.photo && typeof member.photo === 'object' ? (
                  <div className="ring-border/60 h-28 w-28 shrink-0 overflow-hidden rounded-full ring-1">
                    <Media
                      resource={member.photo}
                      imgClassName="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                ) : (
                  <div className="bg-primary text-primary-foreground font-display flex h-28 w-28 shrink-0 items-center justify-center rounded-full text-2xl">
                    {initials(member.name)}
                  </div>
                )}
                <h3 className="font-display mt-5 text-base">{member.name}</h3>
                {member.role && (
                  <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{member.role}</p>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
