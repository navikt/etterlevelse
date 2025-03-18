import { BodyLong, FileObject, FileUpload, Heading, Label, Loader, VStack } from '@navikt/ds-react'
import { RefObject, useEffect, useState } from 'react'
import {
  getBehandlingensLivslopByEtterlevelseDokumentId,
  mapBehandlingensLivslopRequestToFormValue,
} from '../../api/BehandlingensLivslopApi'
import {
  IBehandlingensLivslopRequest,
  IEtterlevelseDokumentasjon,
  IPvkDokument,
  IPvoTilbakemelding,
} from '../../constants'
import FormButtons from '../PvkDokument/edit/FormButtons'
import BehandlingensLivsLopSidePanel from '../behandlingensLivlop/BehandlingensLivslopSidePanel'
import BehandlingensLivslopTextContent from '../behandlingensLivlop/BehandlingensLivslopTextContent'
import DataTextWrapper from './DataTextWrapper'
import PvoTilbakemeldingForm from './edit/PvoTilbakemeldingForm'

interface IProps {
  pvoTilbakemelding: IPvoTilbakemelding
  pvkDokument: IPvkDokument
  etterlevelseDokumentasjon: IEtterlevelseDokumentasjon
  activeStep: number
  setActiveStep: (step: number) => void
  setSelectedStep: (step: number) => void
  formRef: RefObject<any>
}

export const BehandlingensLivslopPvoView = (props: IProps) => {
  const {
    pvoTilbakemelding,
    pvkDokument,
    etterlevelseDokumentasjon,
    activeStep,
    setActiveStep,
    setSelectedStep,
    formRef,
  } = props
  const [behandlingensLivslop, setBehandlingsLivslop] = useState<IBehandlingensLivslopRequest>(
    mapBehandlingensLivslopRequestToFormValue({})
  )

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [files, setFiles] = useState<FileObject[]>([])

  useEffect(() => {
    ;(async () => {
      if (etterlevelseDokumentasjon.id) {
        setIsLoading(true)
        await getBehandlingensLivslopByEtterlevelseDokumentId(etterlevelseDokumentasjon.id)
          .then((response) => {
            const behandlingenslivslop = mapBehandlingensLivslopRequestToFormValue(response)
            setBehandlingsLivslop(behandlingenslivslop)
            if (behandlingenslivslop.filer && behandlingenslivslop.filer.length > 0) {
              const initialFiles: FileObject[] = []
              behandlingenslivslop.filer.forEach((initialFile) => {
                initialFiles.push({ file: initialFile, error: false })
              })
              setFiles(initialFiles)
            }
          })
          .finally(() => setIsLoading(false))
      }
    })()
  }, [etterlevelseDokumentasjon])

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
              <div className="flex justify-center">
                <div>
                  <Heading level="1" size="medium" className="mb-5">
                    Behandlingens livsløp
                  </Heading>

                  <BehandlingensLivslopTextContent />

                  <VStack gap="6" className="mt-5">
                    {files.length > 0 && (
                      <VStack gap="2">
                        <Heading level="3" size="xsmall">
                          {`Behandlingens livsløp filer som er lastet opp. (${files.length})`}
                        </Heading>
                        <VStack as="ul" gap="3">
                          {files.map((file, index) => (
                            <FileUpload.Item
                              as="li"
                              key={file.file.name + '_' + index}
                              file={file.file}
                            />
                          ))}
                        </VStack>
                      </VStack>
                    )}
                  </VStack>

                  <div className="mt-5">
                    <Label>Beskrivelse av behandlingens livsløp</Label>
                    <DataTextWrapper>
                      <BodyLong>
                        {behandlingensLivslop.beskrivelse && behandlingensLivslop.beskrivelse}
                        {!behandlingensLivslop.beskrivelse && 'Ingen beskrivelse '}
                      </BodyLong>
                    </DataTextWrapper>
                  </div>

                  <div className="mt-5">
                    <div className="pt-6 border-t border-[#071a3636]">
                      <BehandlingensLivsLopSidePanel
                        etterlevelseDokumentasjon={etterlevelseDokumentasjon}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* PVO sidepanel */}
            <div className="px-4 py-4 border-l border-[#071a3636] w-full max-w-md bg-[#e3eff7] mt-35">
              <PvoTilbakemeldingForm
                pvkDokumentId={pvkDokument.id}
                fieldName="behandlingenslivslop"
                initialValue={pvoTilbakemelding.behandlingenslivslop}
                formRef={formRef}
              />
            </div>
          </div>
          <FormButtons
            etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
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
