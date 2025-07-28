import { TNavigableItem } from '@/constants/audit/auditConstants'
import { EListName, ICode } from '@/constants/kodeverk/kodeverkConstants'
import { urlForObject } from '@/routes/urlForObject/urlForObject'
import { CodelistService } from '@/services/kodeverk/kodeverkService'
import { BodyShort } from '@navikt/ds-react'
import { Fragment, ReactNode } from 'react'
import { ExternalLink } from '../externalLink/externalLink'
import { Markdown } from '../markdown/markdown'

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

  return (
    <>
      {markdown && <Markdown source={item as string} />}
      {item}
    </>
  )
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
  const { items, commaSeparator, codes, inColumn, markdown } = props
  const itemsReactNode: ReactNode[] = items || codes?.map((code: ICode) => code.code) || []

  return (
    <>
      {!itemsReactNode.length && <>Ikke angitt</>}
      {commaSeparator && (
        <div className='inline'>
          {itemsReactNode.map((item: ReactNode, index: number) => (
            <Fragment key={index}>
              <Content {...props} item={item} />
              <span>{index < itemsReactNode.length - 1 ? ', ' : ''}</span>
            </Fragment>
          ))}
        </div>
      )}
      <div className={`${inColumn ? 'block' : 'flex'} flex-wrap`}>
        {itemsReactNode.map((item: ReactNode, index: number) => (
          <div
            className={`${inColumn ? 'mb-1.5' : 'mb-0'} ${
              index < itemsReactNode.length && !commaSeparator ? 'mb-1.5' : 'mb-0'
            }`}
            key={index}
          >
            {!markdown && (
              <BodyShort className='break-words'>
                <Content {...props} item={item} />{' '}
              </BodyShort>
            )}

            {markdown && <Content {...props} item={item} />}
          </div>
        ))}
      </div>
    </>
  )
}
