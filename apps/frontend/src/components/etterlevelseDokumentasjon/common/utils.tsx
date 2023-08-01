import { EtterlevelseDokumentasjon, EtterlevelseStatus } from '../../../constants'
import { ReactNode } from 'react'
import { Block, Responsive } from 'baseui/block'
import { Helmet } from 'react-helmet'
import { HeadingXXLarge, LabelSmall } from 'baseui/typography'
import { ettlevColors } from '../../../util/theme'
import { Teams } from '../../common/TeamName'
import { env } from '../../../util/env'
import { ExternalLink, ExternalLinkWrapper } from '../../common/RouteLink'
import moment from 'moment'
import EditEtterlevelseDokumentasjonModal from '../edit/EditEtterlevelseDokumentasjonModal'
import { Notification } from 'baseui/notification'
import { borderColor, borderRadius, borderStyle, borderWidth, padding } from '../../common/Style'
import { warningAlert } from '../../Images'

export const responsiveDisplayEtterlevelseDokumentasjonPage: Responsive<any> = ['block', 'block', 'block', 'block', 'flex', 'flex']

const getBehandlingLinks = (etterlevelseDokumentasjon: EtterlevelseDokumentasjon) => {
  return (
    <Block>
      {etterlevelseDokumentasjon.behandlingIds.map((behandlingId, index) => {
        return (
          <Block key={'behandling_link_' + index}>
            <ExternalLink href={`${env.pollyBaseUrl}process/${behandlingId}`}>
              <ExternalLinkWrapper
                text={
                  etterlevelseDokumentasjon.behandlinger && etterlevelseDokumentasjon.behandlinger.length > 0
                    ? `B${etterlevelseDokumentasjon.behandlinger[index].nummer} ${etterlevelseDokumentasjon.behandlinger[index].overordnetFormaal?.shortName}: ${etterlevelseDokumentasjon.behandlinger[index].navn}`
                    : 'Ingen data'
                }
              />
            </ExternalLink>
          </Block>
        )
      })}
    </Block>
  )
}

export const getMainHeader = (etterlevelseDokumentasjon: EtterlevelseDokumentasjon, setEtterlevelseDokumentasjon?: (e: EtterlevelseDokumentasjon) => void, helmet?: ReactNode) => (
  <Block display={responsiveDisplayEtterlevelseDokumentasjonPage} justifyContent="space-between" marginBottom="32px" marginTop="38px">
    {helmet ? (
      helmet
    ) : (
      <Helmet>
        <meta charSet="utf-8" />
        <title>
          E{etterlevelseDokumentasjon.etterlevelseNummer.toString()} {etterlevelseDokumentasjon.title}
        </title>
      </Helmet>
    )}
    <Block width="100%">
      <Block display="flex">
        <Block>
          <LabelSmall color={ettlevColors.green600}>E{etterlevelseDokumentasjon.etterlevelseNummer.toString()}</LabelSmall>
          <HeadingXXLarge marginTop="0" color={ettlevColors.green800}>
            {etterlevelseDokumentasjon.title}
          </HeadingXXLarge>
        </Block>
        {setEtterlevelseDokumentasjon !== undefined && (
          <Block display="flex" flex="1" justifyContent="flex-end" $style={{ whiteSpace: 'nowrap' }}>
            <EditEtterlevelseDokumentasjonModal etterlevelseDokumentasjon={etterlevelseDokumentasjon} setEtterlevelseDokumentasjon={setEtterlevelseDokumentasjon} isEditButton />
          </Block>
        )}
      </Block>

      {etterlevelseDokumentasjon.knyttetTilVirkemiddel && etterlevelseDokumentasjon.virkemiddelId && (
        <Block display="flex" alignItems="center">
          <LabelSmall $style={{ lineHeight: '22px', marginRight: '10px', fontSize: '16px', color: ettlevColors.green600 }}>Virkmiddel:</LabelSmall>
          <Block
            $style={{
              fontFamily: 'Source Sans Pro',
              fontWeight: 500,
            }}
          >
            {etterlevelseDokumentasjon.virkemiddel?.navn}
          </Block>
        </Block>
      )}
      {etterlevelseDokumentasjon.behandlerPersonopplysninger && (
        <Block display="flex" alignItems="center" marginTop={etterlevelseDokumentasjon.virkemiddelId ? '8px' : '0px'}>
          <LabelSmall $style={{ lineHeight: '22px', marginRight: '10px', fontSize: '16px', color: ettlevColors.green600 }}>Behandling:</LabelSmall>
          {etterlevelseDokumentasjon.behandlingIds && etterlevelseDokumentasjon.behandlerPersonopplysninger ? (
            getBehandlingLinks(etterlevelseDokumentasjon)
          ) : (
            <Block
              justifyContent="center"
              display="flex"
              alignItems="center"
              overrides={{
                Block: {
                  style: {
                    ...borderWidth('1px'),
                    ...borderStyle('solid'),
                    ...borderColor(ettlevColors.navOransje),
                    ...borderRadius('4px'),
                    backgroundColor: ettlevColors.warning50,
                    fontWeight: 500,
                    fontSize: '16px',
                    fontFamily: 'Source Sans Pro',
                    lineHeight: '22px',
                    ...padding('8px', '4px'),
                  },
                },
              }}
            >
              <img
                src={warningAlert}
                width="20px"
                height="20px"
                alt={'warning icon'}
                style={{
                  marginRight: '5px',
                }}
              />
              Husk å legge til behandling fra behandlingskatalogen
            </Block>
          )}
        </Block>
      )}
      <Block display="flex" alignItems="center" width="100%" marginTop={'8px'}>
        <Block display={'flex'} width="100%" alignItems="center">
          <LabelSmall $style={{ lineHeight: '22px', marginRight: '10px', fontSize: '16px', color: ettlevColors.green600 }}>Team: </LabelSmall>
          {etterlevelseDokumentasjon.teams.length > 0 ? (
            <Teams teams={etterlevelseDokumentasjon.teams} link fontColor={ettlevColors.green800} style={{ fontSize: '16px', lineHeight: '22px', fontWeight: 400 }} />
          ) : (
            <Block
              $style={{
                fontFamily: 'Source Sans Pro',
                fontWeight: 500,
              }}
            >
              Team er ikke angitt
            </Block>
          )}
        </Block>
      </Block>
    </Block>
  </Block>
)

