// Inverse of htmlToLexical.ts — walks a Payload Lexical editorState and
// reconstructs the simple HTML it came from, for handing text off to translation.

type Node = Record<string, any>

function renderInline(nodes: Node[] = []): string {
  return nodes
    .map((n) => {
      if (n.type === 'text') {
        let text = n.text || ''
        if (n.format & 1) text = `<strong>${text}</strong>`
        if (n.format & 2) text = `<em>${text}</em>`
        return text
      }
      if (n.type === 'linebreak') return '<br>'
      if (n.type === 'link') return `<a href="${n.fields?.url || ''}">${renderInline(n.children)}</a>`
      return renderInline(n.children)
    })
    .join('')
}

export function lexicalToHtml(data: any): string {
  const children: Node[] = data?.root?.children || []

  return children
    .map((node) => {
      if (node.type === 'paragraph') return `<p>${renderInline(node.children)}</p>`
      if (node.type === 'heading') return `<${node.tag}>${renderInline(node.children)}</${node.tag}>`
      if (node.type === 'list') {
        const tag = node.tag || (node.listType === 'number' ? 'ol' : 'ul')
        const items = (node.children || [])
          .map((li: Node) => `<li>${renderInline(li.children)}</li>`)
          .join('')
        return `<${tag}>${items}</${tag}>`
      }
      return ''
    })
    .join('\n')
}
