import {Block} from 'baseui/block'
import {H2, LabelSmall} from 'baseui/typography'
import React from 'react'
import {useEtterlevelsePage} from '../api/EtterlevelseApi'
import Button from '../components/common/Button'
import {theme} from '../util'
import RouteLink from '../components/common/RouteLink'
import {etterlevelseName} from './EtterlevelsePage'
import {Spinner} from '../components/common/Spinner'
import {user} from '../services/User'


export const EtterlevelseListPage = () => {
  const [etterlevelse, prev, next, loading] = useEtterlevelsePage(20)

  return (
    <Block>
      <Block display='flex' justifyContent='space-between' alignItems='center'>
        <H2>Etterlevelse</H2>

        <Block>
          {user.canWrite() &&
          <RouteLink href={'/etterlevelse/ny'}>
            <Button size='compact'>Ny etterlevelse</Button>
          </RouteLink>}
        </Block>
      </Block>

      <Block display='flex' flexDirection='column'>
        {!loading && etterlevelse.content.map((k, i) =>
          <Block key={k.id} marginBottom={theme.sizing.scale300}>
            <RouteLink href={`/etterlevelse/${k.id}`}>#{etterlevelse.pageSize * etterlevelse.pageNumber + i + 1} {etterlevelseName(k)}</RouteLink>
          </Block>
        )}
        {loading && <Spinner size={theme.sizing.scale2400}/>}
      </Block>
      <Block display='flex' alignItems='center' marginTop={theme.sizing.scale1000}>
        <LabelSmall marginRight={theme.sizing.scale400}>Side {etterlevelse.pageNumber + 1}/{etterlevelse.pages}</LabelSmall>
        <Button onClick={prev} size='compact' disabled={etterlevelse.pageNumber === 0}>Forrige</Button>
        <Button onClick={next} size='compact' disabled={etterlevelse.pageNumber >= etterlevelse.pages - 1}>Neste</Button>
      </Block>
    </Block>
  )
}
