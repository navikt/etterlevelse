'use client'

import { TNavigableItem } from '@/constants/admin/audit/auditConstants'
import { EListName, ICode } from '@/constants/kodeverk/kodeverkConstants'
import { CodelistContext } from '@/provider/kodeverk/kodeverkProvider'
import { urlForObject } from '@/routes/urlForObject/urlForObject'
import { BodyShort } from '@navikt/ds-react'
import { Fragment, FunctionComponent, ReactNode, useContext } from 'react'
import { ExternalLink } from '../externalLink/externalLink'
import { Markdown } from '../markdown/markdown'

type TContent = {
  item: ReactNode | string
  list?: EListName
  linkCodelist?: boolean
  markdown?: boolean
}

const Content: FunctionComponent<TContent> = ({ item, list, linkCodelist, markdown }) => (
  <>
    {list && <ListCodelist item={item} linkCodelist={linkCodelist} list={list} />}
    {markdown && <Markdown source={item as string} />}
  </>
)

type TListCodelist = {
  item: ReactNode | string
  list: EListName
  linkCodelist?: boolean
}

const ListCodelist: FunctionComponent<TListCodelist> = ({ item, linkCodelist, list }) => {
  const itemString = item as string

  const codelist = useContext(CodelistContext)

  return (
    <>
      {linkCodelist && (
        <ExternalLink href={urlForObject(list as EListName & TNavigableItem, itemString)}>
          {codelist.utils.getShortname(list as EListName & TNavigableItem, itemString)}
        </ExternalLink>
      )}
      {!linkCodelist && <>{codelist.utils.getShortname(list, itemString)}</>}
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
      <MarkdownItems
        inColumn={inColumn}
        itemsReactNode={itemsReactNode}
        commaSeparator={commaSeparator}
        markdown={markdown}
        props={props}
      />
    </>
  )
}

type TMarkdownItems = {
  commaSeparator?: boolean
  markdown?: boolean
  inColumn?: boolean
  itemsReactNode: ReactNode[]
  props: TDotTagsParams
}

const MarkdownItems: FunctionComponent<TMarkdownItems> = ({
  inColumn,
  itemsReactNode,
  commaSeparator,
  markdown,
  props,
}) => (
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
            <Content {...props} item={item} />
          </BodyShort>
        )}

        {markdown && <Content {...props} item={item} />}
      </div>
    ))}
  </div>
)
