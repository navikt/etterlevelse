import { IArtOgOmfangError } from '@/constants/behandlingensArtOgOmfang/behandlingensArtOgOmfangConstants'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { IRisikoscenario } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import {
  etterlevelseDokumentasjonIdUrl,
  etterlevelsesDokumentasjonEditUrl,
} from '@/routes/etterlevelseDokumentasjon/etterlevelseDokumentasjonRoutes'
import {
  etterlevelseDokumentasjonPvkTabUrl,
  pvkDokumentasjonStepUrl,
  pvkDokumentasjonTabFilterTiltakUrl,
} from '@/routes/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensvurderingRoutes'
import {
  risikoDokumentasjonTemaKravNummerVersjonUrl,
  risikoscenarioFilterAlleUrl,
  tabTiltakQuery,
} from '@/routes/risikoscenario/risikoscenarioRoutes'
import { ErrorSummary } from '@navikt/ds-react'
import { FormikErrors } from 'formik'
import _ from 'lodash'
import { FunctionComponent, RefObject } from 'react'

type TProps = {
  errors: FormikErrors<IPvkDokument>
  etterlevelseDokumentasjonId: string
  pvkDokumentId: number | string
  risikoeiereDataError: boolean
  avdelingError: boolean
  medlemError: boolean
  artOgOmfangError: IArtOgOmfangError
  behandlingensLivslopError: boolean
  manglerBehandlingError: boolean
  risikoscenarioError: string
  generelleRisikoscenarioMedFeil: IRisikoscenario[]
  spesifikkeRisikoscenarioMedFeil: IRisikoscenario[]
  tiltakError: string
  tiltakAnsvarligError: string
  tiltakFristError: string
  tiltakFristUtgaattError: string
  pvkKravError: string
  savnerVurderingError: string
  errorSummaryRef: RefObject<HTMLDivElement | null>
}

