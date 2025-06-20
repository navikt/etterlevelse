import { FilesIcon } from '@navikt/aksel-icons'
import { Alert, BodyLong, Button, CopyButton, Heading, Label } from '@navikt/ds-react'
import { FormikErrors } from 'formik'
import { Dispatch, FunctionComponent, SetStateAction } from 'react'
import { EPvoTilbakemeldingStatus, IPvkDokument, IPvoTilbakemelding } from '../../constants'
import { Markdown } from '../common/Markdown'
import AlertPvoModal from './common/AlertPvoModal'
import DataTextWrapper from './common/DataTextWrapper'
import PvoFormButtons from './edit/PvoFormButtons'

type TProps = {
  pvkDokument: IPvkDokument
  pvoTilbakemelding: IPvoTilbakemelding
  activeStep: number
  dirty: boolean
  submitForm: () => Promise<void>
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean
  ) => Promise<void | FormikErrors<IPvoTilbakemelding>>
  setSubmittedStatus: (value: SetStateAction<EPvoTilbakemeldingStatus>) => void
  setActiveStep: (step: number) => void
  setSelectedStep: (step: number) => void
  isAlertModalOpen: boolean
  setIsAlertModalOpen: Dispatch<SetStateAction<boolean>>
}

export const SendInnPvoViewFerdig: FunctionComponent<TProps> = ({
  pvkDokument,
  pvoTilbakemelding,
  activeStep,
  dirty,
  submitForm,
  setFieldValue,
  setSubmittedStatus,
  setActiveStep,
  setSelectedStep,
  isAlertModalOpen,
  setIsAlertModalOpen,
}) => (
  <div className='pt-6 flex justify-center'>
    <div>
      <div className='my-5 max-w-[75ch]'>
        <Label>Beskjed fra etterlever</Label>
        <DataTextWrapper customEmptyMessage='Ingen beskjed'>
          {pvkDokument.merknadTilPvoEllerRisikoeier}
        </DataTextWrapper>
      </div>

      <Heading level='1' size='medium' className='mb-5'>
        Tilbakemelding til etterlever
      </Heading>

      <div className='mt-5 mb-3 max-w-[75ch]'>
        <div className='mb-3'>
          <Label>Anbefales det at arbeidet går videre som planlagt?</Label>
          <DataTextWrapper>
            {pvoTilbakemelding.arbeidGarVidere === null
              ? null
              : pvoTilbakemelding.arbeidGarVidere === true
                ? 'Ja'
                : 'Nei'}
          </DataTextWrapper>
        </div>

        <div className='mb-3'>
          <Label>Er det behov for forhåndskonsultasjon med Datatilsynet?</Label>
          <DataTextWrapper>
            {pvoTilbakemelding.behovForForhandskonsultasjon === null
              ? null
              : pvoTilbakemelding.behovForForhandskonsultasjon === true
                ? 'Ja'
                : 'Nei'}
          </DataTextWrapper>
        </div>

        <Label>Beskjed til etterlever</Label>
        {pvoTilbakemelding.merknadTilEtterleverEllerRisikoeier &&
          pvoTilbakemelding.merknadTilEtterleverEllerRisikoeier.length !== 0 && (
            <Markdown source={pvoTilbakemelding.merknadTilEtterleverEllerRisikoeier} />
          )}
        <BodyLong>
          {(!pvoTilbakemelding.merknadTilEtterleverEllerRisikoeier ||
            pvoTilbakemelding.merknadTilEtterleverEllerRisikoeier.length === 0) &&
            'Ingen tilbakemelding til etterlever'}
        </BodyLong>
      </div>

      <CopyButton
        variant='action'
        copyText={window.location.href}
        text='Kopiér lenken til denne siden'
        activeText='Lenken er kopiert'
        icon={<FilesIcon aria-hidden />}
      />

      <Alert variant='success' className='my-5'>
        Tilbakemelding er sendt
      </Alert>

      <PvoFormButtons
        activeStep={activeStep}
        setActiveStep={setActiveStep}
        setSelectedStep={setSelectedStep}
        submitForm={submitForm}
        customButtons={
          <div className='mt-5 flex gap-2 items-center'>
            {!dirty && <div className='min-w-[223px]'></div>}
            {dirty && (
              <Button
                type='button'
                variant='secondary'
                onClick={async () => {
                  await setFieldValue('status', EPvoTilbakemeldingStatus.UNDERARBEID)
                  setSubmittedStatus(EPvoTilbakemeldingStatus.UNDERARBEID)
                  await submitForm()
                }}
              >
                Lagre og fortsett senere
              </Button>
            )}

            <Button
              type='button'
              variant='secondary'
              onClick={async () => {
                await setFieldValue('status', EPvoTilbakemeldingStatus.UNDERARBEID)
                setSubmittedStatus(EPvoTilbakemeldingStatus.UNDERARBEID)
                await submitForm()
              }}
            >
              Angre tilbakemelding
            </Button>
          </div>
        }
      />
    </div>

    <AlertPvoModal
      isOpen={isAlertModalOpen}
      onClose={() => setIsAlertModalOpen(false)}
      pvkDokumentId={pvkDokument.id}
    />
  </div>
)

export default SendInnPvoViewFerdig
