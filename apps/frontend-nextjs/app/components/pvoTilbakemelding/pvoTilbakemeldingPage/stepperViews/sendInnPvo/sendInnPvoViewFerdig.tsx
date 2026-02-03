'use client'

import { arkiver } from '@/api/p360/p360Api'
import AlertPvoModal from '@/components/pvoTilbakemelding/common/alertPvoModal'
import { CopyLinkPvoButton } from '@/components/pvoTilbakemelding/common/copyLinkPvoButton'
import PvoSendInnTilbakemeldingsHistorikk from '@/components/pvoTilbakemelding/common/tilbakemeldingsHistorikk/pvoSendInnTilbakemeldingsHistorikk'
import PvoFormButtons from '@/components/pvoTilbakemelding/form/pvoFormButtons'
import { SendInnPvoReadOnly } from '@/components/pvoTilbakemelding/readOnly/sendInnPvoReadOnly'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { ICode } from '@/constants/kodeverk/kodeverkConstants'
import {
  EPvoTilbakemeldingStatus,
  IPvoTilbakemelding,
  IVurdering,
} from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { UserContext } from '@/provider/user/userProvider'
import { env } from '@/util/env/env'
import { Alert, Button } from '@navikt/ds-react'
import { Dispatch, FunctionComponent, SetStateAction, useContext } from 'react'

type TProps = {
  pvkDokument: IPvkDokument
  pvoTilbakemelding: IPvoTilbakemelding
  relevantVurdering: IVurdering
  activeStep: number
  submitForm: () => Promise<void>
  setSubmittedStatus: (value: SetStateAction<EPvoTilbakemeldingStatus>) => void
  setActiveStep: (step: number) => void
  setSelectedStep: (step: number) => void
  isAlertModalOpen: boolean
  setIsAlertModalOpen: Dispatch<SetStateAction<boolean>>
  pvoVurderingList: ICode[]
  setIsAngreInnsending: (state: boolean) => void
  sucessSubmit: boolean
  setSuccessSubmit: (state: boolean) => void
}

export const SendInnPvoViewFerdig: FunctionComponent<TProps> = ({
  pvkDokument,
  pvoTilbakemelding,
  relevantVurdering,
  activeStep,
  submitForm,
  setSubmittedStatus,
  setActiveStep,
  setSelectedStep,
  isAlertModalOpen,
  setIsAlertModalOpen,
  pvoVurderingList,
  setIsAngreInnsending,
  sucessSubmit,
  setSuccessSubmit,
}) => {
  const user = useContext(UserContext)

  return (
    <div className='pt-6 w-full'>
      <div className='w-full flex justify-center'>
        <div className='max-w-[75ch]'>
          {pvkDokument.antallInnsendingTilPvo > 1 && (
            <div className='mt-5 mb-10'>
              <PvoSendInnTilbakemeldingsHistorikk
                pvkDokument={pvkDokument}
                pvoVurderingList={pvoVurderingList}
                pvoTilbakemelding={pvoTilbakemelding}
                relevantVurderingsInnsendingId={pvkDokument.antallInnsendingTilPvo}
              />
            </div>
          )}

          <SendInnPvoReadOnly
            pvkDokument={pvkDokument}
            relevantVurdering={relevantVurdering}
            pvoVurderingList={pvoVurderingList}
            headingLevel='2'
          />

          <CopyLinkPvoButton />

          {sucessSubmit && (
            <Alert variant='success' closeButton onClose={() => setSuccessSubmit(false)}>
              Lagring velykket
            </Alert>
          )}

          <Alert variant='success' className='my-5'>
            Tilbakemelding er sendt
          </Alert>
        </div>
      </div>

      <PvoFormButtons
        activeStep={activeStep}
        setActiveStep={setActiveStep}
        setSelectedStep={setSelectedStep}
        customButtons={
          <div className='mt-5 flex gap-2 items-center'>
            <Button
              type='button'
              variant='secondary'
              onClick={async () => {
                setSubmittedStatus(EPvoTilbakemeldingStatus.UNDERARBEID)
                setIsAngreInnsending(true)
                await submitForm()
              }}
            >
              Angre tilbakemelding
            </Button>

            {user.isAdmin() && (
              <Button
                type='button'
                onClick={async () => {
                  if (!env.isDev) {
                    await arkiver(pvkDokument.etterlevelseDokumentId, true, true, false, false)
                  }
                }}
              >
                Arkiver i Public 360 (kun admin)
              </Button>
            )}
          </div>
        }
      />

      <AlertPvoModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        pvkDokumentId={pvkDokument.id}
      />
    </div>
  )
}

export default SendInnPvoViewFerdig
