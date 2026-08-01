const TRANSLIT_MAP: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'h', ґ: 'g', д: 'd', е: 'e', є: 'ie', ж: 'zh', з: 'z',
  и: 'y', і: 'i', ї: 'i', й: 'i', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p',
  р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch',
  ь: '', ю: 'iu', я: 'ia', ы: 'y', э: 'e', ъ: '',
}

function transliterate(input: string): string {
  return input
    .split('')
    .map((ch) => {
      const lower = ch.toLowerCase()
      if (TRANSLIT_MAP[lower] !== undefined) {
        const mapped = TRANSLIT_MAP[lower]
        return ch === lower ? mapped : mapped.charAt(0).toUpperCase() + mapped.slice(1)
      }
      return ch
    })
    .join('')
}

/** Transliterates a Cyrillic filename to a safe, portable ASCII slug, preserving the extension. */
export function slugifyFilename(filename: string): string {
  const dotIndex = filename.lastIndexOf('.')
  const base = dotIndex === -1 ? filename : filename.slice(0, dotIndex)
  const ext = dotIndex === -1 ? '' : filename.slice(dotIndex)

  const slug = transliterate(base)
    .toLowerCase()
    .replace(/['"«»]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100)

  return `${slug || 'file'}${ext.toLowerCase()}`
}
