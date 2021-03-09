import {Block} from 'baseui/block'
import {H2, LabelSmall} from 'baseui/typography'
import React, {useState} from 'react'
import Button from '../components/common/Button'
import {theme} from '../util'
import RouteLink from '../components/common/RouteLink'
import {user} from '../services/User'
import {KravTable} from '../components/common/KravFilterTable'
import {useKravFilter} from '../api/KravGraphQLApi'
import {Button as BButton} from 'baseui/button'
import {ButtonGroup} from 'baseui/button-group'

enum Mode {
  siste,
  gjeldende,
  alle
}

export const KravListPage = () => {
  const [mode, setMode] = useState<Mode>(0)
  const [pageNumber, setPageNumber] = useState<number>(0)
  const [pageSize, setPageSize] = useState<number>(10)
  const res = useKravFilter({
    sistRedigert: mode === Mode.siste ? pageSize : undefined,
    gjeldendeKrav: mode === Mode.gjeldende,
    pageNumber, pageSize
  })

  const pages = res.data?.krav.pages || 1
  const prev = () => setPageNumber(Math.max(0, pageNumber - 1))
  const next = () => setPageNumber(Math.min(pages - 1, pageNumber + 1))

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
      <Block>
        <ButtonGroup selected={mode} mode='radio' size={'compact'} onClick={(e, i) => setMode(i)}>
          <BButton>Sist redigerte</BButton>
          <BButton>Gjeldende</BButton>
          <BButton>Alle</BButton>
        </ButtonGroup>
      </Block>

      <KravTable queryResult={res}/>
      <Block display='flex' alignItems='center' marginTop={theme.sizing.scale1000}>
        <LabelSmall marginRight={theme.sizing.scale400}>Side {pageNumber + 1}/{pages}</LabelSmall>
        <Button onClick={prev} size='compact' disabled={pageNumber === 0}>Forrige</Button>
        <Button onClick={next} size='compact' disabled={pageNumber >= pages - 1}>Neste</Button>
      </Block>
    </Block>
  )
}
