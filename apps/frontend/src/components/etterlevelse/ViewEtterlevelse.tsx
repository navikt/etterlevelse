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
import { Teams } from '../common/TeamName'
import { Card } from 'baseui/card'
import { ettlevColors } from '../../util/theme'
import { ThemeProvider } from 'baseui'

const formatDate = (date?: string) => date && moment(date).format('ll')

export const ViewEtterlevelse = ({ etterlevelse }: { etterlevelse: Etterlevelse }) => {
  const [behandling] = useBehandling(etterlevelse.behandlingId)

  return (
    <Block width='100%' marginTop='48px'>
      <Block display='flex' width='100%'>
        <Block>
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
              <Block marginTop={theme.sizing.scale850}>
                <Teams teams={behandling.teams} link list />
              </Block>
            </Block>
            : etterlevelse.behandlingId && <Block> <Spinner size={theme.sizing.scale600} />{etterlevelse.behandlingId}</Block>
          }
        </Block>

        <Block display='flex' flex='1' justifyContent='flex-end' marginTop={theme.sizing.scale950}>
          <Block>
            <Card>
              <Paragraph2 $style={{ fontWeight: 900, lineHeight: '22px', color: ettlevColors.green600 }}>
                Status: {etterlevelseStatus(etterlevelse.status)}
              </Paragraph2>
            </Card>
          </Block>
        </Block>
      </Block>

      <Block marginTop={theme.sizing.scale1400}>
        <H2>
          Dokumetasjon
          </H2>
        <Card>
          <Block display='flex' width='100%'>
            <Block>
              <Label title='' markdown={etterlevelse.begrunnelse} />
            </Block>
            <Block display='flex' flex='1' justifyContent='flex-end'>
 
            </Block>
          </Block>
        </Card>
      </Block>

      <Block height={theme.sizing.scale600} />


      <Label title='Dokumentasjon' markdown={etterlevelse.dokumentasjon} />

      <Block height={theme.sizing.scale600} />

      <Label title='Frist for ferdigstillelse'>{formatDate(etterlevelse.fristForFerdigstillelse)}</Label>

      <Block height={theme.sizing.scale600} />


    </Block>
  )
}
