import { Button, Heading, Loader } from '@navikt/ds-react'
import { FormikErrors } from 'formik'
import { FunctionComponent, ReactNode } from 'react'
import { EPvkDokumentStatus, IPvkDokument, IPvoTilbakemelding } from '../../../constants'
import { ICode } from '../../../services/Codelist'
import { TextAreaField } from '../../common/Inputs'
import ExportPvkModal from '../../export/ExportPvkModal'
import CopyAndStatusView from './CopyAndStatusView'
import LagreOgFortsettSenereButton from './LagreOgFortsettSenereButton'
import { BeskjedFraPvoReadOnly } from './readOnly/BeskjedFraPvoReadOnly'
import BeskjedTilPvoReadOnly from './readOnly/BeskjedTilPvoReadOnly'

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

export const VurdertAvPvoFields: FunctionComponent<TProps> = ({
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
      <BeskjedTilPvoReadOnly pvkDokument={pvkDokument} />
      <BeskjedFraPvoReadOnly
        pvoTilbakemelding={pvoTilbakemelding}
        pvoVurderingList={pvoVurderingList}
      />

      <div className='pt-9 mb-3 max-w-[75ch]'>
        <Heading size='medium' level='2' className='mb-5'>
          Arbeid med PVK etter tilbakemelding fra PVO
        </Heading>

        <TextAreaField
          height='150px'
          noPlaceholder
          label='Oppsummér for risikoeieren eventuelle endringer gjort som følge av PVOs tilbakemelding'
          name='merknadTilRisikoeier'
          markdown
        />
      </div>

      <CopyAndStatusView pvkDokumentStatus={pvkDokument.status} />

      {errorSummaryComponent}

      {isLoading && (
        <div className='flex justify-center items-center w-full'>
          <Loader size='2xlarge' title='lagrer endringer' />
        </div>
      )}

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
      </div>
      <div className='w-full flex justify-end items-center'>
        <ExportPvkModal etterlevelseDokumentasjonId={pvkDokument.etterlevelseDokumentId} />
      </div>
    </div>
  )
}
export default VurdertAvPvoFields