export const getNewestKravVersjon = (list: any[]) => {
  let relevanteStatusListe = [...list]

  relevanteStatusListe = relevanteStatusListe.filter((value, index, self) => index === self.findIndex((k) => k.kravNummer === value.kravNummer))

  return relevanteStatusListe
}

export const getEtterlevelseStatus = (status?: EtterlevelseStatus, frist?: string) => {
  switch (status) {
    case EtterlevelseStatus.UNDER_REDIGERING:
      return 'Under arbeid'
    case EtterlevelseStatus.FERDIG:
      return 'Under arbeid'
    case EtterlevelseStatus.IKKE_RELEVANT:
      return 'Ikke relevant'
    case EtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT:
      return 'Ikke relevant'
    case EtterlevelseStatus.FERDIG_DOKUMENTERT:
      return 'Ferdig utfylt'
    case EtterlevelseStatus.OPPFYLLES_SENERE:
      if (frist) {
        return 'Utsatt til: ' + moment(frist).format('ll')
      } else {
        return 'Utsatt'
      }
    default:
      return ''
  }
}

export const getStatusLabelColor = (status: EtterlevelseStatus) => {
  switch (status) {
    case EtterlevelseStatus.UNDER_REDIGERING:
      return {
        background: ettlevColors.white,
        border: '#0B483F',
      }
    case EtterlevelseStatus.FERDIG:
      return {
        background: ettlevColors.white,
        border: '#0B483F',
      }
    case EtterlevelseStatus.IKKE_RELEVANT:
      return {
        background: ettlevColors.grey50,
        border: ettlevColors.grey200,
      }
    case EtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT:
      return {
        background: ettlevColors.grey50,
        border: ettlevColors.grey200,
      }
    case EtterlevelseStatus.FERDIG_DOKUMENTERT:
      return {
        background: ettlevColors.green50,
        border: ettlevColors.green400,
      }
    case EtterlevelseStatus.OPPFYLLES_SENERE:
      return {
        background: ettlevColors.warning50,
        border: '#D47B00',
      }
    default:
      return {
        background: ettlevColors.white,
        border: ettlevColors.green400,
      }
  }
}
