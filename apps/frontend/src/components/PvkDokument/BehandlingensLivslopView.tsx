import { BodyShort, Button, ErrorSummary, FileRejected, Heading, Loader } from '@navikt/ds-react'
import { AxiosError } from 'axios'
import { Form, Formik, validateYupSchema, yupToFormErrors } from 'formik'
import _ from 'lodash'
import { FunctionComponent, RefObject, useEffect, useRef, useState } from 'react'
import {
  createBehandlingensLivslop,
  getBehandlingensLivslopByEtterlevelseDokumentId,
  mapBehandlingensLivslopRequestToFormValue,
  mapBehandlingensLivslopToFormValue,
  updateBehandlingensLivslop,
} from '../../api/BehandlingensLivslopApi'
import {
  EPvoTilbakemeldingStatus,
  IBehandlingensLivslop,
  IBehandlingensLivslopRequest,
  IPvoTilbakemelding,
  TEtterlevelseDokumentasjonQL,
} from '../../constants'
import PvoSidePanelWrapper from '../PvoTilbakemelding/common/PvoSidePanelWrapper'
import PvoTilbakemeldingReadOnly from '../PvoTilbakemelding/common/PvoTilbakemeldingReadOnly'
import BehandlingensLivsLopSidePanel from '../behandlingensLivlop/BehandlingensLivslopSidePanel'
import BehandlingensLivslopTextContent from '../behandlingensLivlop/BehandlingensLivslopTextContent'
import CustomFileUpload from '../behandlingensLivlop/CustomFileUpload'
import behandlingensLivslopSchema from '../behandlingensLivlop/behandlingensLivsLopSchema'
import { TextAreaField } from '../common/Inputs'
import FormButtons from './edit/FormButtons'

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  activeStep: number
  setActiveStep: (step: number) => void
  setSelectedStep: (step: number) => void
  formRef: RefObject<any>
  pvoTilbakemelding?: IPvoTilbakemelding
}

