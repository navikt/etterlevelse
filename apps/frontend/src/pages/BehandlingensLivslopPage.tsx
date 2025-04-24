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
import { RefObject, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  createBehandlingensLivslop,
  getBehandlingensLivslopByEtterlevelseDokumentId,
  mapBehandlingensLivslopRequestToFormValue,
  updateBehandlingensLivslop,
  useBehandlingensLivslop,
} from '../api/BehandlingensLivslopApi'
import { useEtterlevelseDokumentasjon } from '../api/EtterlevelseDokumentasjonApi'
import { getPvkDokumentByEtterlevelseDokumentId } from '../api/PvkDokumentApi'
import BehandlingensLivsLopSidePanel from '../components/behandlingensLivlop/BehandlingensLivslopSidePanel'
import BehandlingensLivslopTextContent from '../components/behandlingensLivlop/BehandlingensLivslopTextContent'
import { CustomFileUpload } from '../components/behandlingensLivlop/CustomFileUpload'
import behandlingensLivslopSchema from '../components/behandlingensLivlop/behandlingensLivsLopSchema'
import { TextAreaField } from '../components/common/Inputs'
import { etterlevelseDokumentasjonIdUrl } from '../components/common/RouteLinkEtterlevelsesdokumentasjon'
import { pvkDokumentasjonPvkTypeStepUrl } from '../components/common/RouteLinkPvk'
import { PageLayout } from '../components/scaffold/Page'
import {
  IBehandlingensLivslop,
  IBehandlingensLivslopRequest,
  IBreadCrumbPath,
  IPvkDokument,
} from '../constants'
import { user } from '../services/User'
import { dokumentasjonerBreadCrumbPath } from './util/BreadCrumbPath'

export const BehandlingensLivslopPage = () => {
  const params: Readonly<
    Partial<{
      id?: string
      behandlingsLivslopId?: string
    }>
  > = useParams<{ id?: string; behandlingsLivslopId?: string }>()
  const [etterlevelseDokumentasjon, , isEtterlevelseDokumentasjonLoading] =
    useEtterlevelseDokumentasjon(params.id)
  const [behandlingsLivslop, setBehandlingesLivslop] = useBehandlingensLivslop(
    params.behandlingsLivslopId,
    params.id
  )
  const [tilPvkDokument, setTilPvkDokument] = useState<boolean>(false)
  const [tilTemaOversikt, setTilTemaOversikt] = useState<boolean>(false)
  const [pvkDokument, setPvkDokument] = useState<IPvkDokument>()
  const [filesToUpload, setFilesToUpload] = useState<File[]>([])
  const [rejectedFiles, setRejectedFiles] = useState<FileRejected[]>([])
  const [submitClick, setSubmitClick] = useState<boolean>(false)
  const errorSummaryRef = useRef<HTMLDivElement>(null)
  const formRef: RefObject<any> = useRef(undefined)

  const navigate = useNavigate()
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

      const pvkDokumentLink: '/pvkdokument/' | '/pvkbehov/' =
        pvkDokument && pvkDokument.skalUtforePvk ? '/pvkdokument/' : '/pvkbehov/'

      if (behandlingensLivslop.id || existingBehandlingsLivslopId) {
        await updateBehandlingensLivslop(mutatedBehandlingensLivslop).then((response) => {
          setBehandlingesLivslop(response)
          if (tilTemaOversikt) {
            navigate(etterlevelseDokumentasjonIdUrl(response.etterlevelseDokumentasjonId))
          } else if (tilPvkDokument) {
            navigate(
              pvkDokumentasjonPvkTypeStepUrl(
                response.etterlevelseDokumentasjonId,
                pvkDokumentLink,
                pvkDokument ? pvkDokument.id : 'ny',
                (pvkDokument && pvkDokument.skalUtforePvk ? '/1' : '')
              )
            )
          }
        })
      } else {
        await createBehandlingensLivslop(mutatedBehandlingensLivslop).then((response) => {
          setBehandlingesLivslop(response)
          if (tilTemaOversikt) {
            navigate(etterlevelseDokumentasjonIdUrl(response.etterlevelseDokumentasjonId))
          } else if (tilPvkDokument) {
            navigate(
              pvkDokumentasjonPvkTypeStepUrl(
                response.etterlevelseDokumentasjonId,
                pvkDokumentLink,
                pvkDokument ? pvkDokument.id : 'ny'
              )
            )
          }
        })
      }
    }
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

              <img
                src='https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExdXMyNngxa2djMXdhOXdhcXQwNG9hbWJ3czZ4MW42bDY3ZXVkNHd3eCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/zaCojXv2S01zy/giphy.webp'
                alt='no no no'
                width='400px'
              />
            </div>
          </div>
        )}

      {!isEtterlevelseDokumentasjonLoading &&
        etterlevelseDokumentasjon &&
        behandlingsLivslop &&
        (etterlevelseDokumentasjon.hasCurrentUserAccess || user.isAdmin()) && (
          <div className='flex w-full'>
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
              {({ submitForm, initialValues, errors, isSubmitting }) => (
                <Form>
                  <div className='pr-6 flex flex-1 flex-col gap-4 col-span-8'>
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

                    {!isSubmitting && (
                      <div className='flex gap-2 mt-5 lg:flex-row flex-col'>
                        <Button
                          type='button'
                          onClick={() => {
                            setTilPvkDokument(true)
                            submitForm()
                          }}
                        >
                          {pvkDokument
                            ? 'Lagre og gå til PVK-Oversikt'
                            : 'Lagre og vurdér behov for PVK'}
                        </Button>
                        <Button
                          type='button'
                          variant='secondary'
                          onClick={async () => {
                            setTilTemaOversikt(true)
                            await submitForm()
                            setSubmitClick(!submitClick)
                          }}
                        >
                          Lagre og gå til Temaoversikt
                        </Button>
                        <Button
                          type='button'
                          variant='tertiary'
                          onClick={() => {
                            navigate(etterlevelseDokumentasjonIdUrl(etterlevelseDokumentasjon.id))
                          }}
                        >
                          Avbryt
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

            {/* right side */}
            {etterlevelseDokumentasjon && (
              <div className='pl-6 border-l border-[#071a3636] w-full max-w-lg'>
                <BehandlingensLivsLopSidePanel
                  etterlevelseDokumentasjon={etterlevelseDokumentasjon}
                />
              </div>
            )}
          </div>
        )}
    </PageLayout>
  )
}

export default BehandlingensLivslopPage
