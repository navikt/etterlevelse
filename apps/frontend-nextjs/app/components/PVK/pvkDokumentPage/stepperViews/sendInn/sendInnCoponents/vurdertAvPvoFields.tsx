'use client'

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
import { Alert, Button, Heading, Loader, Modal } from '@navikt/ds-react'
import { FormikErrors, useFormikContext } from 'formik'
import { FunctionComponent, ReactNode, useEffect, useMemo, useState } from 'react'

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
  const [isSendTilPvoForRevurderingModalOpen, setIsSendTilPvoForRevurderingModalOpen] =
    useState(false)
  const [savedSuccessful, setSavedSuccessful] = useState(false)
  const [attemptedRevurderingSend, setAttemptedRevurderingSend] = useState(false)

  const nextInnsendingId = pvkDokument.antallInnsendingTilPvo + 1

  // Pure index lookup (no side effects)
  const relevantIndex = useMemo(
    () => pvkDokument.meldingerTilPvo.findIndex((m) => m.innsendingId === nextInnsendingId),
    [pvkDokument.meldingerTilPvo, nextInnsendingId]
  )
  const { values } = useFormikContext<IPvkDokument>()
  // Index to use for field binding (after first render addition)
  const effectiveIndex = relevantIndex === -1 ? pvkDokument.meldingerTilPvo.length : relevantIndex
  const merknadTilPvoValue = values?.meldingerTilPvo?.[effectiveIndex]?.merknadTilPvo?.trim() ?? ''
  const merknadEmpty = merknadTilPvoValue.length === 0

  // Append new melding when missing
  useEffect(() => {
    if (relevantIndex === -1) {
      setFieldValue('meldingerTilPvo', [
        ...pvkDokument.meldingerTilPvo,
        mapMeldingTilPvoToFormValue({ innsendingId: nextInnsendingId }),
      ])
    }
  }, [relevantIndex, nextInnsendingId, pvkDokument.meldingerTilPvo, setFieldValue])

  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])

  return (
    <div className='w-full'>
      <div className='w-full flex justify-center'>
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
            <div className='mt-8 mb-3' suppressHydrationWarning>
              {hydrated && (
                <TextAreaField
                  height='150px'
                  noPlaceholder
                  label='Oppsummer for risikoeieren eventuelle endringer gjort som følge av PVOs tilbakemelding'
                  name='merknadTilRisikoeier'
                  markdown
                />
              )}
            </div>
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

          {savedSuccessful && (
            <div className='mt-5'>
              <Alert variant='success' closeButton onClose={() => setSavedSuccessful(false)}>
                Lagring vellykket
              </Alert>
            </div>
          )}
        </div>
      </div>

      <div className='mt-5 flex gap-2 items-center'>
        <Button
          type='button'
          variant='tertiary'
          onClick={async () => {
            setIsSendTilPvoForRevurderingModalOpen(true)
          }}
        >
          Send til PVO for revurdering
        </Button>

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
          Lagre og send til risikoeier
        </Button>
      </div>

      <CopyAndExportButtons etterlevelseDokumentasjonId={pvkDokument.etterlevelseDokumentId} />

      <Modal
        header={{ heading: 'Vil dere sende til Personvernombudet for revurdering?' }}
        open={isSendTilPvoForRevurderingModalOpen}
        onClose={() => {
          setAttemptedRevurderingSend(false)
          setIsSendTilPvoForRevurderingModalOpen(false)
        }}
      >
        <Modal.Body>
          {savedSuccessful && (
            <Alert
              variant='success'
              inline
              className='mb-4'
              closeButton
              onClose={() => setSavedSuccessful(false)}
            >
              Lagring vellykket
            </Alert>
          )}

          <Alert variant='warning' inline className='mb-5'>
            PVO har ikke bedt om å få deres PVK i retur. Men dersom risikobildet er endret siden
            dere sendte inn til PVO sist, burde dere sende inn på nytt.
          </Alert>
          <div className='mt-8 mb-3'>
            <TextAreaField
              height='150px'
              noPlaceholder
              label='Forklar hvorfor dere ønsker å sende inn til ny vurdering'
              name={`meldingerTilPvo[${effectiveIndex}].merknadTilPvo`}
              markdown
            />
            {attemptedRevurderingSend && merknadEmpty && (
              <Alert variant='error' inline className='mt-3'>
                Forklar hvorfor dere ønsker å sende inn til ny vurdering må fylles ut.
              </Alert>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            type='button'
            variant='primary'
            onClick={async () => {
              setAttemptedRevurderingSend(true)
              if (merknadEmpty) return
              await setFieldValue('status', EPvkDokumentStatus.SENDT_TIL_PVO_FOR_REVURDERING)
              await setFieldValue('antallInnsendingTilPvo', pvkDokument.antallInnsendingTilPvo + 1)
              setAttemptedRevurderingSend(false)
              await submitForm()
              setIsSendTilPvoForRevurderingModalOpen(false)
            }}
          >
            Send til PVO for revurdering
          </Button>

          <Button
            type='button'
            variant='secondary'
            onClick={async () => {
              await submitForm()
              setSavedSuccessful(true)
              setIsSendTilPvoForRevurderingModalOpen(false)
              setAttemptedRevurderingSend(false)
            }}
          >
            Lagre og fortsett senere
          </Button>

          <Button
            type='button'
            variant='tertiary'
            onClick={() => {
              setAttemptedRevurderingSend(false)
              setIsSendTilPvoForRevurderingModalOpen(false)
            }}
          >
            Avbryt
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
export default VurdertAvPvoFields
