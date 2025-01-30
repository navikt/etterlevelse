import {
  Alert,
  BodyShort,
  Button,
  ErrorSummary,
  FileRejected,
  Heading,
  Label,
  Link,
  List,
  Loader,
  ReadMore,
} from '@navikt/ds-react'
import { Form, Formik, validateYupSchema, yupToFormErrors } from 'formik'
import _ from 'lodash'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { behandlingName } from '../api/BehandlingApi'
import {
  createBehandlingensLivslop,
  getBehandlingensLivslopByEtterlevelseDokumentId,
  mapBehandlingensLivslopRequestToFormValue,
  updateBehandlingensLivslop,
  useBehandlingensLivslop,
} from '../api/BehandlingensLivslopApi'
import { useEtterlevelseDokumentasjon } from '../api/EtterlevelseDokumentasjonApi'
import { getPvkDokumentByEtterlevelseDokumentId } from '../api/PvkDokumentApi'
import { CustomFileUpload } from '../components/behandlingensLivlop/CustomFileUpload'
import behandlingensLivslopSchema from '../components/behandlingensLivlop/behandlingensLivsLopSchema'
import { TextAreaField } from '../components/common/Inputs'
import { Markdown } from '../components/common/Markdown'
import { ExternalLink } from '../components/common/RouteLink'
import { PageLayout } from '../components/scaffold/Page'
import {
  IBehandling,
  IBehandlingensLivslop,
  IBehandlingensLivslopRequest,
  IBreadCrumbPath,
  IPvkDokument,
} from '../constants'
import behandlingensLivslopImage from '../resources/behandlingensLivslop.png'
import { user } from '../services/User'
import { env } from '../util/env'
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
    params.behandlingsLivslopId
  )
  const [tilPvkDokument, setTilPvkDokument] = useState<boolean>(false)
  const [tilTemaOversikt, setTilTemaOversikt] = useState<boolean>(false)
  const [pvkDokument, setPvkDokument] = useState<IPvkDokument>()
  const [filesToUpload, setFilesToUpload] = useState<File[]>([])
  const [rejectedFiles, setRejectedFiles] = useState<FileRejected[]>([])
  const navigate = useNavigate()
  const breadcrumbPaths: IBreadCrumbPath[] = [
    dokumentasjonerBreadCrumbPath,
    {
      href: '/dokumentasjon/' + etterlevelseDokumentasjon?.id,
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

      const pvkDokumentLink =
        pvkDokument && pvkDokument.skalUtforePvk ? '/pvkdokument/' : '/pvkbehov/'

      if (behandlingensLivslop.id || existingBehandlingsLivslopId) {
        await updateBehandlingensLivslop(mutatedBehandlingensLivslop).then((response) => {
          setBehandlingesLivslop(response)
          if (tilTemaOversikt) {
            navigate('/dokumentasjon/' + response.etterlevelseDokumentasjonId)
          } else if (tilPvkDokument) {
            navigate(
              '/dokumentasjon/' +
                response.etterlevelseDokumentasjonId +
                pvkDokumentLink +
                (pvkDokument ? pvkDokument.id : 'ny') +
                '/1'
            )
          }
        })
      } else {
        await createBehandlingensLivslop(mutatedBehandlingensLivslop).then((response) => {
          setBehandlingesLivslop(response)
          if (tilTemaOversikt) {
            navigate('/dokumentasjon/' + response.etterlevelseDokumentasjonId)
          } else if (tilPvkDokument) {
            navigate(
              '/dokumentasjon/' +
                response.etterlevelseDokumentasjonId +
                pvkDokumentLink +
                (pvkDokument ? pvkDokument.id : 'ny')
            )
          }
        })
      }
    }
  }

  return (
    <PageLayout
      pageTitle="Behandlingens livsløp"
      currentPage="Behandlingens livsløp"
      breadcrumbPaths={breadcrumbPaths}
    >
      <Heading level="1" size="medium" className="mb-5">
        Behandlingens livsløp
      </Heading>

      {isEtterlevelseDokumentasjonLoading && (
        <div className="flex w-full justify-center">
          <Loader size="large" />
        </div>
      )}

      {!isEtterlevelseDokumentasjonLoading &&
        etterlevelseDokumentasjon &&
        behandlingsLivslop &&
        !etterlevelseDokumentasjon.hasCurrentUserAccess &&
        !user.isAdmin() && (
          <div className="flex w-full justify-center mt-5">
            <div className="flex items-center flex-col gap-5">
              <Alert variant="warning">Du har ikke tilgang til å redigere.</Alert>

              <img
                src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExdXMyNngxa2djMXdhOXdhcXQwNG9hbWJ3czZ4MW42bDY3ZXVkNHd3eCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/zaCojXv2S01zy/giphy.webp"
                alt="no no no"
                width="400px"
              />
            </div>
          </div>
        )}

      {!isEtterlevelseDokumentasjonLoading &&
        etterlevelseDokumentasjon &&
        behandlingsLivslop &&
        (etterlevelseDokumentasjon.hasCurrentUserAccess || user.isAdmin()) && (
          <div className="flex w-full">
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
            >
              {({ submitForm, initialValues, errors }) => (
                <Form>
                  <div className="pr-6 flex flex-1 flex-col gap-4 col-span-8">
                    <BodyShort>
                      “Behandlingens livsløp” beskriver hvor og hvordan personopplysninger flyter
                      når de behandles i deres kontekst. Hensikten med å tegne behandlingens livsløp
                      er at dere blant annet må tenke på:
                    </BodyShort>
                    <List>
                      <List.Item>Hvor opplysningene innhentes fra.</List.Item>
                      <List.Item>Hvor opplysningene flyter underveis i behandling.</List.Item>
                      <List.Item>
                        Om og hvor opplysningene sendes videre i NAV eller til eksterne.
                      </List.Item>
                    </List>
                    <Alert inline variant="info" className="mt-3">
                      Det er kun påkrevd å tegne behandlingens livsløp hvis dere gjennomfører en
                      PVK, men vi anbefaler at alle tegner flyten. Dette vil være til hjelp når dere
                      svarer ut etterlevelseskrav innen Personvern og Arkiv og dokumentasjon.
                    </Alert>

                    <BodyShort className="mt-3">
                      Illustrasjonen under viser hvordan dere kunne tegne behandlingens livsløp.
                    </BodyShort>

                    <img
                      className="mr-2.5"
                      src={behandlingensLivslopImage}
                      alt="Behandligens livsløp tegning"
                      aria-hidden
                      aria-label=""
                    />

                    <ReadMore
                      header="Slik lager dere en god tegning av behandlingens livsløp"
                      className="mt-3"
                    >
                      Du kan bruke verktøy som PowerPoint, Mural, eller Figma til å lage tegningen
                      din som flytdiagram. Vi anbefaler ikke at du bruker Word.
                      <br />
                      <br />
                      Noen tips til hvordan lage gode tegninger:
                      <List>
                        <List.Item>Sørg for at tegningen dekker X, Y, Z</List.Item>
                        <List.Item>
                          Husk god kontrast mellom tekst og bakgrunn. Les mer om kontrast (åpner i
                          en ny fane).
                        </List.Item>
                        <List.Item>Du må ikke forklare alt i selve tegninga.</List.Item>
                        <List.Item>
                          Pass på at tegningens tekst blir lesbar også etter at du lagret fila og
                          før den laster den opp.
                        </List.Item>
                      </List>
                    </ReadMore>

                    <BodyShort className="mt-3">
                      Dere kan velge å lage og laste opp flere tegninger hvis det gir bedre
                      oversikt.
                    </BodyShort>

                    <CustomFileUpload
                      initialValues={initialValues.filer}
                      rejectedFiles={rejectedFiles}
                      setRejectedFiles={setRejectedFiles}
                      setFilesToUpload={setFilesToUpload}
                    />

                    <div className="mt-3">
                      <TextAreaField
                        rows={3}
                        noPlaceholder
                        label="Legg eventuelt inn en beskrivelse av behandlingens livsløp"
                        name="beskrivelse"
                      />
                    </div>

                    {!_.isEmpty(errors) && rejectedFiles.length > 0 && (
                      <ErrorSummary className="mt-3">
                        <ErrorSummary.Item href={'#vedleggMedFeil'}>
                          Vedlegg med feil
                        </ErrorSummary.Item>
                      </ErrorSummary>
                    )}

                    <div className="flex gap-2 mt-5">
                      <Button
                        type="button"
                        onClick={() => {
                          setTilPvkDokument(true)
                          submitForm()
                        }}
                      >
                        Lagre og vurdér behov for PVK
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                          setTilTemaOversikt(true)
                          submitForm()
                        }}
                      >
                        Lagre og gå til Temaoversikt
                      </Button>
                      <Button
                        type="button"
                        variant="tertiary"
                        onClick={() => {
                          navigate('/dokumentasjon/' + etterlevelseDokumentasjon.id)
                        }}
                      >
                        Avbryt
                      </Button>
                    </div>
                  </div>
                </Form>
              )}
            </Formik>

            {/* right side */}
            {etterlevelseDokumentasjon && (
              <div className="pl-6 border-l border-border-divider w-full max-w-lg">
                <Heading level="2" size="small" className="mb-5">
                  Hentet fra deres etterlevelsesdokumentasjon
                </Heading>

                <Label>
                  Dere har koblet følgende behandlinger på denne etterlevelsesdokumentasjonen:
                </Label>
                {etterlevelseDokumentasjon.behandlinger && (
                  <List>
                    {etterlevelseDokumentasjon.behandlinger.map((behandling: IBehandling) => (
                      <List.Item key={behandling.nummer}>
                        <ExternalLink
                          className="text-medium"
                          href={`${env.pollyBaseUrl}process/${behandling.id}`}
                        >
                          {behandlingName(behandling)}
                        </ExternalLink>
                      </List.Item>
                    ))}
                  </List>
                )}

                <Label>ROS-dokumentasjon:</Label>
                <List>
                  {etterlevelseDokumentasjon.risikovurderinger
                    ? etterlevelseDokumentasjon.risikovurderinger.map((ros) => {
                        const rosReg = /\[(.+)]\((.+)\)/i
                        const rosParts = ros.match(rosReg)
                        if (rosParts)
                          return (
                            <List.Item key={ros}>
                              <ExternalLink href={rosParts[2]}>{rosParts[1]}</ExternalLink>
                            </List.Item>
                          )
                        return (
                          <span className="flex" key={ros}>
                            {ros}
                          </span>
                        )
                      })
                    : 'Ikke angitt'}
                </List>

                <BodyShort className="inline-block mb-5">
                  Dere kan redigere hvilke behandinger og risikovurderinger som gjelder i{' '}
                  <Link
                    href={'/dokumentasjon/edit/' + etterlevelseDokumentasjon.id}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="redigere etterlevelsesdokumentasjon"
                  >
                    Dokumentegenskaper (åpner i en ny fane).
                  </Link>
                </BodyShort>

                <Label>Deres beskrivelse av etterlevelsen</Label>

                {etterlevelseDokumentasjon.beskrivelse && (
                  <div className="mt-3">
                    <Markdown source={etterlevelseDokumentasjon.beskrivelse} />
                  </div>
                )}
                {!etterlevelseDokumentasjon.beskrivelse && (
                  <BodyShort className="mt-3">
                    Det er ikke skrevet en beskrivelse på etterlevelsen
                  </BodyShort>
                )}
              </div>
            )}
          </div>
        )}
    </PageLayout>
  )
}

export default BehandlingensLivslopPage
