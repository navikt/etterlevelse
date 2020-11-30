import {Block} from 'baseui/block'
import {H2} from 'baseui/typography'
import {useHistory, useParams} from 'react-router-dom'
import {useEtterlevelse} from '../api/EtterlevelseApi'
import React, {useState} from 'react'
import {Etterlevelse, EtterlevelseStatus} from '../constants'
import Button from '../components/common/Button'
import {ViewEtterlevelse} from '../components/etterlevelse/ViewEtterlevelse'
import {EditEtterlevelse} from '../components/etterlevelse/EditEtterlevelse'
import RouteLink from '../components/common/RouteLink'
import {Skeleton} from 'baseui/skeleton'
import {theme} from '../util'

export const etterlevelseName = (etterlevelse: Etterlevelse) => `${etterlevelse.kravNummer}.${etterlevelse.kravVersjon} - ${etterlevelse.begrunnelse}`

export const etterlevelseStatus = (status: EtterlevelseStatus) => {
  switch (status) {
    case EtterlevelseStatus.UNDER_REDIGERING:
      return 'Under redigering'
    case EtterlevelseStatus.FERDIG:
      return 'Ferdig'
    default:
      return status
  }
}

export const EtterlevelsePage = () => {
  const params = useParams<{id?: string}>()
  const [etterlevelse, setEtterlevelse] = useEtterlevelse(params.id)
  const [edit, setEdit] = useState(etterlevelse && !etterlevelse.id)
  const history = useHistory()

  const loading = !edit && !etterlevelse

  return (
    <Block>
        {loading && <LoadingSkeleton/>}
        {!loading && <>
          <Block>
            <Block display='flex' justifyContent='flex-end'>
              <RouteLink href={'/etterlevelse'}>
                <Button size='compact' kind='tertiary'>Tilbake</Button>
              </RouteLink>
              {etterlevelse?.id && <Button size='compact' onClick={() => setEdit(!edit)} marginLeft>{edit ? 'Avbryt' : 'Rediger'}</Button>}
            </Block>
            <H2>Etterlevelse: {etterlevelse && etterlevelse?.kravNummer !== 0 ? etterlevelseName(etterlevelse) : 'Ny'}</H2>
          </Block>
        </>}

      {!edit && etterlevelse && !loading && <ViewEtterlevelse etterlevelse={etterlevelse}/>}
      {edit && etterlevelse && <EditEtterlevelse etterlevelse={etterlevelse} close={k => {
        if (k) {
          setEtterlevelse(k)
          if (k.id !== etterlevelse.id) {
            history.push(`/etterlevelse/${k.id}`)
          }
        }
        setEdit(false)
      }}/>}
    </Block>
  )
}

const LoadingSkeleton = () =>
  <Block width='100%'>
    <Block display='flex' justifyContent='space-between' alignItems='center' width='100%'>
      <H2 display='flex' alignItems='center'>

        Etterlevelse:
        <Block marginRight={theme.sizing.scale400}/>
        <Skeleton height={theme.sizing.scale1000} width='400px' animation/>
      </H2>
      <Block display='flex'>
        <Skeleton height={theme.sizing.scale1000} width='40px' animation/>
        <Block marginRight={theme.sizing.scale400}/>
        <Skeleton height={theme.sizing.scale1000} width='40px' animation/>
      </Block>
    </Block>
    <Block maxWidth='600px'>
      <Skeleton rows={12} animation/>
    </Block>
  </Block>
