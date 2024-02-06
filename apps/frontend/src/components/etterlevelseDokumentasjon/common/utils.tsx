/* TODO USIKKER */
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

const getBehandlingLinks = (etterlevelseDokumentasjon: IEtterlevelseDokumentasjon) => (
  <div>
    {etterlevelseDokumentasjon.behandlingIds.map((behandlingId, index) => (
      <div key={'behandling_link_' + index}>
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
      </div>
    ))}
  </div>
)

interface IPropsGetMainHeader {
  etterlevelseDokumentasjon: IEtterlevelseDokumentasjon
  setEtterlevelseDokumentasjon?: (e: IEtterlevelseDokumentasjon) => void
  helmet?: ReactNode
}

export const getMainHeader = ({
  etterlevelseDokumentasjon,
  setEtterlevelseDokumentasjon,
  helmet,
}: IPropsGetMainHeader) => (
  <Block
    className="justify-between mt-9 mb-8"
    display={responsiveDisplayEtterlevelseDokumentasjonPage}
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
    <div className="w-full">
      <div className="flex">
        <div>
          <LabelSmall color={ettlevColors.green600}>
            E{etterlevelseDokumentasjon.etterlevelseNummer.toString()}
          </LabelSmall>
          <HeadingXXLarge marginTop="0" color={ettlevColors.green800}>
            {etterlevelseDokumentasjon.title}
          </HeadingXXLarge>
        </div>
        {setEtterlevelseDokumentasjon !== undefined && (
          <Block className="flex flex-1 justify-end" $style={{ whiteSpace: 'nowrap' }}>
            <EditEtterlevelseDokumentasjonModal
              etterlevelseDokumentasjon={etterlevelseDokumentasjon}
              setEtterlevelseDokumentasjon={setEtterlevelseDokumentasjon}
              isEditButton
            />
          </Block>
        )}
      </div>

      {etterlevelseDokumentasjon.knyttetTilVirkemiddel &&
        etterlevelseDokumentasjon.virkemiddelId && (
          <div className="flex items-center">
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
          </div>
        )}
      {etterlevelseDokumentasjon.behandlerPersonopplysninger && (
        <Block
          className="flex"
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
              className="flex justify-center items-center"
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
      <div className="flex items-center w-full mt-2">
        <div className="flex w-full items-center">
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
        </div>
      </div>
    </div>
  </Block>
)

export const getNewestKravVersjon = (list: any[]): any[] => {
  let relevanteStatusListe = [...list]

  relevanteStatusListe = relevanteStatusListe.filter(
    (value, index, self) => index === self.findIndex((k) => k.kravNummer === value.kravNummer)
  )

  return relevanteStatusListe
}

interface IPropsGetEtterlevelseStatus {
  status?: EEtterlevelseStatus
  frist?: string
}

export const getEtterlevelseStatus = ({ status, frist }: IPropsGetEtterlevelseStatus): string => {
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

export const updateBehandlingNameWithNumber = (behandlinger: IBehandling[]): IBehandling[] => {
  return behandlinger.map((b) => {
    return { ...b, navn: 'B' + b.nummer + ' ' + b.overordnetFormaal.shortName + ': ' + b.navn }
  })
}

export const getStatusLabelColor = (status: EEtterlevelseStatus): string => {
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
