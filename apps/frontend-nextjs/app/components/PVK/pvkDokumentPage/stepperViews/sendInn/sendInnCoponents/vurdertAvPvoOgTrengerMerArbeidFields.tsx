import CopyAndExportButtons from '@/components/PVK/pvkDokumentPage/stepperViews/sendInn/sendInnCoponents/copyAndExportButtons'
import LagreOgFortsettSenereButton from '@/components/PVK/pvkDokumentPage/stepperViews/sendInn/sendInnCoponents/lagreOgFortsettSenereButton'
import { BeskjedFraPvoReadOnly } from '@/components/PVK/pvkDokumentPage/stepperViews/sendInn/sendInnCoponents/readOnly/beskjedFraPvoReadOnly'
import { CenteredLoader } from '@/components/common/centeredLoader/centeredLoader'
import { TextAreaField } from '@/components/common/textAreaField/textAreaField'
import {
  EPvkDokumentStatus,
  IPvkDokument,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { ICode } from '@/constants/kodeverk/kodeverkConstants'
import { IPvoTilbakemelding } from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { pvkDokumentStatusToText } from '@/util/etterlevelseDokumentasjon/pvkDokument/pvkDokumentUtils'
import { Alert, Button, Heading } from '@navikt/ds-react'
import { FormikErrors } from 'formik'
import { FunctionComponent, ReactNode } from 'react'

type TProps = {
  pvkDokument: IPvkDokument
  pvoTilbakemelding: IPvoTilbakemelding
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean
  ) => Promise<void | FormikErrors<IPvkDokument>>
  submitForm: () => Promise<void>
  initialStatus: EPvkDokumentStatus
  isLoading: boolean
  errorSummaryComponent: ReactNode
  pvoVurderingList: ICode[]
}

export const VurdertAvPvoOgTrengerMerArbeidFields: FunctionComponent<TProps> = ({
  pvkDokument,
  pvoTilbakemelding,
  setFieldValue,
  submitForm,
  initialStatus,
  isLoading,
  errorSummaryComponent,
  pvoVurderingList,
}) => {
  return (
    <div>
      <div className='mt-5 mb-3'>
        <TextAreaField
          height='150px'
          noPlaceholder
          label='Er det noe annet dere ønsker å formidle til Personvernombudet? (valgfritt)'
          name='merknadTilPvoEllerRisikoeier'
          markdown
        />
      </div>
      <BeskjedFraPvoReadOnly
        pvoTilbakemelding={pvoTilbakemelding}
        pvoVurderingList={pvoVurderingList}
      />

      <div className='pt-9 mb-3 max-w-[75ch]'>
        <Heading size='medium' level='2' className='mb-5'>
          Arbeid med PVK etter tilbakemelding fra PVO
        </Heading>

        <TextAreaField
          rows={3}
          noPlaceholder
          label='Oppsummér for risikoeieren eventuelle endringer gjort som følge av PVOs tilbakemelding'
          name='merknadTilRisikoeier'
        />
      </div>

      {errorSummaryComponent}

      {isLoading && (
        <div className='flex justify-center items-center w-full'>
          <CenteredLoader />
        </div>
      )}

      <div className='max-w-[75ch]'>
        <Alert variant='info' className='my-5 '>
          Status: {pvkDokumentStatusToText(pvkDokument.status)}
        </Alert>
      </div>

      <div className='mt-5 flex gap-2 items-center'>
        <LagreOgFortsettSenereButton
          setFieldValue={setFieldValue}
          submitForm={submitForm}
          initialStatus={initialStatus}
        />

        <Button
          type='button'
          onClick={async () => {
            await setFieldValue('status', EPvkDokumentStatus.TRENGER_GODKJENNING)
            await submitForm()
          }}
        >
          Lagre og send til godkjenning av risikoeier
        </Button>

        <Button
          type='button'
          variant='tertiary'
          onClick={async () => {
            await setFieldValue('status', EPvkDokumentStatus.SENDT_TIL_PVO_FOR_REVURDERING)
            await submitForm()
          }}
        >
          Lagre og send tilbake til PVO
        </Button>
      </div>

      <CopyAndExportButtons etterlevelseDokumentasjonId={pvkDokument.etterlevelseDokumentId} />
    </div>
  )
}

export default VurdertAvPvoOgTrengerMerArbeidFields
