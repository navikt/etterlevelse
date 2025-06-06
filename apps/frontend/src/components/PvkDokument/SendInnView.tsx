import { FilesIcon } from '@navikt/aksel-icons'
import {
  Alert,
  BodyLong,
  Button,
  CopyButton,
  ErrorSummary,
  Heading,
  Label,
  Link,
  List,
  Loader,
} from '@navikt/ds-react'
import { AxiosError } from 'axios'
import { Form, Formik, validateYupSchema, yupToFormErrors } from 'formik'
import _ from 'lodash'
import { FunctionComponent, RefObject, useEffect, useRef, useState } from 'react'
import { NavigateFunction, useNavigate } from 'react-router-dom'
import {
  getBehandlingensLivslopByEtterlevelseDokumentId,
  mapBehandlingensLivslopToFormValue,
} from '../../api/BehandlingensLivslopApi'
import {
  getPvkDokument,
  mapPvkDokumentToFormValue,
  updatePvkDokument,
} from '../../api/PvkDokumentApi'
import { getRisikoscenarioByPvkDokumentId } from '../../api/RisikoscenarioApi'
import { getTiltakByPvkDokumentId } from '../../api/TiltakApi'
import {
  EEtterlevelseStatus,
  EPvkDokumentStatus,
  ERisikoscenarioType,
  IBehandlingensLivslop,
  IPageResponse,
  IPvkDokument,
  IPvoTilbakemelding,
  IRisikoscenario,
  ITiltak,
  TEtterlevelseDokumentasjonQL,
  TEtterlevelseQL,
} from '../../constants'
import { useKravFilter } from '../../query/KravQuery'
import { user } from '../../services/User'
import DataTextWrapper from '../PvoTilbakemelding/common/DataTextWrapper'
import { TextAreaField } from '../common/Inputs'
import { etterlevelsesDokumentasjonEditUrl } from '../common/RouteLinkEtterlevelsesdokumentasjon'
import { isRisikoUnderarbeidCheck } from '../risikoscenario/common/util'
import AlertPvoUnderarbeidModal from './common/AlertPvoUnderarbeidModal'
import { pvkDokumentStatusToText } from './common/FormSummaryPanel'
import FormButtons from './edit/FormButtons'
import pvkDocumentSchema from './edit/pvkDocumentSchema'
import ArtOgOmFangSummary from './formSummary/ArtOgOmfangSummary'
import BehandlingensLivslopSummary from './formSummary/BehandlingensLivslopSummary'
import InvolveringSummary from './formSummary/InvolveringSummary'
import RisikoscenarioEtterTitak from './formSummary/RisikoscenarioEtterTiltakSummary'
import RisikoscenarioSummary from './formSummary/RisikoscenarioSummary'

type TProps = {
  pvkDokument: IPvkDokument
  setPvkDokument: (state: IPvkDokument) => void
  updateTitleUrlAndStep: (step: number) => void
  personkategorier: string[]
  databehandlere: string[]
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  activeStep: number
  setActiveStep: (step: number) => void
  setSelectedStep: (step: number) => void
  pvoTilbakemelding?: IPvoTilbakemelding
}

