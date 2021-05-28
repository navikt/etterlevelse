import {Etterlevelse} from '../../constants'
import {Block} from 'baseui/block'
import React from 'react'
import {etterlevelseStatus} from '../../pages/EtterlevelsePage'
import {theme} from '../../util'
import moment from 'moment'
import RouteLink from '../common/RouteLink'
import {behandlingName, useBehandling} from '../../api/BehandlingApi'
import {Spinner} from '../common/Spinner'
import {Label} from '../common/PropertyLabel'
import {kravNumView} from '../../pages/KravPage'
import { H2 } from 'baseui/typography'

const formatDate = (date?: string) => date && moment(date).format('ll')

export const ViewEtterlevelse = ({etterlevelse}: {etterlevelse: Etterlevelse}) => {
  const [behandling] = useBehandling(etterlevelse.behandlingId)

  return (
    <Block width='100%' marginTop='48px'>
      <H2>
        Kravet etterlevels av
      </H2>
      <Label title='Behandling'>
        {behandling ?
          <RouteLink href={`/behandling/${behandling.id}`}>
            {behandlingName(behandling)}
          </RouteLink>
          : etterlevelse.behandlingId && <> <Spinner size={theme.sizing.scale600}/>{etterlevelse.behandlingId}</>}
      </Label>
      <Label title='Krav'>
        <RouteLink href={`/krav/${etterlevelse.kravNummer}/${etterlevelse.kravVersjon}`}>{kravNumView(etterlevelse)}</RouteLink>
      </Label>

      <Block height={theme.sizing.scale600}/>

      <Label title='Begrunnelse' markdown={etterlevelse.begrunnelse}/>
      <Label title='Dokumentasjon' markdown={etterlevelse.dokumentasjon}/>

      <Block height={theme.sizing.scale600}/>

      <Label title='Frist for ferdigstillelse'>{formatDate(etterlevelse.fristForFerdigstillelse)}</Label>

      <Block height={theme.sizing.scale600}/>

      <Label title='Status'>{etterlevelseStatus(etterlevelse.status)}</Label>
    </Block>
  )
}
