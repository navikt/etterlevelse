import { Alert, Button, Heading, List, Loader } from '@navikt/ds-react'
import { FormikErrors } from 'formik'
import { FunctionComponent, ReactNode } from 'react'
import { EPvkDokumentStatus, IPvkDokument, IPvoTilbakemelding } from '../../../constants'
import { ICode } from '../../../services/Codelist'
import { TextAreaField } from '../../common/Inputs'
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
        <Heading level='2' size='small' className='mb-5'>
          Nå er det din tur, etterlever
        </Heading>

        <div className='mb-3 mt-5'>
          <Alert variant='info'>
            <Heading size='xsmall' level='3'>
              Dette gjør dere nå
            </Heading>
            <List as='ul'>
              <List.Item>Gjør eventuelle endringer basert på PVOs tilbakemelding</List.Item>
              <List.Item>
                Oppsummér for risikoeieren hvordan dere har tatt stilling til PVOs tilbakemelding,
                og hvilke endringer som er gjort.
              </List.Item>
              <List.Item>
                Risikoeieren skal så vurdere om restrisiko kan aksepteres, og godkjenner og
                arkiverer PVK.
              </List.Item>
            </List>
          </Alert>
        </div>

        <TextAreaField rows={3} noPlaceholder label='Oppsummér' name='merknadTilRisikoeier' />
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
    </div>
  )
}
export default VurdertAvPvoFields
