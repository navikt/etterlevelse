import React from 'react'
import ReactMarkdown from 'react-markdown/with-html'
import {Paragraph2} from 'baseui/typography'
import remarkGfm from 'remark-gfm'
import {StatefulTooltip} from 'baseui/tooltip'

export const Markdown = (props: {source?: string, sources?: string[], escapeHtml?: boolean, noMargin?: boolean, shortenLinks?: boolean}) => {
  const renderers = {
    paragraph: (parProps: any) => {
      const {children, key} = parProps
      return <Paragraph2 key={key} marginTop={props.noMargin ? 0 : undefined} marginBottom={props.noMargin ? 0 : undefined}>{children}</Paragraph2>
    },
    link: (linkProps: any) => {
      const {children, key, href} = linkProps
      return <StatefulTooltip content={href} key={key}>
        <a href={href} target='_blank' rel='noopener noreferrer'>{children}</a>
      </StatefulTooltip>
    }
  }

  const sources: string[] = props.sources || (props.source ? [props.source] : [''])
  const usedSource = props.shortenLinks ? sources.map(shortenUrls) : sources
  return <ReactMarkdown source={usedSource.join(', ')}
                        escapeHtml={props.escapeHtml}
                        renderers={renderers}
                        plugins={[remarkGfm]}
  />
}

const shortenUrls = (source: string) =>
  source
  .split(' ')
  .map((word, i) => isLink(word) ? `[${i === 0 ? 'S' : 's'}e ekstern link](${word})` : word)
  .join(' ');

const urlRegex = /http[s]?:\/\/.*/
const isLink = (text: string) => urlRegex.test(text)
