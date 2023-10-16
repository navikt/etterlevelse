import React, { ReactNode } from 'react'
import { faCircle } from '@fortawesome/free-solid-svg-icons'
import { Block } from 'baseui/block'
import { theme } from '../../util'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ExternalLink, urlForObject } from './RouteLink'
import { Markdown } from './Markdown'
import { Code, codelist, ListName } from '../../services/Codelist'
import { NavigableItem } from '../admin/audit/AuditTypes'
import { ettlevColors } from '../../util/theme'

export const DotTag = (props: { children: ReactNode }) => (
  <Block marginLeft={theme.sizing.scale100} marginRight={theme.sizing.scale100} display="flex" alignItems="flex-start">
    <FontAwesomeIcon icon={faCircle} color={ettlevColors.black} style={{ fontSize: '.45rem', marginTop: '9px' }} aria-hidden={true} />
    <Block display="inline" marginRight={theme.sizing.scale100} />
    <Block $style={{ wordBreak: 'break-word' }}>{props.children}</Block>
  </Block>
)

const Content = (props: { item: ReactNode | string; list?: ListName; linkCodelist?: boolean; markdown?: boolean }) => {
  const { item, list, linkCodelist, markdown } = props
  if (list) {
    const itemString = item as string
    if (linkCodelist)
      return <ExternalLink href={urlForObject(list as ListName & NavigableItem, itemString)}>{codelist.getShortname(list as ListName & NavigableItem, itemString)}</ExternalLink>
    return <>{codelist.getShortname(list, itemString)}</>
  }
  if (markdown) return <Markdown source={item as string} />
  return <>{item}</>
}

type DotTagsParams = {
  items?: ReactNode[]
  codes?: Code[]
  commaSeparator?: boolean
  linkCodelist?: boolean
  markdown?: boolean
  list?: ListName
  inColumn?: boolean
}

export const DotTags = (props: DotTagsParams) => {
  const { commaSeparator } = props
  const items = props.items || props.codes?.map((c) => c.code) || []

  if (!items.length) return <>{'Ikke angitt'}</>

  if (commaSeparator)
    return (
      <Block display="inline">
        {items.map((item, i) => (
          <React.Fragment key={i}>
            <Content {...props} item={item} />
            <span>{i < items.length - 1 ? ', ' : ''}</span>
          </React.Fragment>
        ))}
      </Block>
    )

  return (
    <Block display={props.inColumn ? 'block' : 'flex'} flexWrap>
      {items.map((item, i) => (
        <Block marginBottom={props.inColumn ? theme.sizing.scale200 : 'none'} key={i} marginRight={i < items.length && !commaSeparator ? theme.sizing.scale200 : 0}>
          <DotTag>
            {' '}
            <Content {...props} item={item} />{' '}
          </DotTag>
        </Block>
      ))}
    </Block>
  )
}
