import { BodyShort } from '@navikt/ds-react'
import React, { ReactNode } from 'react'
import { EListName, ICode, codelist } from '../../services/Codelist'
import { TNavigableItem } from '../admin/audit/AuditTypes'
import { Markdown } from './Markdown'
import { ExternalLink, urlForObject } from './RouteLink'

const Content = (props: {
  item: ReactNode | string
  list?: EListName
  linkCodelist?: boolean
  markdown?: boolean
}) => {
  const { item, list, linkCodelist, markdown } = props
  if (list) {
    const itemString = item as string
    if (linkCodelist)
      return (
        <ExternalLink href={urlForObject(list as EListName & TNavigableItem, itemString)}>
          {codelist.getShortname(list as EListName & TNavigableItem, itemString)}
        </ExternalLink>
      )
    return <>{codelist.getShortname(list, itemString)}</>
  }
  if (markdown) return <Markdown source={item as string} />
  return <>{item}</>
}

type TDotTagsParams = {
  items?: ReactNode[]
  codes?: ICode[]
  commaSeparator?: boolean
  linkCodelist?: boolean
  markdown?: boolean
  list?: EListName
  inColumn?: boolean
}

export const DotTags = (props: TDotTagsParams) => {
  const { commaSeparator } = props
  const items = props.items || props.codes?.map((code) => code.code) || []

  if (!items.length) return <>{'Ikke angitt'}</>

  if (commaSeparator) {
    return (
      <div className={'inline'}>
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <Content {...props} item={item} />
            <span>{index < items.length - 1 ? ', ' : ''}</span>
          </React.Fragment>
        ))}
      </div>
    )
  }

  return (
    <div className={`${props.inColumn ? 'block' : 'flex'} flex-wrap`}>
      {items.map((item, index) => (
        <div
          className={`${props.inColumn ? 'mb-1.5' : 'mb-0'} ${
            index < items.length && !commaSeparator ? 'mb-1.5' : 'mb-0'
          }`}
          key={index}
        >
          {!props.markdown && (
            <BodyShort className={'break-words'}>
              <Content {...props} item={item} />{' '}
            </BodyShort>
          )}

          {props.markdown && <Content {...props} item={item} />}
        </div>
      ))}
    </div>
  )
}
