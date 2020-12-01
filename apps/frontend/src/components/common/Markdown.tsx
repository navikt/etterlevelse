import React from 'react'
import ReactMarkdown from 'react-markdown/with-html'
import {Paragraph2} from 'baseui/typography'
import remarkGfm from 'remark-gfm'

export const Markdown = (props: {source?: string, sources?: string[], escapeHtml?: boolean, noMargin?: boolean, shortenLinks?: boolean}) => {
  const renderers = {
    paragraph: (parProps: any) => props.noMargin ? <Paragraph2 {...parProps} marginTop={0} marginBottom={0}/> : <Paragraph2 {...parProps}/>
  }
  const sources: string[] = props.sources || (props.source ? [props.source] : [''])
  const usedSource = props.shortenLinks ? sources.map(shortenUrls) : sources
  return <ReactMarkdown source={usedSource.join(', ')}
                        escapeHtml={props.escapeHtml}
                        linkTarget='_blank'
                        renderers={renderers}
                        plugins={[remarkGfm]}
  />
}

const shortenUrls = (source: string) =>
  source
  .split(' ')
  .map((word, i) => isLink(word) ? `[${i === 0 ? 'S' : 's'}e ekstern link](${word})` : word)
  .join(' ');

const urlRegex = /http[s]?:\/\/.*/gm
const isLink = (text: string) => urlRegex.test(text)
