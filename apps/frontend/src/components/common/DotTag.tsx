import React, { ReactNode } from 'react'
import { ExternalLink, urlForObject } from './RouteLink'
import { Markdown } from './Markdown'
import { Code, codelist, ListName } from '../../services/Codelist'
import { NavigableItem } from '../admin/audit/AuditTypes'

export const DotTag = (props: { children: ReactNode; noBulletPoints?: boolean }) => (
  <div className="flex">
    {!props.noBulletPoints && <li />}
    <div className="break-words">{props.children}</div>
  </div>
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
  noBulletPoints?: boolean
}

export const DotTags = (props: DotTagsParams) => {
  const { commaSeparator, noBulletPoints } = props
  const items = props.items || props.codes?.map((c) => c.code) || []

  if (!items.length) return <>{'Ikke angitt'}</>

  if (commaSeparator)
    return (
      <div className={'inline'}>
        {items.map((item, i) => (
          <React.Fragment key={i}>
            <Content {...props} item={item} />
            <span>{i < items.length - 1 ? ', ' : ''}</span>
          </React.Fragment>
        ))}
      </div>
    )

  return (
    <div className={`${props.inColumn ? 'block' : 'flex'} flex-wrap`}>
      {items.map((item, i) => (
        <div className={`${props.inColumn ? 'mb-1.5' : 'mb-0'} ${i < items.length && !commaSeparator ? 'mb-1.5' : 'mb-0'}`} key={i}>
          <DotTag noBulletPoints={noBulletPoints}>
            {' '}
            <Content {...props} item={item} />{' '}
          </DotTag>
        </div>
      ))}
    </div>
  )
}
