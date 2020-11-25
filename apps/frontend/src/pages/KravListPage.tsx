import {Block} from 'baseui/block'
import {H1, LabelSmall} from 'baseui/typography'
import React from 'react'
import {useKravPage} from '../api/KravApi'
import Button from '../components/common/Button'
import {theme} from '../util'
import {ObjectLink} from '../components/common/RouteLink'
import {ObjectType} from '../components/admin/audit/AuditTypes'
import {kravName} from './KravPage'


export const KravListPage = () => {
  const [krav, prev, next] = useKravPage(20)


  return (
    <Block>
      <H1>Krav</H1>

      <Block display='flex' flexDirection='column'>
        {krav.content.map((k, i) =>
          <ObjectLink id={k.id} type={ObjectType.Krav} key={i}>#{krav.pageSize * krav.pageNumber + i + 1} {kravName(k)}</ObjectLink>
        )}
      </Block>
      <Block display='flex' alignItems='center' marginTop={theme.sizing.scale1000}>
        <LabelSmall marginRight={theme.sizing.scale400}>Side {krav.pageNumber + 1}/{krav.pages}</LabelSmall>
        <Button onClick={prev} size='compact' disabled={krav.pageNumber === 0}>Forrige</Button>
        <Button onClick={next} size='compact' disabled={krav.pageNumber >= krav.pages - 1}>Neste</Button>
      </Block>
    </Block>
  )
}
