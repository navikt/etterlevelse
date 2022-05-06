import React from 'react'
import ReactMarkdown from 'react-markdown'
import { HeadingLarge, HeadingMedium, ParagraphLarge, ParagraphMedium } from 'baseui/typography'
import { StatefulTooltip } from 'baseui/tooltip'
import { useDebouncedState } from '../../util/hooks'
import MdEditor from 'react-markdown-editor-lite'
import 'react-markdown-editor-lite/lib/index.css'
import { Block } from 'baseui/block'
import { theme } from '../../util'
import { ExternalLink, ExternalLinkWrapper } from './RouteLink'
import { markdownLink } from '../../util/config'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { ettlevColors } from '../../util/theme'

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
          <ParagraphLarge
            $style={{ fontSize: fontSize ? fontSize : undefined }}
            color={fontColor ? fontColor : ettlevColors.green800}
            marginTop={noMargin ? 0 : undefined}
            marginBottom={noMargin ? 0 : undefined}
          >
            {children}
          </ParagraphLarge>
        )
      }
      return (
        <ParagraphMedium
          $style={{ fontSize: fontSize ? fontSize : undefined }}
          color={fontColor ? fontColor : ettlevColors.green800}
          marginTop={noMargin ? 0 : undefined}
          marginBottom={noMargin ? 0 : undefined}
        >
          {children}
        </ParagraphMedium>
      )
    },
    h3: (headerProps: any) => {
      const {children} = headerProps

      return (
        <HeadingLarge marginTop="48px" marginBottom="24px">
          {children}
        </HeadingLarge>
      )
    },
    h4: (headerProps: any) => {
      const {children} = headerProps

      return (
        <HeadingMedium  marginBottom="24px">
          {children}
        </HeadingMedium>
      )
    },
    href: (linkProps: any) => {
      const { children, href, node } = linkProps
      const content = shortenLinks && node.children[0]?.value.indexOf('http') === 0 ? 'Lenke' : children
      return (
        <StatefulTooltip content={href}>
          <span>
            <ExternalLink fontColor={fontColor} href={href}>
              <ExternalLinkWrapper text={content} />
            </ExternalLink>
          </span>
        </StatefulTooltip>
      )
    },
    a: (linkProps: any) => {
      const { children, href, node } = linkProps
      const content = shortenLinks && node.children[0]?.value.indexOf('http') === 0 ? 'Lenke' : children

      return (
        <ExternalLink fontColor={fontColor} href={href}>
          <ExternalLinkWrapper text={content} />
        </ExternalLink>
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
          <li style={{ fontSize: '21px' }}>
            <ParagraphLarge
              $style={{ fontSize: fontSize ? fontSize : undefined }}
              color={fontColor ? fontColor : ettlevColors.green800}
              marginTop={0}
              marginBottom={0}
            >
              {children}
            </ParagraphLarge>
          </li>
        )
      } else {
        return (
          <li>
            {children}
          </li>
        )
      }
    }
  }

  const sources: string[] = sourcesOrig || (source ? [source] : [''])
  const htmlPlugins = escapeHtml ? [] : [rehypeRaw]
  return (
    <Block
      $style={{
        // Fix font color in lists etc
        color: theme.colors.contentPrimary,
        fontFamily: theme.typography.font400.fontFamily,
        fontWeight: theme.typography.font400.fontWeight,
        maxWidth: maxWidth ? maxWidth : undefined,
      }}
    >
      <ReactMarkdown children={sources.join(vertical ? '\n\n' : ', ')} components={renderers} remarkPlugins={[remarkGfm]} rehypePlugins={htmlPlugins} />
    </Block>
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
