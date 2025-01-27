import { CheckmarkCircleFillIcon, EnvelopeClosedIcon } from '@navikt/aksel-icons'
import {
  Alert,
  BodyLong,
  BodyShort,
  Button,
  Checkbox,
  CheckboxGroup,
  CopyButton,
  Heading,
  Label,
  Link,
  List,
  Loader,
  Radio,
  RadioGroup,
  ReadMore,
} from '@navikt/ds-react'
import { Field, FieldArray, FieldArrayRenderProps, FieldProps, Form, Formik } from 'formik'
import { uniqBy } from 'lodash'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { behandlingName } from '../api/BehandlingApi'
import { useEtterlevelseDokumentasjon } from '../api/EtterlevelseDokumentasjonApi'
import {
  createPvkDokument,
  getPvkDokumentByEtterlevelseDokumentId,
  mapPvkDokumentToFormValue,
  updatePvkDokument,
  usePvkDokument,
} from '../api/PvkDokumentApi'
import pvkBehovSchema from '../components/PvkDokument/edit/pvkBehovSchema'
import { FieldWrapper, TextAreaField } from '../components/common/Inputs'
import { ExternalLink } from '../components/common/RouteLink'
import { PageLayout } from '../components/scaffold/Page'
import { IBehandling, IBreadCrumbPath, IExternalCode, IPolicy, IPvkDokument } from '../constants'
import { CodelistService, EListName, ICode } from '../services/Codelist'
import { user } from '../services/User'
import { env } from '../util/env'
import { dokumentasjonerBreadCrumbPath } from './util/BreadCrumbPath'

