import {Block} from 'baseui/block'
import {H2, LabelSmall} from 'baseui/typography'
import React, {useState} from 'react'
import Button from '../components/common/Button'
import {theme} from '../util'
import RouteLink from '../components/common/RouteLink'
import {user} from '../services/User'
import {KravTable} from '../components/common/KravFilterTable'
import {useKravFilter} from '../api/KravGraphQLApi'


export const KravListPage = () => {
  const [pageNumber, setPageNumber] = useState<number>(0)
  const [pageSize, setPageSize] = useState<number>(20)

  const res = useKravFilter({sistRedigert: 10, pageNumber, pageSize})
  let pages = res.data?.krav.pages || 1

  const prev = () => setPageNumber(Math.max(0, pageNumber - 1))
  const next = () => setPageNumber(Math.min(pages ? pages - 1 : 0, pageNumber + 1))

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

      <KravTable queryResult={res}/>

      {/*<Block display='flex' flexDirection='column'>*/}
      {/*  {!loading && krav.content.map((k, i) =>*/}
      {/*    <Block key={k.id} marginBottom={theme.sizing.scale300}>*/}
      {/*      <RouteLink href={`/krav/${k.kravNummer}/${k.kravVersjon}`}>#{krav.pageSize * krav.pageNumber + i + 1} {kravName(k)}</RouteLink>*/}
      {/*    </Block>*/}
      {/*  )}*/}
      {/*  {loading && <Spinner size={theme.sizing.scale2400}/>}*/}
      {/*</Block>*/}
      <Block display='flex' alignItems='center' marginTop={theme.sizing.scale1000}>
        <LabelSmall marginRight={theme.sizing.scale400}>Side {pageNumber + 1}/{pages}</LabelSmall>
        <Button onClick={prev} size='compact' disabled={pageNumber === 0}>Forrige</Button>
        <Button onClick={next} size='compact' disabled={pageNumber >= pages - 1}>Neste</Button>
      </Block>
    </Block>
  )
}
