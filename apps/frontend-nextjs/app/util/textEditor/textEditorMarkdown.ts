'use client'

import { marked } from 'marked'
import TurndownService from 'turndown'

marked.setOptions({ gfm: true, breaks: true })

const turndownService = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
})

turndownService.addRule('lineBreak', {
  filter: 'br',
  replacement: () => '\n',
})

turndownService.addRule('backgroundColor', {
  filter: (node) => node.nodeName === 'SPAN' && !!node.style.backgroundColor,
  replacement: (content, node) => {
    const element = node as HTMLElement
    return `<span style='background-color: ${element.style.backgroundColor}'>${content}</span>`
  },
})

turndownService.addRule('textColor', {
  filter: (node) => node.nodeName === 'SPAN' && !!node.style.color && !node.style.backgroundColor,
  replacement: (content, node) => {
    const element = node as HTMLElement
    return `<span style='color: ${element.style.color}'>${content}</span>`
  },
})

turndownService.addRule('underline', {
  filter: 'ins',
  replacement: (content) => `<ins>${content}</ins>`,
})

export const markdownToHtml = (markdown: string): string =>
  marked.parse(markdown ?? '', { async: false })

export const htmlToMarkdown = (html: string): string => turndownService.turndown(html)
