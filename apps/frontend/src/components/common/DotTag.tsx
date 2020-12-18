import React, {ReactNode} from 'react'
import {faCircle} from '@fortawesome/free-solid-svg-icons'
import {Block} from 'baseui/block'
import {theme} from '../../util'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import RouteLink, {urlForObject} from './RouteLink'
import {Markdown} from './Markdown'
import {Code, codelist, ListName} from '../../services/Codelist'
import {NavigableItem} from '../admin/audit/AuditTypes'

export const DotTag = (props: {children: ReactNode}) =>
  <Block marginLeft={theme.sizing.scale100} marginRight={theme.sizing.scale100} display='flex' alignItems='center'>
    <FontAwesomeIcon icon={faCircle} color={theme.colors.positive400} style={{fontSize: '.45rem'}}/>
    <Block display='inline' marginRight={theme.sizing.scale100}/>
    <Block $style={{whiteSpace: 'nowrap'}}>
      {props.children}
    </Block>
  </Block>

const Content = (props: {item: string, list?: ListName, linkCodelist?: boolean, markdown?: boolean}) => {
  const {item, list, linkCodelist, markdown} = props
  if (list) {
    if (linkCodelist) return (
      <RouteLink href={urlForObject(list as ListName & NavigableItem, item)}>
        {codelist.getShortname(list as ListName & NavigableItem, item)}
      </RouteLink>
    )
    return <>{codelist.getShortname(list, item)}</>
  }
  if (markdown) return <Markdown source={item} noMargin/>
  return <>{item}</>
}

type DotTagsParams = {
  items?: string[],
  codes?: Code[],
  commaSeparator?: boolean,
  linkCodelist?: boolean
  markdown?: boolean
  list?: ListName
}

export const DotTags = (props: DotTagsParams) => {
  const {commaSeparator} = props
  const items = props.items || props.codes?.map(c => c.code) || []

  if (!items.length) return <>{'Ikke angitt'}</>

  if (commaSeparator)
    return (
      <Block display='inline'>
        {items.map((item, i) => (
          <React.Fragment key={i}>
            <Content {...props} item={item}/>
            <span>{i < items.length - 1 ? ', ' : ''}</span>
          </React.Fragment>
        ))}
      </Block>
    )

  return (
    <Block display='flex' flexWrap>
      {items.map((item, i) => (
        <Block key={i} marginRight={i < items.length && !commaSeparator ? theme.sizing.scale200 : 0}>

          <DotTag> <Content {...props} item={item}/> </DotTag>
        </Block>
      ))}
    </Block>
  )
}
