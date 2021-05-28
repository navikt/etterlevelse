import { Etterlevelse } from '../../constants'
import { Block } from 'baseui/block'
import React from 'react'
import { etterlevelseStatus } from '../../pages/EtterlevelsePage'
import { theme } from '../../util'
import moment from 'moment'
import RouteLink from '../common/RouteLink'
import { behandlingName, useBehandling } from '../../api/BehandlingApi'
import { Spinner } from '../common/Spinner'
import { Label } from '../common/PropertyLabel'
import { H2, Paragraph2 } from 'baseui/typography'

const formatDate = (date?: string) => date && moment(date).format('ll')

export const ViewEtterlevelse = ({ etterlevelse }: { etterlevelse: Etterlevelse }) => {
  const [behandling] = useBehandling(etterlevelse.behandlingId)

  return (
    <Block width='100%' marginTop='48px'>
      <H2>
        Kravet etterlevels av
      </H2>
      {behandling ?
        <Block>
          <RouteLink
            href={`/behandling/${behandling.id}`}
            style={{
              fontSize: '21px',
              fontWeight: 700,
              lineHeight: '40px'
            }}
          >
            {behandlingName(behandling)}
          </RouteLink>
          <Paragraph2 marginTop='2px'>
            Overordnet behandlingsaktivitet
            </Paragraph2>
        </Block>
        : etterlevelse.behandlingId && <Block> <Spinner size={theme.sizing.scale600} />{etterlevelse.behandlingId}</Block>
      }

      <Block height={theme.sizing.scale600} />

      <Label title='Begrunnelse' markdown={etterlevelse.begrunnelse} />
      <Label title='Dokumentasjon' markdown={etterlevelse.dokumentasjon} />

      <Block height={theme.sizing.scale600} />

      <Label title='Frist for ferdigstillelse'>{formatDate(etterlevelse.fristForFerdigstillelse)}</Label>

      <Block height={theme.sizing.scale600} />

      <Label title='Status'>{etterlevelseStatus(etterlevelse.status)}</Label>
    </Block>
  )
}
