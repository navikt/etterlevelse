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
import BehandlingensLivsLopSidePanel from '../behandlingensLivlop/BehandlingensLivslopSidePanel'
import BehandlingensLivslopTextContent from '../behandlingensLivlop/BehandlingensLivslopTextContent'
import DataTextWrapper from './common/DataTextWrapper'
import PvoSidePanelWrapper from './common/PvoSidePanelWrapper'
import PvoFormButtons from './edit/PvoFormButtons'
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
                    <VStack gap="2">
                      <Heading level="3" size="xsmall">
                        {`Behandlingens livsløp filer som er lastet opp. (${files.length})`}
                      </Heading>
                      <VStack as="ul" gap="3">
                        {files.length > 0 &&
                          files.map((file, index) => (
                            <FileUpload.Item
                              as="li"
                              key={file.file.name + '_' + index}
                              file={file.file}
                            />
                          ))}
                        {files.length === 0 && <DataTextWrapper>Ingen filer</DataTextWrapper>}
                      </VStack>
                    </VStack>
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
            <PvoSidePanelWrapper>
              <PvoTilbakemeldingForm
                pvkDokumentId={pvkDokument.id}
                fieldName="behandlingenslivslop"
                initialValue={pvoTilbakemelding.behandlingenslivslop}
                formRef={formRef}
              />
            </PvoSidePanelWrapper>
          </div>
          <PvoFormButtons
            activeStep={activeStep}
            setActiveStep={setActiveStep}
            setSelectedStep={setSelectedStep}
            submitForm={formRef.current?.submitForm}
          />
        </div>
      )}
    </div>
  )
}
export default BehandlingensLivslopPvoView
