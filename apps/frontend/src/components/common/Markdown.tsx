import ReactMarkdown from 'react-markdown'
import { useDebouncedState } from '../../util/hooks'
import MdEditor from 'react-markdown-editor-lite'
import 'react-markdown-editor-lite/lib/index.css'
import { Block } from 'baseui/block'
import { theme } from '../../util'
import { ExternalLink } from './RouteLink'
import { markdownLink } from '../../util/config'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { ettlevColors } from '../../util/theme'
import { BodyLong, BodyShort, Heading, Link, List } from '@navikt/ds-react'
import { ExternalLinkIcon } from '@navikt/aksel-icons'

export const Markdown = ({
  vertical,
  escapeHtml = true,
  shortenLinks,
  noMargin,
  source,
  sources: sourcesOrig,
  p1,
  fontColor,
  fontSize,
  maxWidth,
  externalLink,
}: {
  source?: string
  sources?: string[]
  escapeHtml?: boolean
  noMargin?: boolean
  shortenLinks?: boolean
  vertical?: boolean
  p1?: boolean
  fontColor?: string
  fontSize?: string
  maxWidth?: string
  externalLink?: boolean
}) => {
  const renderers = {
    p: (parProps: any) => {
      const { children } = parProps
      if (p1) {
        return (
          <BodyLong>
            {children}
          </BodyLong>
        )
      }
      return (
        <BodyLong>
          {children}
        </BodyLong>
      )
    },
    h2: (headerProps: any) => {
      const { children } = headerProps

      return (
        <Heading size="medium" level="2">{children}</Heading>
      )
    },

    h3: (headerProps: any) => {
      const { children } = headerProps

      return (
        <Heading size="medium" level="3">{children}</Heading>
      )
    },
    h4: (headerProps: any) => {
      const { children } = headerProps

      return <Heading size="medium" level="4">{children}</Heading>
    },
    href: (linkProps: any) => {
      const { children, href, node } = linkProps
      const content = shortenLinks && node.children[0]?.value.indexOf('http') === 0 ? 'Lenke' : children
      return (
        <Link href={href}>{content}</Link>
      )
    },
    a: (linkProps: any) => {
      const { children, href, node } = linkProps
      const content = shortenLinks && node.children[0]?.value.indexOf('http') === 0 ? 'Lenke' : children

      return (
        <Link href={href}>
          {content}
        </Link>
      )
    },
    code: (codeProps: any) => {
      const { node, inline, className, children, ...props } = codeProps
      return (
        <code className={className} {...props} style={{ whiteSpace: 'normal', color: fontColor ? fontColor : ettlevColors.green800 }}>
          {children}
        </code>
      )
    },
    li: (liProps: any) => {
      const { children } = liProps
      if (p1) {
        return (
          <List.Item>
            <BodyShort>
              {children}
            </BodyShort>
          </List.Item>
        )
      } else {
        return <List.Item>{children}</List.Item>
      }
    },
    ul: (ulProps: any) => {
      const { children } = ulProps
      return (
        <List>
          {children}
        </List>
      )
    }
  }

  const sources: string[] = sourcesOrig || (source ? [source] : [''])
  const htmlPlugins = escapeHtml ? [] : [rehypeRaw]
  return (
    <div>
      <ReactMarkdown children={sources.join(vertical ? '\n\n' : ', ')} components={renderers} remarkPlugins={[remarkGfm]} rehypePlugins={htmlPlugins as any} />
    </div>
  )
}

type MarkdownEditorProps = {
  initialValue: string
  setValue: (v: string) => void
  shortenLinks?: boolean
  onImageUpload?: (file: File) => Promise<string>
  height?: string
}

export const MarkdownEditor = (props: MarkdownEditorProps) => {
  // Reduce UI lag by only updating field at set interval
  const [val, setVal] = useDebouncedState(props.initialValue, 500, props.setValue)

  return (
    <MdEditor
      style={{ height: props.height || '500px' }}
      defaultValue={props.initialValue}
      renderHTML={(txt) => <Markdown source={txt} shortenLinks={props.shortenLinks} />}
      onChange={(data) => setVal(data.text)}
      onImageUpload={props.onImageUpload}
    />
  )
}

export const MarkdownInfo = () => (
  <Block>
    Feltet bruker <ExternalLink href={markdownLink}>Markdown</ExternalLink>, se her for mer informasjon om formatet
  </Block>
)
