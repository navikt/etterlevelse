import { BodyLong, Button, Label, LocalAlert } from '@navikt/ds-react'
import { Dispatch, FunctionComponent, SetStateAction } from 'react'
import DataTextWrapper from '@/components/common/DataTextWrapper/DataTextWrapper'
import { Markdown } from '@/components/common/markdown/markdown'
import {
  EEtterlevelseDokumentasjonStatus,
  IEtterlevelseDokumentasjon,
  TEtterlevelseDokumentasjonQL,
} from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'

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
        <LocalAlert status='success' role='region' aria-label='Godkjenningsstatus'>
          <LocalAlert.Header>
            <LocalAlert.Title>Sendt til godkjenning</LocalAlert.Title>
            <LocalAlert.CloseButton onClick={() => setSaveSuccessful(false)} />
          </LocalAlert.Header>
        </LocalAlert>
      </div>
    )}

    {hasAccess &&
      etterlevelseDokumentasjon.status ===
        EEtterlevelseDokumentasjonStatus.SENDT_TIL_GODKJENNING_TIL_RISIKOEIER && (
        <div>
          {submitAlert !== '' && (
            <LocalAlert status='error' className='my-5'>
              <LocalAlert.Header>
                <LocalAlert.Title>{submitAlert}</LocalAlert.Title>
                <LocalAlert.CloseButton onClick={() => setSubmitAlert('')} />
              </LocalAlert.Header>
            </LocalAlert>
          )}
          <Button
            className='mt-5'
            variant='secondary'
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
