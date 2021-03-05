import {Block} from 'baseui/block'
import {H2, LabelSmall} from 'baseui/typography'
import React from 'react'
import {useKravPage} from '../api/KravApi'
import Button from '../components/common/Button'
import {theme} from '../util'
import RouteLink from '../components/common/RouteLink'
import {kravName} from './KravPage'
import {Spinner} from '../components/common/Spinner'
import {user} from '../services/User'


export const KravListPage = () => {
  const [krav, prev, next, loading] = useKravPage(20)

  return (
    <Block width='100%'>
      <Block display='flex' justifyContent='space-between' alignItems='center'>
        <H2>Krav</H2>

        <Block>
          {user.isKraveier() &&
          <RouteLink href={'/krav/ny'}>
            <Button size='compact'>Legg til nytt krav</Button>
          </RouteLink>}
        </Block>
      </Block>

      <Block display='flex' flexDirection='column'>
        {!loading && krav.content.map((k, i) =>
          <Block key={k.id} marginBottom={theme.sizing.scale300}>
            <RouteLink href={`/krav/${k.kravNummer}/${k.kravVersjon}`}>#{krav.pageSize * krav.pageNumber + i + 1} {kravName(k)}</RouteLink>
          </Block>
        )}
        {loading && <Spinner size={theme.sizing.scale2400}/>}
      </Block>
      <Block display='flex' alignItems='center' marginTop={theme.sizing.scale1000}>
        <LabelSmall marginRight={theme.sizing.scale400}>Side {krav.pageNumber + 1}/{krav.pages}</LabelSmall>
        <Button onClick={prev} size='compact' disabled={krav.pageNumber === 0}>Forrige</Button>
        <Button onClick={next} size='compact' disabled={krav.pageNumber >= krav.pages - 1}>Neste</Button>
      </Block>
    </Block>
  )
}
