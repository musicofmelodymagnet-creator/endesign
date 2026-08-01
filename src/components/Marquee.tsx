import React from 'react'

type Props = {
  items: string[]
  className?: string
}

export const Marquee: React.FC<Props> = ({ items, className }) => {
  const doubled = [...items, ...items]

  return (
    <div className={`overflow-hidden whitespace-nowrap ${className || ''}`}>
      <div className="marquee-track">
        {doubled.map((item, i) => (
          <span
            key={i}
            className="font-display mx-4 flex items-center gap-4 text-2xl uppercase tracking-wide md:text-4xl"
          >
            {item}
            <span aria-hidden className="text-primary">
              ✦
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}