export const PvkBehovPage = () => {
  const params: Readonly<
    Partial<{
      id?: string
      pvkdokumentId?: string
    }>
  > = useParams<{ id?: string; pvkdokumentId?: string }>()
  const [etterlevelseDokumentasjon, , isEtterlevelseDokumentasjonLoading] =
    useEtterlevelseDokumentasjon(params.id)
  const [pvkdokument, setPvkDokument] = usePvkDokument(params.pvkdokumentId)
  const [codelistUtils] = CodelistService()
  const [profilering, setProfilering] = useState<boolean>(false)
  const [automatiskBehandling, setAutomatiskBehandling] = useState<boolean>(false)
  const [saerligKategorier, setSaerligKategorier] = useState<boolean>(false)
  const [checkedYttligereEgenskaper, setCheckedYttligereEgenskaper] = useState<string[]>([])
  const [tilTemaOversikt, setTilTemaOversikt] = useState<boolean>(false)
  const [tilPvkDokument, setTilPvkDokument] = useState<boolean>(false)
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

  const ytterligereEgenskaper: ICode[] = codelistUtils.getCodes(
    EListName.YTTERLIGERE_EGENSKAPER
  ) as ICode[]

  useEffect(() => {
    if (etterlevelseDokumentasjon && etterlevelseDokumentasjon.behandlinger) {
      const alleOpplysningstyper: IPolicy[] = []
      etterlevelseDokumentasjon.behandlinger.forEach((behandling) => {
        alleOpplysningstyper.push(...behandling.policies)

        if (behandling.profilering) {
          setProfilering(true)
        }
        if (behandling.automatiskBehandling) {
          setAutomatiskBehandling(true)
        }
      })

      const saerligKategorierOppsumert: IExternalCode[] = uniqBy(
        alleOpplysningstyper.flatMap((opplysningstyper) => opplysningstyper.sensitivity),
        'code'
      ).filter((kategori) => kategori.code === 'SAERLIGE')

      if (saerligKategorierOppsumert.length > 0) {
        setSaerligKategorier(true)
      }
    }
  }, [etterlevelseDokumentasjon])

  useEffect(() => {
    if (pvkdokument && pvkdokument.ytterligereEgenskaper.length > 0) {
      setCheckedYttligereEgenskaper(
        pvkdokument.ytterligereEgenskaper.map((egenskap) => egenskap.code)
      )
    }
  }, [pvkdokument])

  const submit = async (pvkDokument: IPvkDokument) => {
    if (etterlevelseDokumentasjon) {
      const mutatedPvkDokument = {
        ...pvkDokument,
        etterlevelseDokumentId: etterlevelseDokumentasjon.id,
      } as IPvkDokument

      //double check if etterlevelse already exist before submitting
      let existingPvkDokumentId = ''
      if (etterlevelseDokumentasjon) {
        const pvkDokument = await getPvkDokumentByEtterlevelseDokumentId(
          etterlevelseDokumentasjon.id
        ).catch(() => undefined)
        if (pvkDokument) {
          existingPvkDokumentId = pvkDokument.id
          mutatedPvkDokument.id = pvkDokument.id
        }
      }

      if (pvkDokument.id || existingPvkDokumentId) {
        await updatePvkDokument(mutatedPvkDokument).then((response) => {
          if (tilTemaOversikt) {
            navigate('/dokumentasjon/' + response.etterlevelseDokumentId)
          } else if (tilPvkDokument) {
            navigate(
              '/dokumentasjon/' +
                response.etterlevelseDokumentId +
                '/pvkdokument/' +
                response.id +
                '/1'
            )
          } else {
            setPvkDokument(response)
          }
        })
      } else {
        await createPvkDokument(mutatedPvkDokument).then((response) => {
          if (tilTemaOversikt) {
            navigate('/dokumentasjon/' + response.etterlevelseDokumentId)
          } else if (tilPvkDokument) {
            navigate(
              '/dokumentasjon/' +
                response.etterlevelseDokumentId +
                '/pvkdokument/' +
                response.id +
                '/1'
            )
          } else {
            setPvkDokument(response)
          }
        })
      }
    }
  }

  return (
    <PageLayout
      pageTitle="Bør vi gjøre en Personvernkonsekvensvurdering (PVK) ?"
      currentPage="Bør vi gjøre en Personvernkonsekvensvurdering (PVK) ?"
      breadcrumbPaths={breadcrumbPaths}
    >
      <Heading level="1" size="medium" className="mb-5">
        Bør vi gjøre en Personvernkonsekvensvurdering (PVK) ?
      </Heading>
      {isEtterlevelseDokumentasjonLoading && (
        <div className="flex w-full justify-center">
          <Loader size="large" />
        </div>
      )}
      {!isEtterlevelseDokumentasjonLoading &&
        etterlevelseDokumentasjon &&
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
        pvkdokument &&
        (etterlevelseDokumentasjon.hasCurrentUserAccess || user.isAdmin()) && (
          <div className="flex w-full">
            <div className="pr-4 flex flex-1 flex-col gap-4 col-span-8">
              <BodyLong>
                En PVK skal gjennomføres når vi ønsker å starte eller endre en behandling av
                personopplysninger som sannsynligvis vil medføre høy risiko for den registrertes
                rettigheter og friheter.
              </BodyLong>

              <Formik
                validateOnChange={false}
                validateOnBlur={false}
                validationSchema={pvkBehovSchema}
                onSubmit={submit}
                initialValues={mapPvkDokumentToFormValue(pvkdokument as IPvkDokument)}
              >
                {({ values, submitForm }) => (
                  <Form>
                    <div className="mt-3" id="ytterlige-egenskaper">
                      <FieldArray name="ytterligereEgenskaper">
                        {(fieldArrayRenderProps: FieldArrayRenderProps) => (
                          <CheckboxGroup
                            legend="Les igjennom og velg ytterligere egenskaper som gjelder for behandlingene deres."
                            value={checkedYttligereEgenskaper}
                            onChange={(selected: string[]) => {
                              setCheckedYttligereEgenskaper(selected)

                              fieldArrayRenderProps.form.setFieldValue(
                                'ytterligereEgenskaper',
                                selected.map((egenskapId: string) =>
                                  codelistUtils.getCode(
                                    EListName.YTTERLIGERE_EGENSKAPER,
                                    egenskapId
                                  )
                                )
                              )
                            }}
                          >
                            <List>
                              {profilering && (
                                <List.Item icon={<CheckmarkCircleFillIcon title="checked" />}>
                                  Profilering (hentet fra Behandlingskatalogen)
                                </List.Item>
                              )}
                              {automatiskBehandling && (
                                <List.Item icon={<CheckmarkCircleFillIcon title="checked" />}>
                                  automatisert behandling (hentet fra Behandlingskatalogen)
                                </List.Item>
                              )}
                              {saerligKategorier && (
                                <List.Item icon={<CheckmarkCircleFillIcon title="checked" />}>
                                  særlige kategorier av personopplysninger (hentet fra
                                  Behandlingskatalogen)
                                </List.Item>
                              )}
                            </List>
                            {ytterligereEgenskaper.map((egenskap) => (
                              <Checkbox key={egenskap.code} value={egenskap.code}>
                                {egenskap.shortName}
                              </Checkbox>
                            ))}
                          </CheckboxGroup>
                        )}
                      </FieldArray>
                      {etterlevelseDokumentasjon && (
                        <BodyShort className="mt-5">
                          Disse egenskapene blir enklere å vurdere hvis{' '}
                          <Link
                            href={
                              '/dokumentasjon/' +
                              etterlevelseDokumentasjon.id +
                              '/behandlingens-livslop'
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="redigere etterlevelsesdokumentasjon"
                          >
                            dere har tegnet behandlingens livsløp (åpnes i nytt vindu).
                          </Link>
                        </BodyShort>
                      )}
                    </div>

                    {(checkedYttligereEgenskaper.length > 0 ||
                      profilering ||
                      automatiskBehandling ||
                      saerligKategorier) && (
                      <Alert className="mb-5 mt-10" variant="info">
                        Data som hentes og svarene dere har oppgitt gir en indikasjon på at det kan
                        være behov for gjennomføring av PVK. Likevel er dere ansvarlige for å
                        vurdere behov.
                      </Alert>
                    )}

                    <ReadMore
                      className="mt-10"
                      header="Lurer dere fortsatt på om det er behov for PVK?"
                    >
                      Personvernombudet (PVO) kan hjelpe dere å vurdere om dere skal gjøre en PVK.
                      Ta kontakt via mail.
                      <CopyButton
                        className="mt-3 border-2 border-solid"
                        variant="action"
                        copyText="pvk@nav.no"
                        text="Kopiér PVO sin e-postadresse"
                        activeText="E-postadressen er kopiert"
                        icon={<EnvelopeClosedIcon aria-hidden />}
                      />
                    </ReadMore>

                    <FieldWrapper marginBottom marginTop>
                      <Field name="skalUtforePvk">
                        {(fieldProps: FieldProps) => (
                          <RadioGroup
                            legend="Hvilken vurdering har dere kommet fram til?"
                            value={fieldProps.field.value}
                            onChange={(value) => {
                              fieldProps.form.setFieldValue('skalUtforePvk', value)
                            }}
                          >
                            <Radio value={true}>Vi skal gjennomføre en PVK</Radio>
                            <Radio value={false}>Vi skal ikke gjennomføre PVK</Radio>
                          </RadioGroup>
                        )}
                      </Field>
                    </FieldWrapper>

                    {values.skalUtforePvk !== undefined && !values.skalUtforePvk && (
                      <TextAreaField
                        rows={5}
                        noPlaceholder
                        label="Begrunn vurderingen deres"
                        name="pvkVurderingsBegrunnelse"
                      />
                    )}

                    <div className="flex items-center mt-5 gap-2">
                      {values.skalUtforePvk && (
                        <Button
                          type="button"
                          variant="primary"
                          onClick={() => {
                            setTilPvkDokument(true)
                            submitForm()
                          }}
                        >
                          Lagre og gå til PVK
                        </Button>
                      )}

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
                  </Form>
                )}
              </Formik>
            </div>

            {etterlevelseDokumentasjon && (
              <div className="pl-4 border-l border-border-divider w-full max-w-md">
                <Heading level="2" size="small" className="mb-5">
                  Hentet fra deres etterlevelsesdokumentasjon
                </Heading>

                <Label>
                  Dere har koblet følgende behandlinger på denne etterlevelsesdokumentasjonen:
                </Label>
                {etterlevelseDokumentasjon.behandlinger && (
                  <BodyLong>
                    <List>
                      {etterlevelseDokumentasjon.behandlinger.map((behandling: IBehandling) => (
                        <List.Item key={behandling.nummer}>
                          <ExternalLink href={`${env.pollyBaseUrl}process/${behandling.id}`}>
                            {behandlingName(behandling)} (åpnes i nytt vindu)
                          </ExternalLink>
                        </List.Item>
                      ))}
                    </List>
                  </BodyLong>
                )}

                <div className="mb-2.5">
                  <Label>ROS-dokumentasjon:</Label>
                  <BodyShort>
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
                  </BodyShort>
                </div>

                <BodyShort className="inline-block">
                  Dere kan redigere hvilke behandinger og risikovurderinger som gjelder i{' '}
                  <Link
                    href={'/dokumentasjon/edit/' + etterlevelseDokumentasjon.id}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="redigere etterlevelsesdokumentasjon"
                  >
                    Dokumentegenskaper (åpnes i nytt vindu).
                  </Link>
                </BodyShort>
              </div>
            )}
          </div>
        )}
    </PageLayout>
  )
}

export default PvkBehovPage
