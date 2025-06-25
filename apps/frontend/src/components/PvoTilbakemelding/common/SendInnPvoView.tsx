import { FilesIcon } from '@navikt/aksel-icons'
import { Button, CopyButton, Heading, Label } from '@navikt/ds-react'
import { FormikErrors } from 'formik'
import { Dispatch, FunctionComponent, SetStateAction } from 'react'
import { EPvoTilbakemeldingStatus, IPvkDokument, IPvoTilbakemelding } from '../../../constants'
import AlertPvoModal from './AlertPvoModal'
import DataTextWrapper from './DataTextWrapper'

type TBeskjedTilbakemeldingEtterleverProps = { pvkDokument: IPvkDokument }

export const BeskjedTilbakemeldingEtterlever: FunctionComponent<
  TBeskjedTilbakemeldingEtterleverProps
> = ({ pvkDokument }) => (
  <>
    <div className='my-5 max-w-[75ch]'>
      <Label>Beskjed fra etterlever</Label>
      <DataTextWrapper customEmptyMessage='Ingen beskjed'>
        {pvkDokument.merknadTilPvoEllerRisikoeier}
      </DataTextWrapper>
    </div>

    <Heading level='1' size='medium' className='mb-5'>
      Tilbakemelding til etterlever
    </Heading>
  </>
)

export const CopyButtonCommon = () => (
  <CopyButton
    variant='action'
    copyText={window.location.href}
    text='Kopiér lenken til denne siden'
    activeText='Lenken er kopiert'
    icon={<FilesIcon aria-hidden />}
  />
)

type TLagreFortsettSenereButtonProps = {
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean
  ) => Promise<void | FormikErrors<IPvoTilbakemelding>>
  setSubmittedStatus: (value: SetStateAction<EPvoTilbakemeldingStatus>) => void
  submitForm: () => Promise<void>
}

export const LagreFortsettSenereButton: FunctionComponent<TLagreFortsettSenereButtonProps> = ({
  setFieldValue,
  setSubmittedStatus,
  submitForm,
}) => (
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
)

type TAlertPvoModalCommonProps = {
  pvkDokument: IPvkDokument
  isAlertModalOpen: boolean
  setIsAlertModalOpen: Dispatch<SetStateAction<boolean>>
}

export const AlertPvoModalCommon: FunctionComponent<TAlertPvoModalCommonProps> = ({
  isAlertModalOpen,
  setIsAlertModalOpen,
  pvkDokument,
}) => (
  <AlertPvoModal
    isOpen={isAlertModalOpen}
    onClose={() => setIsAlertModalOpen(false)}
    pvkDokumentId={pvkDokument.id}
  />
)
