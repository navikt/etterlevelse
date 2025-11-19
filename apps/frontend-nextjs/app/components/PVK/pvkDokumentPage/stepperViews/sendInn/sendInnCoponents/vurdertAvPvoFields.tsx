import { mapMeldingTilPvoToFormValue } from '@/api/pvkDokument/pvkDokumentApi'
import CopyAndExportButtons from '@/components/PVK/pvkDokumentPage/stepperViews/sendInn/sendInnCoponents/copyAndExportButtons'
import LagreOgFortsettSenereButton from '@/components/PVK/pvkDokumentPage/stepperViews/sendInn/sendInnCoponents/lagreOgFortsettSenereButton'
import { BeskjedFraPvoReadOnly } from '@/components/PVK/pvkDokumentPage/stepperViews/sendInn/sendInnCoponents/readOnly/beskjedFraPvoReadOnly'
import BeskjedTilPvoReadOnly from '@/components/PVK/pvkDokumentPage/stepperViews/sendInn/sendInnCoponents/readOnly/beskjedTilPvoReadOnly'
import { TextAreaField } from '@/components/common/textAreaField/textAreaField'
import {
  EPvkDokumentStatus,
  IPvkDokument,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { ICode } from '@/constants/kodeverk/kodeverkConstants'
import { IVurdering } from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { pvkDokumentStatusToText } from '@/util/etterlevelseDokumentasjon/pvkDokument/pvkDokumentUtils'
import { Alert, Button, Heading, Loader } from '@navikt/ds-react'
import { FormikErrors } from 'formik'
import { FunctionComponent, ReactNode, useMemo } from 'react'

type TProps = {
  pvkDokument: IPvkDokument
  relevantVurdering: IVurdering
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
  relevantVurdering,
  setFieldValue,
  submitForm,
  initialStatus,
  isLoading,
  errorSummaryComponent,
  pvoVurderingList,
}) => {
  const relevantMeldingTilPvo = pvkDokument.meldingerTilPvo.filter(
    (melding) => melding.innsendingId === pvkDokument.antallInnsendingTilPvo + 1
  )

  const relevantIndex = useMemo(() => {
    if (relevantMeldingTilPvo.length === 0) {
      setFieldValue('meldingerTilPvo', [
        ...pvkDokument.meldingerTilPvo,
        mapMeldingTilPvoToFormValue({
          innsendingId: pvkDokument.antallInnsendingTilPvo + 1,
        }),
      ])
      return pvkDokument.meldingerTilPvo.length
    } else {
      return pvkDokument.meldingerTilPvo.findIndex(
        (melding) => melding.innsendingId === pvkDokument.antallInnsendingTilPvo + 1
      )
    }
  }, [])

  console.debug(relevantIndex)

  return (
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

      <div className='pt-9 mb-3'>
        <Heading size='medium' level='2' className='mb-5'>
          Arbeid med PVK etter tilbakemelding fra PVO
        </Heading>

        <TextAreaField
          height='150px'
          noPlaceholder
          label='Oppsummer for risikoeieren eventuelle endringer gjort som følge av PVOs tilbakemelding'
          name='merknadTilRisikoeier'
          markdown
        />
      </div>

      {errorSummaryComponent}

      {isLoading && (
        <div className='flex justify-center items-center w-full'>
          <Loader size='2xlarge' title='lagrer endringer' />
        </div>
      )}

      <div>
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
      </div>

      <CopyAndExportButtons etterlevelseDokumentasjonId={pvkDokument.etterlevelseDokumentId} />
    </div>
  )
}
export default VurdertAvPvoFields
