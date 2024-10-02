import { BodyShort } from '@navikt/ds-react'
import { Fragment, ReactNode } from 'react'
import { CodelistService, EListName, ICode } from '../../services/Codelist'
import { TNavigableItem } from '../admin/audit/AuditTypes'
import { Markdown } from './Markdown'
import { ExternalLink, urlForObject } from './RouteLink'

interface IContent {
  item: ReactNode | string
  list?: EListName
  linkCodelist?: boolean
  markdown?: boolean
}

const Content = (props: IContent) => {
  const { item, list, linkCodelist, markdown } = props
  const [codelistUtils] = CodelistService()
  if (list) {
    const itemString = item as string
    if (linkCodelist)
      return (
        <ExternalLink href={urlForObject(list as EListName & TNavigableItem, itemString)}>
          {codelistUtils.getShortname(list as EListName & TNavigableItem, itemString)}
        </ExternalLink>
      )
    return <>{codelistUtils.getShortname(list, itemString)}</>
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
  const { commaSeparator, codes, inColumn, markdown } = props
  const items = props.items || codes?.map((code: ICode) => code.code) || []

  if (!items.length) return <>{'Ikke angitt'}</>

  if (commaSeparator) {
    return (
      <div className={'inline'}>
        {items.map((item, index) => (
          <Fragment key={index}>
            <Content {...props} item={item} />
            <span>{index < items.length - 1 ? ', ' : ''}</span>
          </Fragment>
        ))}
      </div>
    )
  }

  return (
    <div className={`${inColumn ? 'block' : 'flex'} flex-wrap`}>
      {items.map((item, index) => (
        <div
          className={`${inColumn ? 'mb-1.5' : 'mb-0'} ${
            index < items.length && !commaSeparator ? 'mb-1.5' : 'mb-0'
          }`}
          key={index}
        >
          {!markdown && (
            <BodyShort className={'break-words'}>
              <Content {...props} item={item} />{' '}
            </BodyShort>
          )}

          {markdown && <Content {...props} item={item} />}
        </div>
      ))}
    </div>
  )
}
