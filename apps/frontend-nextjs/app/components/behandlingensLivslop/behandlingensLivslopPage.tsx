'use client'

import {
  createBehandlingensLivslop,
  getBehandlingensLivslopByEtterlevelseDokumentId,
  mapBehandlingensLivslopRequestToFormValue,
  updateBehandlingensLivslop,
  useBehandlingensLivslop,
} from '@/api/behandlingensLivslop/behandlingensLivslopApi'
import { useEtterlevelseDokumentasjon } from '@/api/etterlevelseDokumentasjon/etterlevelseDokumentasjonApi'
import { getPvkDokumentByEtterlevelseDokumentId } from '@/api/pvkDokument/pvkDokumentApi'
import { IBehandlingensLivslopRequest } from '@/constants/behandlingensLivslop/behandlingensLivslop'
import { IBreadCrumbPath } from '@/constants/commonConstants'
import { IBehandlingensLivslop } from '@/constants/etterlevelseDokumentasjon/behandlingensLivslop/behandlingensLivslopConstants'
import {
  EPvkDokumentStatus,
  IPvkDokument,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { UserContext } from '@/provider/user/userProvider'
import {
  dokumentasjonUrl,
  etterlevelseDokumentasjonIdUrl,
} from '@/routes/etterlevelseDokumentasjon/etterlevelseDokumentasjonRoutes'
import { pvkDokumentasjonPvkTypeStepUrl } from '@/routes/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensvurderingRoutes'
import { dokumentasjonerBreadCrumbPath } from '@/util/breadCrumbPath/breadCrumbPath'
import { isReadOnlyPvkStatus } from '@/util/etterlevelseDokumentasjon/pvkDokument/pvkDokumentUtils'
import { ChevronLeftIcon, ChevronRightIcon } from '@navikt/aksel-icons'
import {
  Alert,
  BodyShort,
  Button,
  ErrorSummary,
  FileRejected,
  Heading,
  Loader,
} from '@navikt/ds-react'
import { Form, Formik, validateYupSchema, yupToFormErrors } from 'formik'
import _ from 'lodash'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { RefObject, useContext, useEffect, useRef, useState } from 'react'
import { TextAreaField } from '../common/textAreaField/textAreaField'
import UnsavedModalAlert from '../common/unsavedModalAlert/unsavedModalAlert'
import {
  ContentLayout,
  MainPanelLayout,
  SidePanelLayout,
  StickyFooterButtonLayout,
} from '../others/layout/content/content'
import { PageLayout } from '../others/scaffold/scaffold'
import AlertPvoUnderarbeidModal from '../pvoTilbakemelding/common/alertPvoUnderarbeidModal'
import BehandlingensLivslopReadOnlyContent from './content/behandlingensLivslopReadOnlyContent'
import BehandlingensLivslopTextContent from './content/behandlingensLivslopTextContent'
import CustomFileUpload from './fileUpload/customFileUpload'
import behandlingensLivslopSchema from './form/behandlingensLivslopSchema'
import BehandlingensLivsLopSidePanel from './sidePanel/BehandlingensLivsLopSidePanel'

export const BehandlingensLivslopPage = () => {
  const params: Readonly<
    Partial<{
      etterlevelseDokumentasjonId?: string
      behandlingensLivslopId?: string
    }>
  > = useParams<{ etterlevelseDokumentasjonId?: string; behandlingensLivslopId?: string }>()
  const [etterlevelseDokumentasjon, , isEtterlevelseDokumentasjonLoading] =
    useEtterlevelseDokumentasjon(params.etterlevelseDokumentasjonId)
  const [behandlingsLivslop, setBehandlingesLivslop] = useBehandlingensLivslop(
    params.behandlingensLivslopId,
    params.etterlevelseDokumentasjonId
  )

  const [pvkDokument, setPvkDokument] = useState<IPvkDokument>()
  const [filesToUpload, setFilesToUpload] = useState<File[]>([])
  const [rejectedFiles, setRejectedFiles] = useState<FileRejected[]>([])
  const [submitClick] = useState<boolean>(false)
  const [isPvoAlertModalOpen, setIsPvoAlertModalOpen] = useState<boolean>(false)
  const [isUnsavedModalOpen, setIsUnsavedModalOpen] = useState<boolean>(false)
  const [urlToNavigate, setUrlToNavigate] = useState<string>('')
  const [savedSuccessful, setSavedSuccessful] = useState<boolean>(false)
  const errorSummaryRef = useRef<HTMLDivElement>(null)
  const formRef: RefObject<any> = useRef(undefined)

  const router = useRouter()
  const user = useContext(UserContext)
  const breadcrumbPaths: IBreadCrumbPath[] = [
    dokumentasjonerBreadCrumbPath,
    {
      href: etterlevelseDokumentasjonIdUrl(etterlevelseDokumentasjon?.id),
      pathName:
        'E' +
        etterlevelseDokumentasjon?.etterlevelseNummer.toString() +
        ' ' +
        etterlevelseDokumentasjon?.title,
    },
  ]

  useEffect(() => {
    if (etterlevelseDokumentasjon) {
      getPvkDokumentByEtterlevelseDokumentId(etterlevelseDokumentasjon.id)
        .then((response) => {
          if (response) {
            setPvkDokument(response)
          }
        })
        .catch(() => undefined)
    }
  }, [etterlevelseDokumentasjon])

  useEffect(() => {
    if (!_.isEmpty(formRef?.current?.errors) && errorSummaryRef.current) {
      errorSummaryRef.current.focus()
    }
  }, [submitClick])

  const submit = async (behandlingensLivslop: any) => {
    if (etterlevelseDokumentasjon) {
      const mutatedBehandlingensLivslop = {
        ...behandlingensLivslop,
        filer: filesToUpload,
        etterlevelseDokumentasjonId: etterlevelseDokumentasjon.id,
      } as IBehandlingensLivslopRequest

      //double check if behandlingslivslop already exist before submitting
      let existingBehandlingsLivslopId = ''
      const existingBehandlingensLivsLop = await getBehandlingensLivslopByEtterlevelseDokumentId(
        etterlevelseDokumentasjon.id
      ).catch(() => undefined)

      if (existingBehandlingensLivsLop) {
        existingBehandlingsLivslopId = existingBehandlingensLivsLop.id
        mutatedBehandlingensLivslop.id = existingBehandlingensLivsLop.id
      }

      let pvkStatus = ''
      await getPvkDokumentByEtterlevelseDokumentId(etterlevelseDokumentasjon.id)
        .then((response) => {
          pvkStatus = response.status
        })
        .catch(() => undefined)

      if (isReadOnlyPvkStatus(pvkStatus as EPvkDokumentStatus)) {
        setIsPvoAlertModalOpen(true)
      } else {
        if (behandlingensLivslop.id || existingBehandlingsLivslopId) {
          await updateBehandlingensLivslop(mutatedBehandlingensLivslop).then((response) => {
            setBehandlingesLivslop(response)
          })
        } else {
          await createBehandlingensLivslop(mutatedBehandlingensLivslop).then((response) => {
            setBehandlingesLivslop(response)

            window.history.pushState(
              { savedAlert: true, pvkDokument: response },
              '',
              `${dokumentasjonUrl}/${response.etterlevelseDokumentasjonId}/behandlingens-livslop/${response.id}`
            )
          })
        }
      }
    }
  }

  const getPvkLink = (etterlevelseDokumentasjonId: string) => {
    const pvkDokumentLink: 'pvkdokument' | 'pvkbehov' =
      pvkDokument && pvkDokument.skalUtforePvk ? 'pvkdokument' : 'pvkbehov'

    return pvkDokumentasjonPvkTypeStepUrl(
      etterlevelseDokumentasjonId,
      pvkDokumentLink,
      pvkDokument ? pvkDokument.id : 'ny',
      pvkDokument && pvkDokument.skalUtforePvk ? '1' : ''
    )
  }

  return (
    <PageLayout
      pageTitle='Behandlingens livsløp'
      currentPage='Behandlingens livsløp'
      breadcrumbPaths={breadcrumbPaths}
    >
      <Heading level='1' size='medium' className='mb-5'>
        Behandlingens livsløp
      </Heading>

      {isEtterlevelseDokumentasjonLoading && (
        <div className='flex w-full justify-center'>
          <Loader size='large' />
        </div>
      )}

      {!isEtterlevelseDokumentasjonLoading &&
        etterlevelseDokumentasjon &&
        behandlingsLivslop &&
        !etterlevelseDokumentasjon.hasCurrentUserAccess &&
        !user.isAdmin() && (
          <div className='flex w-full justify-center mt-5'>
            <div className='flex items-center flex-col gap-5'>
              <Alert variant='warning'>Du har ikke tilgang til å redigere.</Alert>

              <Image
                src='https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExdXMyNngxa2djMXdhOXdhcXQwNG9hbWJ3czZ4MW42bDY3ZXVkNHd3eCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/zaCojXv2S01zy/giphy.webp'
                alt='no no no'
                width='400'
              />
            </div>
          </div>
        )}

      {!isEtterlevelseDokumentasjonLoading &&
        etterlevelseDokumentasjon &&
        behandlingsLivslop &&
        (etterlevelseDokumentasjon.hasCurrentUserAccess || user.isAdmin()) && (
          <ContentLayout>
            <MainPanelLayout hasSidePanel>
              {((pvkDokument && !isReadOnlyPvkStatus(pvkDokument.status)) || !pvkDokument) && (
                <div>
                  <Formik
                    validateOnBlur={false}
                    validateOnChange={false}
                    onSubmit={submit}
                    initialValues={mapBehandlingensLivslopRequestToFormValue(
                      behandlingsLivslop as IBehandlingensLivslop
                    )}
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
                    {({
                      submitForm,
                      resetForm,
                      values,
                      initialValues,
                      errors,
                      isSubmitting,
                      dirty,
                    }) => (
                      <Form>
                        <div>
                          <BehandlingensLivslopTextContent />

                          <BodyShort className='mb-3 mt-8'>
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
                              noPlaceholder
                              label='Legg eventuelt inn en beskrivelse av behandlingens livsløp'
                              name='beskrivelse'
                              height='5.75rem'
                            />
                          </div>

                          {!_.isEmpty(errors) && rejectedFiles.length > 0 && (
                            <ErrorSummary className='mt-3' ref={errorSummaryRef}>
                              <ErrorSummary.Item href={'#vedleggMedFeil'}>
                                Vedlegg med feil
                              </ErrorSummary.Item>
                            </ErrorSummary>
                          )}

                          {savedSuccessful && !dirty && (
                            <div className='mt-5'>
                              <Alert
                                variant='success'
                                closeButton
                                onClose={() => {
                                  setSavedSuccessful(false)
                                }}
                              >
                                Lagring vellykket
                              </Alert>
                            </div>
                          )}

                          {!isSubmitting && (
                            <div className='flex gap-2 mt-5 lg:flex-row flex-col'>
                              <Button
                                type='button'
                                onClick={async () => {
                                  await submitForm().then(() => {
                                    resetForm({ values })
                                    setSavedSuccessful(true)
                                  })
                                }}
                              >
                                Lagre
                              </Button>

                              <Button
                                type='button'
                                variant='tertiary'
                                onClick={() => {
                                  router.push(
                                    etterlevelseDokumentasjonIdUrl(etterlevelseDokumentasjon.id)
                                  )
                                }}
                              >
                                Forkast endringer
                              </Button>
                            </div>
                          )}

                          {isSubmitting && (
                            <div className='flex mt-5 justify-center items-center'>
                              <Loader size='large' />
                            </div>
                          )}
                        </div>
                      </Form>
                    )}
                  </Formik>
                  {pvkDokument && (
                    <AlertPvoUnderarbeidModal
                      isOpen={isPvoAlertModalOpen}
                      onClose={() => {
                        setIsPvoAlertModalOpen(false)
                      }}
                      pvkDokumentId={pvkDokument.id}
                    />
                  )}
                  <StickyFooterButtonLayout>
                    <Button
                      icon={<ChevronLeftIcon aria-hidden />}
                      iconPosition='left'
                      type='button'
                      variant='tertiary'
                      onClick={() => {
                        if (formRef.current.dirty) {
                          setIsUnsavedModalOpen(true)
                          setUrlToNavigate(
                            etterlevelseDokumentasjonIdUrl(etterlevelseDokumentasjon.id)
                          )
                        } else {
                          router.push(etterlevelseDokumentasjonIdUrl(etterlevelseDokumentasjon.id))
                        }
                      }}
                    >
                      Gå til Temaoversikt
                    </Button>
                    <Button
                      icon={<ChevronRightIcon aria-hidden />}
                      iconPosition='right'
                      type='button'
                      variant={'tertiary'}
                      onClick={() => {
                        if (formRef.current.dirty) {
                          setIsUnsavedModalOpen(true)
                          setUrlToNavigate(getPvkLink(etterlevelseDokumentasjon.id))
                        } else {
                          router.push(getPvkLink(etterlevelseDokumentasjon.id))
                        }
                      }}
                    >
                      {pvkDokument ? 'PVK-Oversikt' : 'Vurdér behov for PVK'}
                    </Button>
                  </StickyFooterButtonLayout>
                </div>
              )}

              <UnsavedModalAlert
                isOpen={isUnsavedModalOpen}
                setIsOpen={setIsUnsavedModalOpen}
                urlToNavigate={urlToNavigate}
                formRef={formRef}
              />

              {pvkDokument && isReadOnlyPvkStatus(pvkDokument.status) && (
                <BehandlingensLivslopReadOnlyContent
                  etterlevelseDokumentasjon={etterlevelseDokumentasjon}
                  behandlingensLivslop={mapBehandlingensLivslopRequestToFormValue(
                    behandlingsLivslop
                  )}
                  noSidePanelContent
                  noHeader
                />
              )}
            </MainPanelLayout>

            {/* right side */}
            {etterlevelseDokumentasjon && (
              <SidePanelLayout>
                <BehandlingensLivsLopSidePanel
                  etterlevelseDokumentasjon={etterlevelseDokumentasjon}
                />
              </SidePanelLayout>
            )}
          </ContentLayout>
        )}
    </PageLayout>
  )
}

export default BehandlingensLivslopPage
