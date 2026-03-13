import DataTextWrapper from '@/components/common/DataTextWrapper/DataTextWrapper'
import { Markdown } from '@/components/common/markdown/markdown'
import {
  EEtterlevelseDokumentasjonStatus,
  IEtterlevelseDokumentasjon,
  TEtterlevelseDokumentasjonQL,
} from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { Alert, BodyLong, Button, Label } from '@navikt/ds-react'
import { Dispatch, FunctionComponent, SetStateAction } from 'react'

type TProp = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  saveSuccessful: boolean
  setSaveSuccessful: Dispatch<SetStateAction<boolean>>
  submitAlert: string
  setSubmitAlert: Dispatch<SetStateAction<string>>
  submit: (submitValues: IEtterlevelseDokumentasjon, skipSaveAlert?: boolean) => Promise<void>
  hasAccess: boolean
  setTrekkInnsendingSuccessful: Dispatch<SetStateAction<boolean>>
}

export const SendTilRisikoeierGodkjenningReadOnly: FunctionComponent<TProp> = ({
  etterlevelseDokumentasjon,
  saveSuccessful,
  setSaveSuccessful,
  submitAlert,
  setSubmitAlert,
  submit,
  hasAccess,
  setTrekkInnsendingSuccessful,
}) => (
  <div className='mt-7 mb-5 max-w-[75ch]'>
    <Label>Oppsummer for risikoeier hvorfor det er aktuelt med godkjenning</Label>
    <DataTextWrapper>
      {etterlevelseDokumentasjon &&
        !['', null, undefined].includes(
          etterlevelseDokumentasjon.meldingEtterlevelerTilRisikoeier
        ) && <Markdown source={etterlevelseDokumentasjon.meldingEtterlevelerTilRisikoeier} />}

      {!etterlevelseDokumentasjon ||
        (etterlevelseDokumentasjon &&
          ['', null, undefined].includes(
            etterlevelseDokumentasjon.meldingEtterlevelerTilRisikoeier
          ) && <BodyLong>Det er ikke lagt til en oppsummering.</BodyLong>)}
    </DataTextWrapper>

    {saveSuccessful && (
      <div className='my-5 max-w-[75ch]'>
        <Alert size='small' variant='success' closeButton onClose={() => setSaveSuccessful(false)}>
          Sendt til godkjenning
        </Alert>
      </div>
    )}

    {hasAccess &&
      etterlevelseDokumentasjon.status ===
        EEtterlevelseDokumentasjonStatus.SENDT_TIL_GODKJENNING_TIL_RISIKOEIER && (
        <div>
          {submitAlert !== '' && (
            <Alert
              variant='error'
              className='my-5'
              closeButton={true}
              onClose={() => setSubmitAlert('')}
            >
              {submitAlert}
            </Alert>
          )}
          <Button
            className='mt-5'
            variant='primary'
            type='button'
            onClick={async () => {
              await submit(
                {
                  ...etterlevelseDokumentasjon,
                  status: EEtterlevelseDokumentasjonStatus.UNDER_ARBEID,
                },
                true
              )
              setSaveSuccessful(false)
              setTrekkInnsendingSuccessful(true)
            }}
          >
            Trekk innsending
          </Button>
        </div>
      )}
  </div>
)
