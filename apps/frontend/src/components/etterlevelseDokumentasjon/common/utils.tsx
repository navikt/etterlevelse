import { Block, Responsive } from 'baseui/block'
import { HeadingXXLarge, LabelSmall } from 'baseui/typography'
import moment from 'moment'
import { ReactNode } from 'react'
import { Helmet } from 'react-helmet'
import { EEtterlevelseStatus, IBehandling, IEtterlevelseDokumentasjon } from '../../../constants'
import { env } from '../../../util/env'
import { ettlevColors } from '../../../util/theme'
import { warningAlert } from '../../Images'
import { ExternalLink } from '../../common/RouteLink'
import { borderColor, borderRadius, borderStyle, borderWidth, padding } from '../../common/Style'
import { Teams } from '../../common/TeamName'
import EditEtterlevelseDokumentasjonModal from '../edit/EditEtterlevelseDokumentasjonModal'

export const responsiveDisplayEtterlevelseDokumentasjonPage: Responsive<any> = [
  'block',
  'block',
  'block',
  'block',
  'flex',
  'flex',
]

const getBehandlingLinks = (etterlevelseDokumentasjon: IEtterlevelseDokumentasjon) => {
  return (
    <Block>
      {etterlevelseDokumentasjon.behandlingIds.map((behandlingId, index) => {
        return (
          <Block key={'behandling_link_' + index}>
            {etterlevelseDokumentasjon.behandlinger &&
            etterlevelseDokumentasjon.behandlinger[index].navn ? (
              <ExternalLink href={`${env.pollyBaseUrl}process/${behandlingId}`}>
                {etterlevelseDokumentasjon.behandlinger &&
                etterlevelseDokumentasjon.behandlinger.length > 0
                  ? `${etterlevelseDokumentasjon.behandlinger[index].navn}`
                  : 'Ingen data'}
              </ExternalLink>
            ) : (
              <Block
                $style={{
                  fontSize: '18px',
                  lineHeight: '22px',
                  fontFamily: 'Source Sans Pro',
                  fontWeight: 'normal',
                }}
              >
                {etterlevelseDokumentasjon.behandlinger
                  ? etterlevelseDokumentasjon.behandlinger[index].navn
                  : 'Ingen data'}
              </Block>
            )}
          </Block>
        )
      })}
    </Block>
  )
}

export const getMainHeader = (
  etterlevelseDokumentasjon: IEtterlevelseDokumentasjon,
  setEtterlevelseDokumentasjon?: (e: IEtterlevelseDokumentasjon) => void,
  helmet?: ReactNode
) => (
  <Block
    display={responsiveDisplayEtterlevelseDokumentasjonPage}
    justifyContent="space-between"
    marginBottom="32px"
    marginTop="38px"
  >
    {helmet ? (
      helmet
    ) : (
      <Helmet>
        <meta charSet="utf-8" />
        <title>
          E{etterlevelseDokumentasjon.etterlevelseNummer.toString()}{' '}
          {etterlevelseDokumentasjon.title}
        </title>
      </Helmet>
    )}
    <Block width="100%">
      <Block display="flex">
        <Block>
          <LabelSmall color={ettlevColors.green600}>
            E{etterlevelseDokumentasjon.etterlevelseNummer.toString()}
          </LabelSmall>
          <HeadingXXLarge marginTop="0" color={ettlevColors.green800}>
            {etterlevelseDokumentasjon.title}
          </HeadingXXLarge>
        </Block>
        {setEtterlevelseDokumentasjon !== undefined && (
          <Block
            display="flex"
            flex="1"
            justifyContent="flex-end"
            $style={{ whiteSpace: 'nowrap' }}
          >
            <EditEtterlevelseDokumentasjonModal
              etterlevelseDokumentasjon={etterlevelseDokumentasjon}
              setEtterlevelseDokumentasjon={setEtterlevelseDokumentasjon}
              isEditButton
            />
          </Block>
        )}
      </Block>

      {etterlevelseDokumentasjon.knyttetTilVirkemiddel &&
        etterlevelseDokumentasjon.virkemiddelId && (
          <Block display="flex" alignItems="center">
            <LabelSmall
              $style={{
                lineHeight: '22px',
                marginRight: '10px',
                fontSize: '16px',
                color: ettlevColors.green600,
              }}
            >
              Virkmiddel:
            </LabelSmall>
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
        <Block
          display="flex"
          alignItems={
            etterlevelseDokumentasjon.behandlingIds &&
            etterlevelseDokumentasjon.behandlingIds.length >= 1
              ? 'flex-start'
              : 'center'
          }
          marginTop={etterlevelseDokumentasjon.virkemiddelId ? '8px' : '0px'}
        >
          <LabelSmall
            $style={{
              lineHeight: '22px',
              marginRight: '10px',
              fontSize: '16px',
              color: ettlevColors.green600,
            }}
          >
            Behandling:
          </LabelSmall>
          {etterlevelseDokumentasjon.behandlingIds &&
          etterlevelseDokumentasjon.behandlingIds.length >= 1 &&
          etterlevelseDokumentasjon.behandlerPersonopplysninger ? (
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
          <LabelSmall
            $style={{
              lineHeight: '22px',
              marginRight: '10px',
              fontSize: '16px',
              color: ettlevColors.green600,
            }}
          >
            Team:{' '}
          </LabelSmall>
          {etterlevelseDokumentasjon.teams.length > 0 ? (
            <Teams teams={etterlevelseDokumentasjon.teams} link />
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

  relevanteStatusListe = relevanteStatusListe.filter(
    (value, index, self) => index === self.findIndex((k) => k.kravNummer === value.kravNummer)
  )

  return relevanteStatusListe
}

export const getEtterlevelseStatus = (status?: EEtterlevelseStatus, frist?: string) => {
  switch (status) {
    case EEtterlevelseStatus.UNDER_REDIGERING:
      return 'Under arbeid'
    case EEtterlevelseStatus.FERDIG:
      return 'Under arbeid'
    case EEtterlevelseStatus.IKKE_RELEVANT:
      return 'Ikke relevant'
    case EEtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT:
      return 'Ferdig utfylt'
    case EEtterlevelseStatus.FERDIG_DOKUMENTERT:
      return 'Ferdig utfylt'
    case EEtterlevelseStatus.OPPFYLLES_SENERE:
      if (frist) {
        return 'Utsatt til ' + moment(frist).format('ll')
      } else {
        return 'Utsatt'
      }
    default:
      return ''
  }
}

export const updateBehandlingNameWithNumber = (behandlinger: IBehandling[]) => {
  return behandlinger.map((behandling) => {
    return { ...behandling, navn: 'B' + behandling.nummer + ' ' + behandling.overordnetFormaal.shortName + ': ' + behandling.navn }
  })
}

export const getStatusLabelColor = (status: EEtterlevelseStatus) => {
  switch (status) {
    case EEtterlevelseStatus.UNDER_REDIGERING:
      return 'info'
    case EEtterlevelseStatus.FERDIG:
      return 'info'
    case EEtterlevelseStatus.IKKE_RELEVANT:
      return 'neutral'
    case EEtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT:
      return 'success'
    case EEtterlevelseStatus.FERDIG_DOKUMENTERT:
      return 'success'
    case EEtterlevelseStatus.OPPFYLLES_SENERE:
      return 'warning'
    default:
      return 'neutral'
  }
}