export const SendInnErrorSummary: FunctionComponent<TProps> = ({
  errors,
  etterlevelseDokumentasjonId,
  pvkDokumentId,
  risikoeiereDataError,
  avdelingError,
  medlemError,
  behandlingensLivslopError,
  artOgOmfangError,
  risikoscenarioError,
  generelleRisikoscenarioMedFeil,
  spesifikkeRisikoscenarioMedFeil,
  tiltakError,
  tiltakAnsvarligError,
  tiltakFristError,
  tiltakFristUtgaattError,
  pvkKravError,
  savnerVurderingError,
  manglerBehandlingError,
  errorSummaryRef,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  const { meldingerTilPvo, ...updateErrors } = errors
  return (
    <div>
      {(!_.isEmpty(updateErrors) ||
        pvkKravError !== '' ||
        risikoeiereDataError ||
        avdelingError ||
        medlemError ||
        behandlingensLivslopError ||
        artOgOmfangError.stemmerPersonkategorier ||
        artOgOmfangError.personkategoriAntallBeskrivelse ||
        artOgOmfangError.tilgangsBeskrivelsePersonopplysningene ||
        artOgOmfangError.lagringsBeskrivelsePersonopplysningene ||
        risikoscenarioError !== '' ||
        spesifikkeRisikoscenarioMedFeil.length !== 0 ||
        tiltakError !== '' ||
        tiltakAnsvarligError !== '' ||
        tiltakFristError.length !== 0 ||
        tiltakFristUtgaattError !== '' ||
        savnerVurderingError !== '') && (
        <ErrorSummary
          ref={errorSummaryRef}
          heading='Du må rette disse feilene før du kan fortsette'
        >
          {manglerBehandlingError && (
            <ErrorSummary.Item
              target='_blank'
              href={`${etterlevelsesDokumentasjonEditUrl(etterlevelseDokumentasjonId)}#behandling`}
              className='max-w-[75ch]'
            >
              Dere må koble minst 1 behandling til denne etterlevelsesdokumentasjonen (Rediger
              dokumentegenskaper) (åpner i ny fane)
            </ErrorSummary.Item>
          )}

          {pvkKravError !== '' && (
            <ErrorSummary.Item
              target='_blank'
              href={etterlevelseDokumentasjonPvkTabUrl(etterlevelseDokumentasjonId)}
              className='max-w-[75ch]'
            >
              {pvkKravError} (åpner i ny fane)
            </ErrorSummary.Item>
          )}

          {behandlingensLivslopError && (
            <ErrorSummary.Item
              target='_blank'
              href={pvkDokumentasjonStepUrl(
                etterlevelseDokumentasjonId,
                pvkDokumentId,
                2,
                '#behandlingensLivslop'
              )}
              className='max-w-[75ch]'
            >
              Behandlingens livsløp må ha minimum 1 opplastet tegning, eller en skriftlig
              beskrivelse. (åpner i ny fane)
            </ErrorSummary.Item>
          )}

          {tiltakFristUtgaattError && (
            <ErrorSummary.Item
              target='_blank'
              href={pvkDokumentasjonTabFilterTiltakUrl('7', 'tiltak', 'fristPassert')}
              className='max-w-[75ch]'
            >
              {tiltakFristUtgaattError}
              (åpner i ny fane)
            </ErrorSummary.Item>
          )}

          {artOgOmfangError.stemmerPersonkategorier && (
            <ErrorSummary.Item
              target='_blank'
              href={pvkDokumentasjonStepUrl(
                etterlevelseDokumentasjonId,
                pvkDokumentId,
                3,
                '#stemmerPersonkategorier'
              )}
              className='max-w-[75ch]'
            >
              Dere må oppgi om lista over personkategorier stemmer. (åpner i ny fane)
            </ErrorSummary.Item>
          )}

          {artOgOmfangError.personkategoriAntallBeskrivelse && (
            <ErrorSummary.Item
              target='_blank'
              href={pvkDokumentasjonStepUrl(
                etterlevelseDokumentasjonId,
                pvkDokumentId,
                3,
                '#personkategoriAntallBeskrivelse'
              )}
              className='max-w-[75ch]'
            >
              Dere må beskrive hvor mange personer dere behandler personopplysninger om. (åpner i ny
              fane)
            </ErrorSummary.Item>
          )}

          {artOgOmfangError.tilgangsBeskrivelsePersonopplysningene && (
            <ErrorSummary.Item
              target='_blank'
              href={pvkDokumentasjonStepUrl(
                etterlevelseDokumentasjonId,
                pvkDokumentId,
                3,
                '#tilgangsBeskrivelsePersonopplysningene'
              )}
              className='max-w-[75ch]'
            >
              Dere må beskrive hvilke roller som skal ha tilgang til personopplysningene, og pr.
              rolle, hvor mange som skal ha tilgang til hva. (åpner i ny fane)
            </ErrorSummary.Item>
          )}

          {artOgOmfangError.lagringsBeskrivelsePersonopplysningene && (
            <ErrorSummary.Item
              target='_blank'
              href={pvkDokumentasjonStepUrl(
                etterlevelseDokumentasjonId,
                pvkDokumentId,
                3,
                '#lagringsBeskrivelsePersonopplysningene'
              )}
              className='max-w-[75ch]'
            >
              Dere må beskrive hvordan og hvor lenge personopplysningene skal lagres. (åpner i ny
              fane)
            </ErrorSummary.Item>
          )}

          {Object.entries(updateErrors)
            .filter(([, error]) => error)
            .map(([key, error]) => {
              return (
                <ErrorSummary.Item
                  target='_blank'
                  href={pvkDokumentasjonStepUrl(
                    etterlevelseDokumentasjonId,
                    pvkDokumentId,
                    5,
                    `#${key}`
                  )}
                  key={key}
                  className='max-w-[75ch]'
                >
                  {error as string} (åpner i ny fane)
                </ErrorSummary.Item>
              )
            })}
          {risikoscenarioError !== '' && generelleRisikoscenarioMedFeil.length === 0 && (
            <ErrorSummary.Item
              target='_blank'
              href={pvkDokumentasjonStepUrl(
                etterlevelseDokumentasjonId,
                pvkDokumentId,
                6,
                risikoscenarioFilterAlleUrl()
              )}
              className='max-w-[75ch]'
            >
              {risikoscenarioError} (åpner i ny fane)
            </ErrorSummary.Item>
          )}
          {generelleRisikoscenarioMedFeil.map((risiko) => (
            <ErrorSummary.Item
              target='_blank'
              href={pvkDokumentasjonStepUrl(
                etterlevelseDokumentasjonId,
                pvkDokumentId,
                6,
                `&risikoscenario=${risiko.id}`
              )}
              key={risiko.id}
              className='max-w-[75ch]'
            >
              Risikoscenarioet &quot;{risiko.navn}&quot; er ikke ferdig beskrevet. (åpner i ny fane)
            </ErrorSummary.Item>
          ))}
          {spesifikkeRisikoscenarioMedFeil.map((risiko) => {
            const kravReferanse = risiko.relevanteKravNummer[0]
            const href = kravReferanse
              ? `${risikoDokumentasjonTemaKravNummerVersjonUrl(
                  etterlevelseDokumentasjonId,
                  kravReferanse.temaCode,
                  kravReferanse.kravNummer,
                  kravReferanse.kravVersjon
                )}?risikoscenario=${risiko.id}`
              : etterlevelseDokumentasjonIdUrl(etterlevelseDokumentasjonId)

            return (
              <ErrorSummary.Item
                target='_blank'
                href={href}
                key={risiko.id}
                className='max-w-[75ch]'
              >
                Risikoscenarioet &quot;{risiko.navn}&quot; (knyttet til krav{' '}
                {kravReferanse?.kravNummer}) er ikke ferdig beskrevet. (åpner i ny fane)
              </ErrorSummary.Item>
            )
          })}
          {tiltakError !== '' && (
            <ErrorSummary.Item
              target='_blank'
              href={pvkDokumentasjonStepUrl(
                etterlevelseDokumentasjonId,
                pvkDokumentId,
                7,
                tabTiltakQuery
              )}
              className='max-w-[75ch]'
            >
              {tiltakError} (åpner i ny fane)
            </ErrorSummary.Item>
          )}
          {tiltakAnsvarligError !== '' && (
            <ErrorSummary.Item
              target='_blank'
              href={pvkDokumentasjonTabFilterTiltakUrl('7', 'tiltak', 'utenAnsvarlig')}
              className='max-w-[75ch]'
            >
              {tiltakAnsvarligError} (åpner i ny fane)
            </ErrorSummary.Item>
          )}
          {tiltakFristError !== '' && (
            <ErrorSummary.Item
              target='_blank'
              href={pvkDokumentasjonTabFilterTiltakUrl('7', 'tiltak', 'utenFrist')}
              className='max-w-[75ch]'
            >
              {tiltakFristError} (åpner i ny fane)
            </ErrorSummary.Item>
          )}
          {savnerVurderingError !== '' && (
            <ErrorSummary.Item
              target='_blank'
              href={pvkDokumentasjonTabFilterTiltakUrl('7', 'risikoscenarioer', 'ikke-vurdert')}
              className='max-w-[75ch]'
            >
              {savnerVurderingError} (åpner i ny fane)
            </ErrorSummary.Item>
          )}

          {risikoeiereDataError && (
            <ErrorSummary.Item
              target='_blank'
              href={`${etterlevelsesDokumentasjonEditUrl(etterlevelseDokumentasjonId)}#risikoeiereData`}
              className='max-w-[75ch]'
            >
              Legg til risikoeier (Rediger dokumentegenskaper) (åpner i ny fane)
            </ErrorSummary.Item>
          )}

          {avdelingError && (
            <ErrorSummary.Item
              target='_blank'
              href={`${etterlevelsesDokumentasjonEditUrl(etterlevelseDokumentasjonId)}#avdeling`}
              className='max-w-[75ch]'
            >
              Legg til avdeling (Rediger dokumentegenskaper) (åpner i ny fane)
            </ErrorSummary.Item>
          )}

          {medlemError && (
            <ErrorSummary.Item
              target='_blank'
              href={`${etterlevelsesDokumentasjonEditUrl(etterlevelseDokumentasjonId)}#teamsData`}
              className='max-w-[75ch]'
            >
              Legg til team eller personer (Rediger dokumentegenskaper) (åpner i ny fane)
            </ErrorSummary.Item>
          )}
        </ErrorSummary>
      )}
    </div>
  )
}

export default SendInnErrorSummary
