import { Button, Loader, TextField } from '@navikt/ds-react'
import { FormikErrors } from 'formik'
import { FunctionComponent, ReactNode, useState } from 'react'
import { arkiver } from '../../../api/P360Api'
import {
  EPvkDokumentStatus,
  IPvkDokument,
  IPvoTilbakemelding,
  TEtterlevelseDokumentasjonQL,
} from '../../../constants'
import { ICode } from '../../../services/Codelist'
import { user } from '../../../services/User'
import { TextAreaField } from '../../common/Inputs'
import ExportPvkModal from '../../export/ExportPvkModal'
import CopyAndStatusView from './CopyAndStatusView'
import LagreOgFortsettSenereButton from './LagreOgFortsettSenereButton'
import { BeskjedFraPvoReadOnly } from './readOnly/BeskjedFraPvoReadOnly'
import BeskjedTilPvoReadOnly from './readOnly/BeskjedTilPvoReadOnly'
import BeskjedTilRisikoeierReadOnly from './readOnly/BeskjedTilRisikoeierReadOnly'

type TProps = {
  pvkDokument: IPvkDokument
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  pvoTilbakemelding: IPvoTilbakemelding
  isLoading: boolean
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean
  ) => Promise<void | FormikErrors<IPvkDokument>>
  submitForm: () => Promise<void>
  initialStatus: EPvkDokumentStatus
  errorSummaryComponent: ReactNode
  pvoVurderingList: ICode[]
}
export const TrengerRisikoeierGodkjenningFields: FunctionComponent<TProps> = ({
  pvkDokument,
  etterlevelseDokumentasjon,
  pvoTilbakemelding,
  isLoading,
  setFieldValue,
  submitForm,
  initialStatus,
  errorSummaryComponent,
  pvoVurderingList,
}) => {
  const isRisikoeierCheck: boolean =
    etterlevelseDokumentasjon.risikoeiere.includes(user.getIdent()) || user.isAdmin()

  return (
    <div>
      <BeskjedTilPvoReadOnly pvkDokument={pvkDokument} />
      <BeskjedFraPvoReadOnly
        pvoTilbakemelding={pvoTilbakemelding}
        pvoVurderingList={pvoVurderingList}
      />
      <BeskjedTilRisikoeierReadOnly merknadTilRisikoeier={pvkDokument.merknadTilRisikoeier} />

      <div className='mt-5 mb-3 max-w-[75ch]'>
        <TextAreaField
          height='150px'
          noPlaceholder
          label='Kommentar til etterlever? (valgfritt)'
          name='merknadFraRisikoeier'
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
            await setFieldValue('status', EPvkDokumentStatus.VURDERT_AV_PVO)
            await submitForm()
          }}
        >
          Angre sending til risikoeier
        </Button>

        {isRisikoeierCheck && pvkDokument.status === EPvkDokumentStatus.TRENGER_GODKJENNING && (
          <Button
            type='button'
            onClick={async () => {
              await setFieldValue('status', EPvkDokumentStatus.GODKJENT_AV_RISIKOEIER)
              await setFieldValue('godkjentAvRisikoeierDato', new Date().toISOString())
              await setFieldValue('godkjentAvRisikoeier', user.getIdent() + ' - ' + user.getName())
              await submitForm().then(async () => {
                await arkiver(etterlevelseDokumentasjon.id, true, false, true)
              })
            }}
          >
            Akseptér restrisiko og arkivér i Public 360
          </Button>
        )}
      </div>
      <div className='w-full flex justify-end items-center'>
        <ExportPvkModal etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id} />
      </div>
    </div>
  )
}
export default TrengerRisikoeierGodkjenningFields