export const BehandlingensLivslopView: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  activeStep,
  setActiveStep,
  setSelectedStep,
  formRef,
  pvoTilbakemelding,
}) => {
  const [behandlingensLivslop, setBehandlingensLivslop] = useState<IBehandlingensLivslop>()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [filesToUpload, setFilesToUpload] = useState<File[]>([])
  const [rejectedFiles, setRejectedFiles] = useState<FileRejected[]>([])
  const [submitClick, setSubmitClick] = useState<boolean>(false)
  const errorSummaryRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    ;(async () => {
      if (etterlevelseDokumentasjon && etterlevelseDokumentasjon.id) {
        setIsLoading(true)
        await getBehandlingensLivslopByEtterlevelseDokumentId(etterlevelseDokumentasjon.id)
          .then((response: IBehandlingensLivslop) => {
            setBehandlingensLivslop(response)
          })
          .catch((error: AxiosError) => {
            if (error.status === 404) {
              setBehandlingensLivslop(mapBehandlingensLivslopToFormValue({}))
            } else {
              console.debug(error)
            }
          })
          .finally(() => setIsLoading(false))
      }
    })()
  }, [etterlevelseDokumentasjon])

  useEffect(() => {
    if (!_.isEmpty(formRef?.current?.errors) && errorSummaryRef.current) {
      errorSummaryRef.current.focus()
    }
  }, [submitClick])

  const submit = async (submitedValues: any): Promise<void> => {
    if (etterlevelseDokumentasjon) {
      const mutatedBehandlingensLivslop = {
        ...submitedValues,
        filer: filesToUpload,
        etterlevelseDokumentasjonId: etterlevelseDokumentasjon.id,
      } as IBehandlingensLivslopRequest

      //double check if behandlingslivslop already exist before submitting
      let existingBehandlingsLivslopId: string = ''
      const existingBehandlingensLivsLop = await getBehandlingensLivslopByEtterlevelseDokumentId(
        etterlevelseDokumentasjon.id
      ).catch(() => undefined)

      if (existingBehandlingensLivsLop) {
        existingBehandlingsLivslopId = existingBehandlingensLivsLop.id
        mutatedBehandlingensLivslop.id = existingBehandlingensLivsLop.id
      }

      if (submitedValues.id || existingBehandlingsLivslopId) {
        await updateBehandlingensLivslop(mutatedBehandlingensLivslop).then(
          (response: IBehandlingensLivslop) => {
            setBehandlingensLivslop(response)
            window.location.reload()
          }
        )
      } else {
        await createBehandlingensLivslop(mutatedBehandlingensLivslop).then(
          (response: IBehandlingensLivslop) => {
            setBehandlingensLivslop(response)
            window.location.reload()
          }
        )
      }
    }
  }

  return (
    <div className='w-full'>
      {isLoading && (
        <div className='flex w-full justify-center items-center mt-5'>
          <Loader size='3xlarge' className='flex justify-self-center' />
        </div>
      )}
      {!isLoading && behandlingensLivslop && (
        <div className='flex w-full'>
          <div className='pt-6 pr-4 flex flex-1 flex-col gap-4 col-span-8'>
            <Formik
              validateOnBlur={false}
              validateOnChange={false}
              onSubmit={submit}
              initialValues={mapBehandlingensLivslopRequestToFormValue(behandlingensLivslop)}
              validate={() => {
                try {
                  validateYupSchema(
                    { rejectedFiles: rejectedFiles },
                    behandlingensLivslopSchema(),
                    true
                  )
                } catch (error) {
                  return yupToFormErrors(error)
                }
              }}
              innerRef={formRef}
            >
              {({ submitForm, initialValues, errors, isSubmitting }) => (
                <Form>
                  <div className='pr-6 flex flex-1 flex-col gap-4 col-span-8'>
                    <Heading level='1' size='medium' className='mb-5'>
                      Behandlingens livsløp
                    </Heading>

                    <BehandlingensLivslopTextContent />

                    <BodyShort className='mt-3'>
                      Dere kan velge å lage og laste opp flere tegninger hvis det gir bedre
                      oversikt.
                    </BodyShort>

                    <CustomFileUpload
                      initialValues={initialValues.filer}
                      rejectedFiles={rejectedFiles}
                      setRejectedFiles={setRejectedFiles}
                      setFilesToUpload={setFilesToUpload}
                    />

                    <div className='mt-3'>
                      <TextAreaField
                        markdown
                        height='5.75rem'
                        noPlaceholder
                        label='Legg eventuelt inn en beskrivelse av behandlingens livsløp'
                        name='beskrivelse'
                      />
                    </div>

                    {!_.isEmpty(errors) && rejectedFiles.length > 0 && (
                      <ErrorSummary className='mt-3' ref={errorSummaryRef}>
                        <ErrorSummary.Item href={'#vedleggMedFeil'}>
                          Vedlegg med feil
                        </ErrorSummary.Item>
                      </ErrorSummary>
                    )}

                    {!isSubmitting && (
                      <div className='flex gap-2 mt-5 lg:flex-row flex-col'>
                        <Button
                          type='button'
                          onClick={async () => {
                            await submitForm()
                            setSubmitClick(!submitClick)
                          }}
                        >
                          Lagre
                        </Button>
                      </div>
                    )}

                    {isSubmitting && (
                      <div className='flex mt-5 justify-center items-center'>
                        <Loader size='large' />
                      </div>
                    )}
                  </div>

                  {pvoTilbakemelding && etterlevelseDokumentasjon && (
                    <div className='mt-5'>
                      <div className='pt-6 border-t border-[#071a3636]'>
                        <BehandlingensLivsLopSidePanel
                          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
                        />
                      </div>
                    </div>
                  )}
                </Form>
              )}
            </Formik>
          </div>

          {/* Sidepanel */}
          {pvoTilbakemelding && pvoTilbakemelding.status === EPvoTilbakemeldingStatus.FERDIG && (
            <PvoSidePanelWrapper>
              <PvoTilbakemeldingReadOnly
                tilbakemeldingsinnhold={pvoTilbakemelding.behandlingenslivslop}
                sentDate={pvoTilbakemelding.sendtDato}
              />
            </PvoSidePanelWrapper>
          )}

          {!pvoTilbakemelding && etterlevelseDokumentasjon && (
            <div className='pl-6 border-l border-[#071a3636] w-full max-w-lg'>
              <BehandlingensLivsLopSidePanel
                etterlevelseDokumentasjon={etterlevelseDokumentasjon}
              />
            </div>
          )}
          {/* Slutt på sidepanel innhold*/}
        </div>
      )}
      <FormButtons
        etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
        activeStep={activeStep}
        setActiveStep={setActiveStep}
        setSelectedStep={setSelectedStep}
        submitForm={formRef.current?.submitForm}
      />
    </div>
  )
}

export default BehandlingensLivslopView