export const SendInnView: FunctionComponent<TProps> = ({
  pvkDokument,
  setPvkDokument,
  updateTitleUrlAndStep,
  personkategorier,
  databehandlere,
  etterlevelseDokumentasjon,
  activeStep,
  setActiveStep,
  setSelectedStep,
  pvoTilbakemelding,
}) => {
  const navigate: NavigateFunction = useNavigate()

  const errorSummaryRef: RefObject<HTMLDivElement | null> = useRef<HTMLDivElement>(null)
  const formRef: RefObject<any> = useRef(undefined)

  const [behandlingensLivslop, setBehandlingensLivslop] = useState<IBehandlingensLivslop>()
  const [alleRisikoscenario, setAlleRisikoscenario] = useState<IRisikoscenario[]>([])
  const [alleTiltak, setAlleTitltak] = useState<ITiltak[]>([])
  const [risikoeiereDataError, setRisikoeiereDataError] = useState<boolean>(false)
  const [avdelingError, setAvdelingError] = useState<boolean>(false)
  const [teamsDataError, setTeamsDataError] = useState<boolean>(false)
  const [behandlingensLivslopError, setBehandlingensLivslopError] = useState<boolean>(false)
  const [manglerBehandlingError, setManglerBehandlingError] = useState<boolean>(false)
  const [risikoscenarioError, setRisikoscenarioError] = useState<string>('')
  const [savnerVurderingError, setsavnerVurderingError] = useState<string>('')
  const [tiltakError, setTiltakError] = useState<string>('')
  const [pvkKravError, setPvkKravError] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [submitClick, setSubmitClick] = useState<boolean>(false)
  const [isPvoAlertModalOpen, setIsPvoAlertModalOpen] = useState<boolean>(false)

  const { data: pvkKrav, loading: isPvkKravLoading } = useKravFilter(
    {
      gjeldendeKrav: true,
      tagger: ['Personvernkonsekvensvurdering'],
      etterlevelseDokumentasjonId: etterlevelseDokumentasjon.id,
    },
    { skip: !etterlevelseDokumentasjon },
    true
  )

  if (!isPvkKravLoading) {
    console.debug(pvkKrav)
  }

  const underarbeidCheck: boolean =
    pvkDokument.status === EPvkDokumentStatus.UNDERARBEID ||
    pvkDokument.status === EPvkDokumentStatus.AKTIV

  const isRisikoeierCheck: boolean = etterlevelseDokumentasjon.risikoeiere.includes(user.getIdent())

  const submit = async (submitedValues: IPvkDokument): Promise<void> => {
    if (
      !behandlingensLivslopError &&
      risikoscenarioError === '' &&
      savnerVurderingError === '' &&
      tiltakError === '' &&
      //venter til krav K114 er satt til utgått
      // pvkKravError === '' &&
      !manglerBehandlingError
    ) {
      await getPvkDokument(submitedValues.id).then((response: IPvkDokument) => {
        if ([EPvkDokumentStatus.PVO_UNDERARBEID].includes(response.status)) {
          setIsPvoAlertModalOpen(true)
        } else {
          const updatedPvkDokument: IPvkDokument = {
            ...response,
            status: submitedValues.status,
            sendtTilPvoDato:
              submitedValues.status === EPvkDokumentStatus.SENDT_TIL_PVO
                ? new Date().toISOString()
                : response.sendtTilPvoDato,
            sendtTilPvoAv:
              submitedValues.status === EPvkDokumentStatus.SENDT_TIL_PVO
                ? user.getIdent() + ' - ' + user.getName()
                : response.sendtTilPvoAv,
            merknadTilPvoEllerRisikoeier: submitedValues.merknadTilPvoEllerRisikoeier,
            merknadTilRisikoeier: submitedValues.merknadTilPvoEllerRisikoeier,
            merknadFraRisikoeier: submitedValues.merknadFraRisikoeier,
          }

          updatePvkDokument(updatedPvkDokument).then((savedResponse: IPvkDokument) => {
            setPvkDokument(savedResponse)
          })
        }
      })
    }
  }

  const manglerBehandlingErrorCheck = () => {
    if (etterlevelseDokumentasjon.behandlingIds.length === 0) {
      setManglerBehandlingError(true)
    } else {
      setManglerBehandlingError(false)
    }
  }

  const risikoeiereDataFieldCheck = () => {
    if (etterlevelseDokumentasjon.risikoeiereData?.length === 0) {
      setRisikoeiereDataError(true)
    } else {
      setRisikoeiereDataError(false)
    }
  }

  const avdelingFieldCheck = () => {
    if (!etterlevelseDokumentasjon.avdeling) {
      setAvdelingError(true)
    } else {
      setAvdelingError(false)
    }
  }

  const teamsDataFieldCheck = () => {
    if (etterlevelseDokumentasjon.teamsData === undefined) {
      setTeamsDataError(true)
    } else {
      setTeamsDataError(false)
    }
  }

  const behandlingensLivslopFieldCheck = () => {
    if (behandlingensLivslop?.filer.length === 0 && behandlingensLivslop.beskrivelse === '') {
      setBehandlingensLivslopError(true)
    } else {
      setBehandlingensLivslopError(false)
    }
  }

  const pvkKravCheck = () => {
    if (!isPvkKravLoading) {
      const antallPvkKrav = pvkKrav?.krav.totalElements
      const pvkEtterlevelser: TEtterlevelseQL[] = []

      pvkKrav?.krav.content.forEach((krav) => {
        pvkEtterlevelser.push(...krav.etterlevelser)
      })

      const ferdigPvkEtterlevelser = pvkEtterlevelser.filter(
        (etterlevelse) => etterlevelse.status === EEtterlevelseStatus.FERDIG_DOKUMENTERT
      )

      if (ferdigPvkEtterlevelser.length !== antallPvkKrav) {
        setPvkKravError(
          'Alle krav relatert til personvernkonsekvens vurdering må være ferdig dokumentert'
        )
      } else {
        setPvkKravError('')
      }
    }
  }

  const risikoscenarioCheck = () => {
    if (alleRisikoscenario.length === 0) {
      setRisikoscenarioError('Dere må ha minst 1 risikoscenario.')
    } else {
      const ikkeFerdigBeskrevetScenario = alleRisikoscenario.filter((risiko: IRisikoscenario) =>
        isRisikoUnderarbeidCheck(risiko)
      )

      if (ikkeFerdigBeskrevetScenario.length !== 0) {
        setRisikoscenarioError(
          `${ikkeFerdigBeskrevetScenario.length} risikoscenarioer er ikke ferdig beskrevet.`
        )
      } else {
        setRisikoscenarioError('')
      }
    }
  }

  const tiltakCheck = () => {
    if (alleTiltak.length) {
      const ikkeFerdigBeskrevetTiltak = alleTiltak.filter(
        (tiltak) =>
          tiltak.beskrivelse === '' || tiltak.navn === '' || tiltak.ansvarlig.navIdent === ''
      )
      if (ikkeFerdigBeskrevetTiltak.length !== 0) {
        setTiltakError(`${ikkeFerdigBeskrevetTiltak.length} tiltak er ikke ferdig beskrevet`)
      }
    } else {
      setTiltakError('')
    }
  }

  const savnerVurderingCheck = () => {
    const savnerVurdering = alleRisikoscenario
      .filter((risiko: IRisikoscenario) => !risiko.ingenTiltak)
      .filter(
        (risiko) =>
          risiko.tiltakIds.length === 0 ||
          risiko.konsekvensNivaaEtterTiltak === 0 ||
          risiko.sannsynlighetsNivaa === 0 ||
          risiko.nivaaBegrunnelseEtterTiltak === ''
      )

    if (savnerVurdering.length !== 0) {
      setsavnerVurderingError(
        `${savnerVurdering.length} risikoscenarioer savner en vurdering av tiltakenes effekt.`
      )
    } else {
      setsavnerVurderingError('')
    }
  }

  useEffect(() => {
    ;(async () => {
      if (pvkDokument) {
        setIsLoading(true)
        await getBehandlingensLivslopByEtterlevelseDokumentId(pvkDokument.etterlevelseDokumentId)
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
        await getRisikoscenarioByPvkDokumentId(pvkDokument.id, ERisikoscenarioType.ALL).then(
          (response: IPageResponse<IRisikoscenario>) => setAlleRisikoscenario(response.content)
        )
        await getTiltakByPvkDokumentId(pvkDokument.id).then((response: IPageResponse<ITiltak>) =>
          setAlleTitltak(response.content)
        )
        setIsLoading(false)
      }
    })()
  }, [pvkDokument])

  useEffect(() => {
    if (
      (!_.isEmpty(formRef?.current?.errors) ||
        behandlingensLivslopError ||
        risikoscenarioError !== '' ||
        tiltakError !== '' ||
        savnerVurderingError !== '' ||
        pvkKravError !== '') &&
      errorSummaryRef.current
    ) {
      errorSummaryRef.current.focus()
    }
  }, [submitClick])

  return (
    <div>
      {isPvoAlertModalOpen && (
        <AlertPvoUnderarbeidModal
          isOpen={isPvoAlertModalOpen}
          onClose={() => {
            setIsPvoAlertModalOpen(false)
          }}
          pvkDokumentId={pvkDokument.id}
        />
      )}
      <Formik
        validateOnChange={false}
        validateOnBlur={false}
        onSubmit={submit}
        innerRef={formRef}
        initialValues={mapPvkDokumentToFormValue(pvkDokument as IPvkDokument)}
        validate={(value) => {
          try {
            manglerBehandlingErrorCheck()
            risikoeiereDataFieldCheck()
            avdelingFieldCheck()
            teamsDataFieldCheck()
            behandlingensLivslopFieldCheck()
            pvkKravCheck()
            risikoscenarioCheck()
            if (
              alleRisikoscenario.filter((risiko: IRisikoscenario) => !risiko.ingenTiltak).length !==
              0
            ) {
              tiltakCheck()
              savnerVurderingCheck()
            }
            validateYupSchema(value, pvkDocumentSchema(), true)
          } catch (err) {
            return yupToFormErrors(err)
          } finally {
            setSubmitClick(!submitClick)
          }
        }}
      >
        {({ setFieldValue, submitForm, errors }) => (
          <Form>
            <div className='flex justify-center'>
              <div>
                <Heading level='1' size='medium' className='mb-5'>
                  Les og send inn
                </Heading>
                <BodyLong>
                  Her kan dere lese over det som er lagt inn i PVK-en. Hvis dere oppdager feil eller
                  mangel, er det mulig å gå tilbake og endre svar. Til slutt er det plass til å
                  legge til ytterligere informasjon dersom det er aktuelt.
                </BodyLong>

                {manglerBehandlingError && (
                  <Alert variant='warning' id='behandling-error' className='mt-7 mb-4'>
                    Dere må legge inn minst 1 behandling fra Behandlingskatalogen. Dette kan dere
                    gjøre under{' '}
                    <Link
                      href={`${etterlevelsesDokumentasjonEditUrl(etterlevelseDokumentasjon.id)}#behandling`}
                      target='_blank'
                      rel='noopener noreferrer'
                      aria-label='redigere etterlevelsesdokumentasjon'
                    >
                      Redigér dokumentegenskaper.
                    </Link>
                  </Alert>
                )}

                <BehandlingensLivslopSummary
                  behandlingensLivslop={behandlingensLivslop}
                  behandlingensLivslopError={behandlingensLivslopError}
                  updateTitleUrlAndStep={updateTitleUrlAndStep}
                />

                <ArtOgOmFangSummary
                  personkategorier={personkategorier}
                  updateTitleUrlAndStep={updateTitleUrlAndStep}
                />

                <InvolveringSummary
                  databehandlere={databehandlere}
                  personkategorier={personkategorier}
                  updateTitleUrlAndStep={updateTitleUrlAndStep}
                />

                <RisikoscenarioSummary
                  alleRisikoscenario={alleRisikoscenario}
                  alleTiltak={alleTiltak}
                  risikoscenarioError={risikoscenarioError}
                  tiltakError={tiltakError}
                />

                <RisikoscenarioEtterTitak
                  alleRisikoscenario={alleRisikoscenario}
                  savnerVurderingError={savnerVurderingError}
                />

                {underarbeidCheck && (
                  <div className='mt-5 mb-3'>
                    <TextAreaField
                      rows={3}
                      noPlaceholder
                      label='Er det noe annet dere ønsker å formidle til Personvernombudet? (valgfritt)'
                      name='merknadTilPvoEllerRisikoeier'
                    />
                  </div>
                )}

                {pvkDokument.status !== EPvkDokumentStatus.UNDERARBEID && (
                  <div>
                    <div className='mt-5 mb-3 max-w-[75ch]'>
                      <Label>Beskjed til personvernombudet</Label>
                      <DataTextWrapper>
                        {pvkDokument.merknadTilPvoEllerRisikoeier
                          ? pvkDokument.merknadTilPvoEllerRisikoeier
                          : 'Ingen beskjed'}
                      </DataTextWrapper>
                    </div>
                    {pvoTilbakemelding && (
                      <div className='pt-9 mb-3 max-w-[75ch]'>
                        <Heading level='2' size='small' className='mb-5'>
                          Tilbakemelding til etterlever
                        </Heading>
                        <div className='mb-3'>
                          <Label>Anbefales det at arbeidet går videre som planlagt?</Label>
                          <DataTextWrapper>
                            {pvoTilbakemelding.arbeidGarVidere === null
                              ? null
                              : pvoTilbakemelding.arbeidGarVidere === true
                                ? 'Ja'
                                : 'Nei'}
                          </DataTextWrapper>
                        </div>

                        <div className='mb-3'>
                          <Label>Er det behov for forhåndskonsultasjon med Datatilsynet?</Label>
                          <DataTextWrapper>
                            {pvoTilbakemelding.behovForForhandskonsultasjon === null
                              ? null
                              : pvoTilbakemelding.behovForForhandskonsultasjon === true
                                ? 'Ja'
                                : 'Nei'}
                          </DataTextWrapper>
                        </div>

                        <Label>Beskjed til etterlever</Label>
                        <DataTextWrapper>
                          {pvoTilbakemelding.merknadTilEtterleverEllerRisikoeier
                            ? pvoTilbakemelding.merknadTilEtterleverEllerRisikoeier
                            : 'Ingen beskjed'}
                        </DataTextWrapper>
                      </div>
                    )}
                  </div>
                )}

                {pvkDokument.status === EPvkDokumentStatus.VURDERT_AV_PVO && (
                  <div className='pt-9 mb-3 max-w-[75ch]'>
                    <Heading level='2' size='small' className='mb-5'>
                      Nå er det din tur, etterlever
                    </Heading>

                    <div className='mb-3 mt-5'>
                      <Alert variant='info'>
                        <Heading size='xsmall' level='3'>
                          Dette gjør dere nå
                        </Heading>
                        <List as='ul'>
                          <List.Item>
                            Gjør eventuelle endringer basert på PVOs tilbakemelding
                          </List.Item>
                          <List.Item>
                            Oppsummér for risikoeieren hvordan dere har tatt stilling til PVOs
                            tilbakemelding, og hvilke endringer som er gjort.
                          </List.Item>
                          <List.Item>
                            Risikoeieren skal så vurdere om restrisiko kan aksepteres, og godkjenner
                            og arkiverer PVK.
                          </List.Item>
                        </List>
                      </Alert>
                    </div>

                    <TextAreaField
                      rows={3}
                      noPlaceholder
                      label='Oppsummér'
                      name='merknadTilRisikoeier'
                    />
                  </div>
                )}

                {pvkDokument.status === EPvkDokumentStatus.TRENGER_GODKJENNING && (
                  <div className='mt-5 mb-3 max-w-[75ch]'>
                    <Label>Etterleverens kommmentarer til risikoeier</Label>
                    <DataTextWrapper>
                      {pvkDokument.merknadTilRisikoeier
                        ? pvkDokument.merknadTilRisikoeier
                        : 'Ingen beskjed'}
                    </DataTextWrapper>
                  </div>
                )}

                {pvkDokument.status === EPvkDokumentStatus.TRENGER_GODKJENNING && (
                  <div className='mt-5 mb-3 max-w-[75ch]'>
                    <TextAreaField
                      rows={3}
                      noPlaceholder
                      label='Kommentar til etterlever? (valgfritt)'
                      name='merknadFraRisikoeier'
                    />
                  </div>
                )}

                {pvkDokument.status === EPvkDokumentStatus.GODKJENT_AV_RISIKOEIER && (
                  <div className='mt-5 mb-3 max-w-[75ch]'>
                    <Label>Risikoeierens kommmentarer</Label>
                    <DataTextWrapper>
                      {pvkDokument.merknadFraRisikoeier
                        ? pvkDokument.merknadFraRisikoeier
                        : 'Ingen beskjed'}
                    </DataTextWrapper>
                  </div>
                )}

                <CopyButton
                  variant='action'
                  copyText={window.location.href}
                  text='Kopiér lenken til denne siden'
                  activeText='Lenken er kopiert'
                  icon={<FilesIcon aria-hidden />}
                />

                <Alert variant='info' className='my-5'>
                  Status: {pvkDokumentStatusToText(pvkDokument.status)}
                </Alert>

                {pvkDokument.status === EPvkDokumentStatus.UNDERARBEID &&
                  pvkDokument.sendtTilPvoDato !== null && (
                    <Alert variant='info' className='my-5'>
                      Innsending trukket <br />
                      Etter at dere blir ferdig med endringer, må dere sende inn på nytt. PVK-en
                      blir deretter behandlet som en ny innsending
                    </Alert>
                  )}

                {pvkDokument.status === EPvkDokumentStatus.SENDT_TIL_PVO && (
                  <Alert variant='info' className='my-5'>
                    Ved å trekke innsending til personvernombudet vil PVK dokumentet miste plassen i
                    sakskøen
                  </Alert>
                )}

                {(!_.isEmpty(errors) ||
                  // pvkKravError !== '' ||
                  risikoeiereDataError ||
                  avdelingError ||
                  teamsDataError ||
                  behandlingensLivslopError ||
                  risikoscenarioError !== '' ||
                  tiltakError !== '' ||
                  savnerVurderingError !== '') && (
                  <ErrorSummary
                    ref={errorSummaryRef}
                    heading='Du må rette disse feilene før du kan fortsette'
                  >
                    {manglerBehandlingError && (
                      <ErrorSummary.Item href='#behandling-error' className='max-w-[75ch]'>
                        Dere må koble minst 1 behandling til denne etterlevelsesdokumentasjonen.
                      </ErrorSummary.Item>
                    )}

                    {/* {pvkKravError !== '' && (
                      <ErrorSummary.Item
                        href={etterlevelseDokumentasjonPvkTabUrl(etterlevelseDokumentasjon.id)}
                        className='max-w-[75ch]'
                      >
                        {pvkKravError}
                      </ErrorSummary.Item>
                    )} */}

                    {behandlingensLivslopError && (
                      <ErrorSummary.Item href='#behandlingensLivslop' className='max-w-[75ch]'>
                        Behandlingens livsløp må ha minimum 1 opplastet tegning, eller en skriftlig
                        beskrivelse.
                      </ErrorSummary.Item>
                    )}

                    {Object.entries(errors)
                      .filter(([, error]) => error)
                      .map(([key, error]) => (
                        <ErrorSummary.Item href={`#${key}`} key={key} className='max-w-[75ch]'>
                          {error as string}
                        </ErrorSummary.Item>
                      ))}
                    {risikoscenarioError !== '' && (
                      <ErrorSummary.Item href='#risikoscenarioer' className='max-w-[75ch]'>
                        {risikoscenarioError}
                      </ErrorSummary.Item>
                    )}
                    {tiltakError !== '' && (
                      <ErrorSummary.Item href='#tiltak' className='max-w-[75ch]'>
                        {tiltakError}
                      </ErrorSummary.Item>
                    )}
                    {savnerVurderingError !== '' && (
                      <ErrorSummary.Item href='#effektEtterTiltak' className='max-w-[75ch]'>
                        {savnerVurderingError}
                      </ErrorSummary.Item>
                    )}

                    {risikoeiereDataError && (
                      <ErrorSummary.Item
                        onClick={() => {
                          navigate(
                            `${etterlevelsesDokumentasjonEditUrl(etterlevelseDokumentasjon.id)}#risikoeiereData`
                          )
                        }}
                        className='max-w-[75ch]'
                      >
                        Legg til risikoeier (Redigér dokumentegenskaper)
                      </ErrorSummary.Item>
                    )}

                    {avdelingError && (
                      <ErrorSummary.Item
                        onClick={() => {
                          navigate(
                            `${etterlevelsesDokumentasjonEditUrl(etterlevelseDokumentasjon.id)}#avdeling`
                          )
                        }}
                        className='max-w-[75ch]'
                      >
                        Legg til avdeling (Redigér dokumentegenskaper)
                      </ErrorSummary.Item>
                    )}

                    {teamsDataError && (
                      <ErrorSummary.Item
                        onClick={() => {
                          navigate(
                            `${etterlevelsesDokumentasjonEditUrl(etterlevelseDokumentasjon.id)}#teamsData`
                          )
                        }}
                        className='max-w-[75ch]'
                      >
                        Legg til team eller personer (Redigér dokumentegenskaper)
                      </ErrorSummary.Item>
                    )}
                  </ErrorSummary>
                )}

                {isLoading && (
                  <div className='flex justify-center items-center w-full'>
                    <Loader size='2xlarge' title='lagrer endringer' />
                  </div>
                )}

                {!isLoading && (
                  <FormButtons
                    etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
                    activeStep={activeStep}
                    setActiveStep={setActiveStep}
                    setSelectedStep={setSelectedStep}
                    submitForm={submitForm}
                    customButtons={
                      <div className='mt-5 flex gap-2 items-center'>
                        {[
                          EPvkDokumentStatus.SENDT_TIL_PVO,
                          EPvkDokumentStatus.PVO_UNDERARBEID,
                        ].includes(pvkDokument.status) && <div className='min-w-[446px]' />}

                        {![
                          EPvkDokumentStatus.SENDT_TIL_PVO,
                          EPvkDokumentStatus.PVO_UNDERARBEID,
                        ].includes(pvkDokument.status) && (
                          <Button
                            type='button'
                            variant='secondary'
                            onClick={async () => {
                              await submitForm()
                            }}
                          >
                            Lagre og fortsett senere
                          </Button>
                        )}

                        {underarbeidCheck && (
                          <Button
                            type='button'
                            onClick={async () => {
                              await setFieldValue('status', EPvkDokumentStatus.SENDT_TIL_PVO)
                              errorSummaryRef.current?.focus()
                              await submitForm()
                            }}
                          >
                            Send til Personvernombudet
                          </Button>
                        )}

                        {pvkDokument.status === EPvkDokumentStatus.SENDT_TIL_PVO && (
                          <Button
                            type='button'
                            onClick={async () => {
                              await setFieldValue('status', EPvkDokumentStatus.UNDERARBEID)
                              await submitForm()
                            }}
                          >
                            Trekk innsending til personvernombudet
                          </Button>
                        )}

                        {(pvkDokument.status === EPvkDokumentStatus.GODKJENT_AV_RISIKOEIER ||
                          pvkDokument.status === EPvkDokumentStatus.TRENGER_GODKJENNING) && (
                          <Button
                            type='button'
                            onClick={async () => {
                              if (
                                pvkDokument.status === EPvkDokumentStatus.GODKJENT_AV_RISIKOEIER
                              ) {
                                await setFieldValue(
                                  'status',
                                  EPvkDokumentStatus.TRENGER_GODKJENNING
                                )
                              } else {
                                await setFieldValue('status', EPvkDokumentStatus.VURDERT_AV_PVO)
                              }
                              await submitForm()
                            }}
                          >
                            {pvkDokument.status === EPvkDokumentStatus.GODKJENT_AV_RISIKOEIER
                              ? 'Angre godkjenning'
                              : 'Angre sending til risikoeier'}
                          </Button>
                        )}

                        {pvkDokument.status === EPvkDokumentStatus.VURDERT_AV_PVO && (
                          <Button
                            type='button'
                            onClick={async () => {
                              await setFieldValue('status', EPvkDokumentStatus.TRENGER_GODKJENNING)
                              await submitForm()
                            }}
                          >
                            Send til godkjenning av risikoeier
                          </Button>
                        )}

                        {isRisikoeierCheck &&
                          pvkDokument.status === EPvkDokumentStatus.TRENGER_GODKJENNING && (
                            <Button
                              type='button'
                              onClick={async () => {
                                await setFieldValue(
                                  'status',
                                  EPvkDokumentStatus.GODKJENT_AV_RISIKOEIER
                                )
                                await submitForm()
                              }}
                            >
                              Akseptér restrisiko
                            </Button>
                          )}
                      </div>
                    }
                  />
                )}
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  )
}

export default SendInnView
