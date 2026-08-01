import { JSDOM } from 'jsdom'

// Minimal HTML -> Lexical converter for the plain semantic markup found in the
// legacy ModX richtext TVs (p, ul/ol/li, strong/b, em/i, a, br). Not a general
// purpose HTML importer — covers exactly what the source content uses.

const FORMAT_BOLD = 1
const FORMAT_ITALIC = 2

type LexicalNode = Record<string, unknown>

function textNode(text: string, format = 0): LexicalNode {
  return {
    type: 'text',
    detail: 0,
    format,
    mode: 'normal',
    style: '',
    text,
    version: 1,
  }
}

function linkNode(children: LexicalNode[], url: string): LexicalNode {
  return {
    type: 'link',
    children,
    direction: 'ltr',
    fields: {
      linkType: 'custom',
      newTab: url.startsWith('http'),
      url,
    },
    format: '',
    indent: 0,
    version: 2,
  }
}

function inlineChildren(node: ChildNode, format = 0): LexicalNode[] {
  const out: LexicalNode[] = []

  node.childNodes.forEach((child) => {
    if (child.nodeType === 3) {
      // TEXT_NODE
      const text = child.textContent || ''
      if (text.length > 0) out.push(textNode(text, format))
      return
    }
    if (child.nodeType !== 1) return // only ELEMENT_NODE beyond this point
    const el = child as HTMLElement
    const tag = el.tagName.toLowerCase()

    if (tag === 'br') {
      out.push({ type: 'linebreak', version: 1 })
      return
    }
    if (tag === 'strong' || tag === 'b') {
      out.push(...inlineChildren(el, format | FORMAT_BOLD))
      return
    }
    if (tag === 'em' || tag === 'i') {
      out.push(...inlineChildren(el, format | FORMAT_ITALIC))
      return
    }
    if (tag === 'a') {
      const href = el.getAttribute('href') || ''
      out.push(linkNode(inlineChildren(el, format), href))
      return
    }
    // Unknown inline tag: keep its text content
    out.push(...inlineChildren(el, format))
  })

  return out
}

function paragraphNode(el: HTMLElement): LexicalNode {
  return {
    type: 'paragraph',
    children: inlineChildren(el),
    direction: 'ltr',
    format: '',
    indent: 0,
    textFormat: 0,
    version: 1,
  }
}

function headingNode(el: HTMLElement, tag: string): LexicalNode {
  return {
    type: 'heading',
    tag,
    children: inlineChildren(el),
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  }
}

function listNode(el: HTMLElement, ordered: boolean): LexicalNode {
  const items: LexicalNode[] = []
  let value = 1
  el.childNodes.forEach((child) => {
    if (child.nodeType !== 1) return
    const li = child as HTMLElement
    if (li.tagName.toLowerCase() !== 'li') return
    items.push({
      type: 'listitem',
      checked: undefined,
      value: value++,
      children: inlineChildren(li),
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    })
  })

  return {
    type: 'list',
    listType: ordered ? 'number' : 'bullet',
    start: 1,
    tag: ordered ? 'ol' : 'ul',
    children: items,
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  }
}

/** Converts a plain HTML fragment (as found in the ModX richtext TVs) into a Payload Lexical editorState. */
export function htmlToLexical(html: string): LexicalNode {
  const dom = new JSDOM(`<body>${html || ''}</body>`)
  const body = dom.window.document.body
  const children: LexicalNode[] = []

  body.childNodes.forEach((node) => {
    if (node.nodeType === 3) {
      const text = node.textContent?.trim()
      if (text) {
        children.push({
          type: 'paragraph',
          children: [textNode(text)],
          direction: 'ltr',
          format: '',
          indent: 0,
          textFormat: 0,
          version: 1,
        })
      }
      return
    }
    if (node.nodeType !== 1) return
    const el = node as HTMLElement
    const tag = el.tagName.toLowerCase()

    if (tag === 'p' || tag === 'div') {
      children.push(paragraphNode(el))
    } else if (/^h[1-6]$/.test(tag)) {
      children.push(headingNode(el, tag))
    } else if (tag === 'ul') {
      children.push(listNode(el, false))
    } else if (tag === 'ol') {
      children.push(listNode(el, true))
    } else {
      // Fallback: treat any other block-level element as a paragraph
      const text = el.textContent?.trim()
      if (text) {
        children.push({
          type: 'paragraph',
          children: inlineChildren(el),
          direction: 'ltr',
          format: '',
          indent: 0,
          textFormat: 0,
          version: 1,
        })
      }
    }
  })

  if (children.length === 0) {
    children.push({
      type: 'paragraph',
      children: [],
      direction: 'ltr',
      format: '',
      indent: 0,
      textFormat: 0,
      version: 1,
    })
  }

  return {
    root: {
      type: 'root',
      children,
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }
}
