import {EtterlevelseDokumentasjon, EtterlevelseStatus} from '../../../constants'
import {ReactNode} from 'react'
import {Block, Responsive} from 'baseui/block'
import {Helmet} from 'react-helmet'
import {HeadingXXLarge, LabelSmall} from 'baseui/typography'
import {ettlevColors} from '../../../util/theme'
import {Teams} from '../../common/TeamName'
import {ExternalButton} from '../../common/Button'
import {env} from '../../../util/env'
import {ExternalLinkWrapper} from '../../common/RouteLink'
import moment from 'moment'

export const responsiveDisplayEtterlevelseDokumentasjonPage: Responsive<any> = ['block', 'block', 'block', 'block', 'flex', 'flex']

export const getMainHeader = (etterlevelseDokumentasjon: EtterlevelseDokumentasjon, helmet?: ReactNode) => (
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
      <LabelSmall color={ettlevColors.green600}>E{etterlevelseDokumentasjon.etterlevelseNummer.toString()}</LabelSmall>
      <HeadingXXLarge marginTop="0" color={ettlevColors.green800}>
        {etterlevelseDokumentasjon.title}
      </HeadingXXLarge>
      {etterlevelseDokumentasjon.behandlingId && (
        <Block>
          <LabelSmall $style={{ lineHeight: '22px', marginRight: '10px', fontSize: '16px', color: ettlevColors.green600 }}>Behandling:</LabelSmall>
          <Block
            $style={{
              fontFamily: 'Source Sans Pro',
              fontWeight: 500,
            }}
          >
            B{etterlevelseDokumentasjon.behandling?.nummer} {etterlevelseDokumentasjon.behandling?.overordnetFormaal?.shortName}: {etterlevelseDokumentasjon.behandling?.navn}
          </Block>
        </Block>
      )}
      <Block display="flex" alignItems="center" width="100%" marginTop={'24px'}>
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
        {etterlevelseDokumentasjon.behandlingId && (
          <Block display="flex" justifyContent="flex-end" alignContent="center" $style={{ whiteSpace: 'nowrap' }}>
            <ExternalButton kind={'secondary'} href={`${env.pollyBaseUrl}process/${etterlevelseDokumentasjon.behandlingId}`} size="mini">
              <ExternalLinkWrapper text="Til behandlingskatalogen" />
            </ExternalButton>
          </Block>
        )}
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
