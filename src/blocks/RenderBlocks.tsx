import React, { Fragment } from 'react'

import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { FormBlock } from '@/blocks/Form/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { GalleryBlock } from '@/blocks/Gallery/Component'
import { IconListBlock } from '@/blocks/IconList/Component'
import { TextImageBlock } from '@/blocks/TextImage/Component'
import { PriceListBlock } from '@/blocks/PriceList/Component'
import type { Locale } from '@/i18n/config'

const blockComponents = {
  content: ContentBlock,
  cta: CallToActionBlock,
  formBlock: FormBlock,
  mediaBlock: MediaBlock,
  gallery: GalleryBlock,
  iconList: IconListBlock,
  textImage: TextImageBlock,
  priceList: PriceListBlock,
}

export const RenderBlocks: React.FC<{
  // Reused across Pages/Services/CaseStudies, each with its own block union —
  // kept loose here since every block already validates itself at render time.
  blocks: Record<string, unknown>[] | null | undefined
  locale?: Locale
}> = (props) => {
  const { blocks, locale } = props

  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0

  if (hasBlocks) {
    return (
      <Fragment>
        {blocks.map((block, index) => {
          const blockType = block.blockType as keyof typeof blockComponents | undefined

          if (blockType && blockType in blockComponents) {
            const Block = blockComponents[blockType]

            if (Block) {
              return (
                <div className="my-16" key={index}>
                  {/* @ts-expect-error there may be some mismatch between the expected types here */}
                  <Block {...block} disableInnerContainer locale={locale} />
                </div>
              )
            }
          }
          return null
        })}
      </Fragment>
    )
  }

  return null
}
