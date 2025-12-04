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
import { IVurdering } from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { UserContext } from '@/provider/user/userProvider'
import { pvkDokumentStatusToText } from '@/util/etterlevelseDokumentasjon/pvkDokument/pvkDokumentUtils'
import { Alert, Button, Heading } from '@navikt/ds-react'
import { Field, FieldProps, FormikErrors } from 'formik'
import _ from 'lodash'
import { FunctionComponent, ReactNode, useContext } from 'react'

type TProps = {
  pvkDokument: IPvkDokument
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  relevantVurdering: IVurdering
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
  errors: FormikErrors<IPvkDokument>
  savedAlert: ReactNode
}
export const TrengerRisikoeierGodkjenningFields: FunctionComponent<TProps> = ({
  pvkDokument,
  etterlevelseDokumentasjon,
  relevantVurdering,
  isLoading,
  setFieldValue,
  submitForm,
  initialStatus,
  errorSummaryComponent,
  pvoVurderingList,
  errors,
  savedAlert,
}) => {
  const user = useContext(UserContext)
  const isRisikoeierCheck: boolean = etterlevelseDokumentasjon.risikoeiere.includes(user.getIdent())

  return (
    <Field>
      {(fieldProps: FieldProps) => (
        <div className='w-full max-w-[75ch]'>
          <BeskjedTilPvoReadOnly
            meldingTilPvo={
              pvkDokument.meldingerTilPvo.filter(
                (melding) => melding.innsendingId === pvkDokument.antallInnsendingTilPvo
              )[0]
            }
          />

          <BeskjedFraPvoReadOnly
            relevantVurdering={relevantVurdering}
            pvoVurderingList={pvoVurderingList}
          />

          <Heading size='medium' level='2' className='my-5'>
            Send oppdatert PVK
          </Heading>
          <BeskjedTilRisikoeierReadOnly merknadTilRisikoeier={pvkDokument.merknadTilRisikoeier} />

          {(isRisikoeierCheck || user.isAdmin()) && (
            <div>
              <Heading size='medium' level='2' className='my-5'>
                Godkjenn og arkiver PVK
              </Heading>
              <div className='mt-5 mb-3'>
                <TextAreaField
                  height='150px'
                  noPlaceholder
                  label='Risikoeiers begrunnelse for godkjenning av restrisiko'
                  name='merknadFraRisikoeier'
                  markdown
                />
              </div>
            </div>
          )}

          {errorSummaryComponent}

          {isLoading && <CenteredLoader />}

          <div>
            <Alert variant='info' className='my-5 '>
              Status: {pvkDokumentStatusToText(pvkDokument.status)}
            </Alert>
          </div>

          <div>{!fieldProps.form.dirty && savedAlert}</div>

          {!isRisikoeierCheck && (
            <Alert variant='info' inline className='my-5'>
              Hvis dere har oppdaget betydelige feil eller mangel etter innsending, er det mulig å
              trekke PVK-en deres tilbake. Dette vil kun være mulig enn så lenge PVO ikke har
              påbegynt vurderingen sin. Obs: ved å trekke tilbake PVK, vil dere miste nåværende
              plass i behandlingskøen.
            </Alert>
          )}

          <div className='mt-5 flex gap-2 items-center'>
            {(isRisikoeierCheck || user.isAdmin()) && (
              <LagreOgFortsettSenereButton
                setFieldValue={setFieldValue}
                submitForm={submitForm}
                initialStatus={initialStatus}
                resetForm={() => fieldProps.form.resetForm({ values: fieldProps.form.values })}
              />
            )}

            {(!isRisikoeierCheck || user.isAdmin()) && (
              <Button
                type='button'
                onClick={async () => {
                  await setFieldValue('status', EPvkDokumentStatus.VURDERT_AV_PVO)
                  await submitForm()
                }}
              >
                Angre sending til risikoeier
              </Button>
            )}

            {(isRisikoeierCheck || user.isAdmin()) && (
              <Button
                type='button'
                onClick={async () => {
                  await setFieldValue('status', EPvkDokumentStatus.GODKJENT_AV_RISIKOEIER)
                  await setFieldValue(
                    'godkjentAvRisikoeierDato',
                    new Date().toLocaleString('sv').replace(' ', 'T')
                  )
                  await setFieldValue(
                    'godkjentAvRisikoeier',
                    user.getIdent() + ' - ' + user.getName()
                  )
                  await submitForm().then(async () => {
                    if (_.isEmpty(errors)) {
                      await arkiver(etterlevelseDokumentasjon.id, true, false, true)
                    }
                  })
                }}
              >
                Aksepter restrisiko og arkiver i Public 360
              </Button>
            )}
          </div>

          <CopyAndExportButtons etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id} />
        </div>
      )}
    </Field>
  )
}
export default TrengerRisikoeierGodkjenningFields
