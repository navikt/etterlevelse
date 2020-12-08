import {Etterlevelse} from '../../constants'
import {Block} from 'baseui/block'
import React from 'react'
import {etterlevelseStatus} from '../../pages/EtterlevelsePage'
import {theme} from '../../util'
import DataText from '../common/DataText'
import {Markdown} from '../common/Markdown'
import moment from 'moment'
import RouteLink from '../common/RouteLink'
import {behandlingName, useBehandling} from '../../api/BehandlingApi'
import {Spinner} from '../common/Spinner'

const formatDate = (date?: string) => date && moment(date).format('ll')

export const ViewEtterlevelse = ({etterlevelse}: {etterlevelse: Etterlevelse}) => {
  const [behandling] = useBehandling(etterlevelse.behandlingId)

  return (
    <Block width='100%'>
      <Label title='Behandling'>
        {behandling ?
          <RouteLink href={`/behandling/${behandling.id}`}>
            {behandlingName(behandling)}
          </RouteLink>
          : etterlevelse.behandlingId && <> <Spinner size={theme.sizing.scale600}/>{etterlevelse.behandlingId}</>}
      </Label>
      <Label title='Krav'>
        <RouteLink href={`/krav/${etterlevelse.kravNummer}/${etterlevelse.kravVersjon}`}>{etterlevelse.kravNummer}.{etterlevelse.kravVersjon}</RouteLink>
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

const Label = (props: {title: string, children?: React.ReactNode, markdown?: string | string[]}) => {
  return (
    <DataText label={props.title}>
      {props.markdown ?
        <Markdown sources={Array.isArray(props.markdown) ? props.markdown : [props.markdown]} noMargin shortenLinks/>
        : props.children}
    </DataText>
  )
}
