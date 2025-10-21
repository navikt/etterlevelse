'use client'

import { arkiver } from '@/api/p360/p360Api'
import CopyAndExportButtons from '@/components/PVK/pvkDokumentPage/stepperViews/sendInn/sendInnCoponents/copyAndExportButtons'
import LagreOgFortsettSenereButton from '@/components/PVK/pvkDokumentPage/stepperViews/sendInn/sendInnCoponents/lagreOgFortsettSenereButton'
import { BeskjedFraPvoReadOnly } from '@/components/PVK/pvkDokumentPage/stepperViews/sendInn/sendInnCoponents/readOnly/beskjedFraPvoReadOnly'
import BeskjedTilPvoReadOnly from '@/components/PVK/pvkDokumentPage/stepperViews/sendInn/sendInnCoponents/readOnly/beskjedTilPvoReadOnly'
import BeskjedTilRisikoeierReadOnly from '@/components/PVK/pvkDokumentPage/stepperViews/sendInn/sendInnCoponents/readOnly/beskjedTilRisikoeierReadOnly'
import { CenteredLoader } from '@/components/common/centeredLoader/centeredLoader'
import { TextAreaField } from '@/components/common/textAreaField/textAreaField'
import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import {
  EPvkDokumentStatus,
  IPvkDokument,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { ICode } from '@/constants/kodeverk/kodeverkConstants'
import { IPvoTilbakemelding } from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { UserContext } from '@/provider/user/userProvider'
import { pvkDokumentStatusToText } from '@/util/etterlevelseDokumentasjon/pvkDokument/pvkDokumentUtils'
import { Alert, Button } from '@navikt/ds-react'
import { FormikErrors } from 'formik'
import { FunctionComponent, ReactNode, useContext } from 'react'

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
  const user = useContext(UserContext)
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

      {errorSummaryComponent}

      {isLoading && <CenteredLoader />}

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
              await setFieldValue(
                'godkjentAvRisikoeierDato',
                new Date().toLocaleString('sv').replace(' ', 'T')
              )
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

      <CopyAndExportButtons etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id} />
    </div>
  )
}
export default TrengerRisikoeierGodkjenningFields
