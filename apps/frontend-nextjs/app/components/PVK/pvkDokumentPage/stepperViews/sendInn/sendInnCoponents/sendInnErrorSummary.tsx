import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { etterlevelsesDokumentasjonEditUrl } from '@/routes/etterlevelseDokumentasjon/etterlevelseDokumentasjonRoutes'
import { etterlevelseDokumentasjonPvkTabUrl } from '@/routes/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensvurderingRoutes'
import { ErrorSummary } from '@navikt/ds-react'
import { FormikErrors } from 'formik'
import _ from 'lodash'
import { FunctionComponent, RefObject } from 'react'

type TProps = {
  errors: FormikErrors<IPvkDokument>
  etterlevelseDokumentasjonId: string
  risikoeiereDataError: boolean
  avdelingError: boolean
  medlemError: boolean
  behandlingensLivslopError: boolean
  manglerBehandlingError: boolean
  risikoscenarioError: string
  tiltakError: string
  tiltakAnsvarligError: string
  tiltakFristError: string[]
  pvkKravError: string
  savnerVurderingError: string
  errorSummaryRef: RefObject<HTMLDivElement | null>
}

export const SendInnErrorSummary: FunctionComponent<TProps> = ({
  errors,
  etterlevelseDokumentasjonId,
  risikoeiereDataError,
  avdelingError,
  medlemError,
  behandlingensLivslopError,
  risikoscenarioError,
  tiltakError,
  tiltakAnsvarligError,
  tiltakFristError,
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
        risikoscenarioError !== '' ||
        tiltakError !== '' ||
        tiltakAnsvarligError !== '' ||
        tiltakFristError.length !== 0 ||
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
            <ErrorSummary.Item href='#behandlingensLivslop' className='max-w-[75ch]'>
              Behandlingens livsløp må ha minimum 1 opplastet tegning, eller en skriftlig
              beskrivelse.
            </ErrorSummary.Item>
          )}

          {Object.entries(updateErrors)
            .filter(([, error]) => error)
            .map(([key, error]) => {
              return (
                <ErrorSummary.Item href={`#${key}`} key={key} className='max-w-[75ch]'>
                  {error as string}
                </ErrorSummary.Item>
              )
            })}
          {risikoscenarioError !== '' && (
            <ErrorSummary.Item href='#risikoscenarioer' className='max-w-[75ch]'>
              {risikoscenarioError}
            </ErrorSummary.Item>
          )}
          {tiltakError !== '' && (
            <ErrorSummary.Item href='#tiltak' className='max-w-[75ch]'>
              {tiltakError}
            </ErrorSummary.Item>
          )}
          {tiltakAnsvarligError !== '' && (
            <ErrorSummary.Item href='#tiltak' className='max-w-[75ch]'>
              {tiltakAnsvarligError}
            </ErrorSummary.Item>
          )}
          {tiltakFristError.length !== 0 &&
            tiltakFristError.map((error, index) => (
              <ErrorSummary.Item
                href='#tiltak'
                className='max-w-[75ch]'
                key={`${index}_tiltakErrorSummary`}
              >
                {error}
              </ErrorSummary.Item>
            ))}
          {savnerVurderingError !== '' && (
            <ErrorSummary.Item href='#effektEtterTiltak' className='max-w-[75ch]'>
              {savnerVurderingError}
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
