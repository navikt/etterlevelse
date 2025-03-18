import { Loader } from '@navikt/ds-react'
import { RefObject, useEffect, useState } from 'react'
import {
  getBehandlingensLivslopByEtterlevelseDokumentId,
  mapBehandlingensLivslopToFormValue,
} from '../../api/BehandlingensLivslopApi'
import { IBehandlingensLivslop, IPvkDokument, IPvoTilbakemelding } from '../../constants'
import FormButtons from '../PvkDokument/edit/FormButtons'
import PvoTilbakemeldingForm from './edit/PvoTilbakemeldingForm'

interface IProps {
  pvoTilbakemelding: IPvoTilbakemelding
  pvkDokument: IPvkDokument
  etterlevelseDokumentasjonId: string
  activeStep: number
  setActiveStep: (step: number) => void
  setSelectedStep: (step: number) => void
  formRef: RefObject<any>
}

export const BehandlingensLivslopPvoView = (props: IProps) => {
  const {
    pvoTilbakemelding,
    pvkDokument,
    etterlevelseDokumentasjonId,
    activeStep,
    setActiveStep,
    setSelectedStep,
    formRef,
  } = props
  const [behandlingensLivslop, setBehandlingsLivslop] = useState<IBehandlingensLivslop>(
    mapBehandlingensLivslopToFormValue({})
  )
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    ;(async () => {
      if (etterlevelseDokumentasjonId) {
        setIsLoading(true)
        await getBehandlingensLivslopByEtterlevelseDokumentId(etterlevelseDokumentasjonId)
          .then(setBehandlingsLivslop)
          .finally(() => setIsLoading(false))
      }
    })()
  }, [etterlevelseDokumentasjonId])

  return (
    <div className="flex justify-center">
      {isLoading && (
        <div className="flex w-full justify-center items-center mt-5">
          <Loader size="3xlarge" className="flex justify-self-center" />
        </div>
      )}
      {!isLoading && (
        <div className="w-full">
          <div className="flex w-full">
            <div className="pt-6 pr-4 flex flex-1 flex-col gap-4 col-span-8">
              <div className="flex justify-center">{behandlingensLivslop.beskrivelse}</div>
            </div>
            {/* PVO sidepanel */}
            <div className="px-4 py-4 border-l border-[#071a3636] w-full max-w-md bg-[#F0EEF4] mt-35">
              <PvoTilbakemeldingForm
                pvkDokumentId={pvkDokument.id}
                fieldName="behandlingensArtOgOmfang"
                initialValue={pvoTilbakemelding.behandlingensArtOgOmfang}
                formRef={formRef}
              />
            </div>
          </div>
          <FormButtons
            etterlevelseDokumentasjonId={etterlevelseDokumentasjonId}
            activeStep={activeStep}
            setActiveStep={setActiveStep}
            setSelectedStep={setSelectedStep}
          />
        </div>
      )}
    </div>
  )
}
export default BehandlingensLivslopPvoView
