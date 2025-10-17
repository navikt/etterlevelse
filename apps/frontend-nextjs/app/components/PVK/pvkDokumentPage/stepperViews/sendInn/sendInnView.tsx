'use client'

import {
  getBehandlingensLivslopByEtterlevelseDokumentId,
  mapBehandlingensLivslopToFormValue,
} from '@/api/behandlingensLivslop/behandlingensLivslopApi'
import {
  getPvkDokument,
  mapPvkDokumentToFormValue,
  updatePvkDokument,
} from '@/api/pvkDokument/pvkDokumentApi'
import { getRisikoscenarioByPvkDokumentId } from '@/api/risikoscenario/risikoscenarioApi'
import { getTiltakByPvkDokumentId } from '@/api/tiltak/tiltakApi'
import InfoChangesMadeAfterApproval from '@/components/PVK/common/infoChangesMadeAfterApproval'
import FormButtons from '@/components/PVK/edit/formButtons'
import pvkDocumentSchema from '@/components/PVK/form/pvkDocumentSchema'
import AlertPvoUnderarbeidModal from '@/components/pvoTilbakemelding/alertPvoUnderarbeidModal'
import { IPageResponse } from '@/constants/commonConstants'
import { IBehandlingensLivslop } from '@/constants/etterlevelseDokumentasjon/behandlingensLivslop/behandlingensLivslopConstants'
import {
  EEtterlevelseStatus,
  TEtterlevelseQL,
} from '@/constants/etterlevelseDokumentasjon/etterlevelse/etterlevelseConstants'
import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import {
  EPvkDokumentStatus,
  IPvkDokument,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import {
  ERisikoscenarioType,
  IRisikoscenario,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import { ITiltak } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/tiltak/tiltakConstants'
import { EListName, ICode } from '@/constants/kodeverk/kodeverkConstants'
import { TKravQL } from '@/constants/krav/kravConstants'
import { IPvoTilbakemelding } from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { ICodelistProps } from '@/provider/kodeverk/kodeverkProvider'
import { UserContext } from '@/provider/user/userProvider'
import { pvkDokumentStatusToText } from '@/util/etterlevelseDokumentasjon/pvkDokument/pvkDokumentUtils'
import { isRisikoUnderarbeidCheck } from '@/util/risikoscenario/risikoscenarioUtils'
import { FilesIcon } from '@navikt/aksel-icons'
import { Alert, BodyLong, CopyButton, Heading } from '@navikt/ds-react'
import { AxiosError } from 'axios'
import { Form, Formik, validateYupSchema, yupToFormErrors } from 'formik'
import _ from 'lodash'
import { FunctionComponent, RefObject, useContext, useEffect, useRef, useState } from 'react'
import BehandlingensLivslopSummary from '../../formSummary/behandlingensLivslopSummary'
import ArtOgOmFangSummary from '../../formSummary/artOgOmFangSummary'
import TilhorendeDokumentasjonSummary from '../../formSummary/tilhorendeDokumentasjonSummary'

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
  codelistUtils: ICodelistProps
  pvkKrav:
    | {
        krav: IPageResponse<TKravQL>
      }
    | undefined
  isPvkKravLoading: boolean
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
  codelistUtils,
  pvkKrav,
  isPvkKravLoading,
  pvoTilbakemelding,
}) => {
  const errorSummaryRef: RefObject<HTMLDivElement | null> = useRef<HTMLDivElement>(null)
  const formRef: RefObject<any> = useRef(undefined)

  const [behandlingensLivslop, setBehandlingensLivslop] = useState<IBehandlingensLivslop>()
  const [alleRisikoscenario, setAlleRisikoscenario] = useState<IRisikoscenario[]>([])
  const [alleTiltak, setAlleTitltak] = useState<ITiltak[]>([])
  const [risikoeiereDataError, setRisikoeiereDataError] = useState<boolean>(false)
  const [avdelingError, setAvdelingError] = useState<boolean>(false)
  const [medlemError, setMedlemError] = useState<boolean>(false)
  const [behandlingensLivslopError, setBehandlingensLivslopError] = useState<boolean>(false)
  const [manglerBehandlingError, setManglerBehandlingError] = useState<boolean>(false)
  const [risikoscenarioError, setRisikoscenarioError] = useState<string>('')
  const [savnerVurderingError, setsavnerVurderingError] = useState<string>('')
  const [tiltakError, setTiltakError] = useState<string>('')
  const [pvkKravError, setPvkKravError] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [submitClick, setSubmitClick] = useState<boolean>(false)
  const [isPvoAlertModalOpen, setIsPvoAlertModalOpen] = useState<boolean>(false)
  const [pvoVurderingList, setPvoVurderingList] = useState<ICode[]>([])
  const [angretAvRisikoeier, setAngretAvRisikoeier] = useState<boolean>(false)
  const user = useContext(UserContext)

  const underarbeidCheck: boolean =
    pvkDokument.status === EPvkDokumentStatus.UNDERARBEID ||
    pvkDokument.status === EPvkDokumentStatus.AKTIV

  const submit = async (submitedValues: IPvkDokument): Promise<void> => {
    if (
      !behandlingensLivslopError &&
      risikoscenarioError === '' &&
      savnerVurderingError === '' &&
      tiltakError === '' &&
      !medlemError &&
      !avdelingError &&
      !risikoeiereDataError &&
      pvkKravError === '' &&
      !manglerBehandlingError
    ) {
      await getPvkDokument(submitedValues.id).then((response: IPvkDokument) => {
        if ([EPvkDokumentStatus.PVO_UNDERARBEID].includes(response.status)) {
          setIsPvoAlertModalOpen(true)
        } else {
          const updatedPvkDokument: IPvkDokument = {
            ...response,
            status:
              response.status === EPvkDokumentStatus.GODKJENT_AV_RISIKOEIER && !angretAvRisikoeier
                ? response.status
                : submitedValues.status,
            sendtTilPvoDato: [
              EPvkDokumentStatus.SENDT_TIL_PVO,
              EPvkDokumentStatus.SENDT_TIL_PVO_FOR_REVURDERING,
            ].includes(submitedValues.status)
              ? new Date().toISOString()
              : response.sendtTilPvoDato,
            sendtTilPvoAv: [
              EPvkDokumentStatus.SENDT_TIL_PVO,
              EPvkDokumentStatus.SENDT_TIL_PVO_FOR_REVURDERING,
            ].includes(submitedValues.status)
              ? user.getIdent() + ' - ' + user.getName()
              : response.sendtTilPvoAv,
            merknadTilPvoEllerRisikoeier: submitedValues.merknadTilPvoEllerRisikoeier,
            merknadTilRisikoeier: submitedValues.merknadTilRisikoeier,
            merknadFraRisikoeier: submitedValues.merknadFraRisikoeier,
            godkjentAvRisikoeier: [EPvkDokumentStatus.GODKJENT_AV_RISIKOEIER].includes(
              submitedValues.status
            )
              ? submitedValues.godkjentAvRisikoeier
              : response.godkjentAvRisikoeier,
            godkjentAvRisikoeierDato: [EPvkDokumentStatus.GODKJENT_AV_RISIKOEIER].includes(
              submitedValues.status
            )
              ? submitedValues.godkjentAvRisikoeierDato
              : response.godkjentAvRisikoeierDato,
          }

          updatePvkDokument(updatedPvkDokument).then((savedResponse: IPvkDokument) => {
            setPvkDokument(savedResponse)
            setAngretAvRisikoeier(false)
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
    if (!etterlevelseDokumentasjon.nomAvdelingId) {
      setAvdelingError(true)
    } else {
      setAvdelingError(false)
    }
  }

  const medlemErrorCheck = () => {
    console.debug(etterlevelseDokumentasjon.teamsData)
    if (
      (etterlevelseDokumentasjon.teamsData === undefined ||
        etterlevelseDokumentasjon.teamsData?.length === 0) &&
      (etterlevelseDokumentasjon.resourcesData === undefined ||
        etterlevelseDokumentasjon.resourcesData?.length === 0)
    ) {
      setMedlemError(true)
    } else {
      setMedlemError(false)
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
          tiltak.beskrivelse === '' ||
          tiltak.navn === '' ||
          (tiltak.ansvarlig.navIdent === '' && tiltak.ansvarligTeam.name === '')
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

        setPvoVurderingList(
          codelistUtils
            .getCodes(EListName.PVO_VURDERING)
            .sort((a, b) => a.shortName.localeCompare(b.shortName)) as ICode[]
        )
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
            if (
              [
                EPvkDokumentStatus.SENDT_TIL_PVO,
                EPvkDokumentStatus.SENDT_TIL_PVO_FOR_REVURDERING,
                EPvkDokumentStatus.TRENGER_GODKJENNING,
              ].includes(value.status)
            ) {
              manglerBehandlingErrorCheck()
              risikoeiereDataFieldCheck()
              avdelingFieldCheck()
              medlemErrorCheck()
              behandlingensLivslopFieldCheck()
              pvkKravCheck()
              risikoscenarioCheck()
              if (
                alleRisikoscenario.filter((risiko: IRisikoscenario) => !risiko.ingenTiltak)
                  .length !== 0
              ) {
                tiltakCheck()
                savnerVurderingCheck()
              }
            }

            validateYupSchema(value, pvkDocumentSchema(), true)
          } catch (err) {
            return yupToFormErrors(err)
          } finally {
            setSubmitClick(!submitClick)
          }
        }}
      >
        {({ setFieldValue, submitForm, errors, initialValues }) => (
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
                <CopyButton
                  variant='action'
                  copyText={window.location.href}
                  text='Kopiér lenken til denne siden'
                  activeText='Lenken er kopiert'
                  icon={<FilesIcon aria-hidden />}
                />
                {pvkDokument.status !== EPvkDokumentStatus.UNDERARBEID && (
                  <Alert variant='info' className='my-5'>
                    Status: {pvkDokumentStatusToText(pvkDokument.status)}
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

                <TilhorendeDokumentasjonSummary
                  etterlevelseDokumentasjon={etterlevelseDokumentasjon}
                  manglerBehandlingError={manglerBehandlingError}
                  pvkKravError={pvkKravError}
                  pvkKrav={pvkKrav}
                />

                {/* <InvolveringSummary
                  databehandlere={databehandlere}
                  personkategorier={personkategorier}
                /> */}

                {/* <RisikoscenarioSummary
                  alleRisikoscenario={alleRisikoscenario}
                  alleTiltak={alleTiltak}
                  risikoscenarioError={risikoscenarioError}
                  tiltakError={tiltakError}
                /> */}

                {/* <RisikoscenarioEtterTitak
                  alleRisikoscenario={alleRisikoscenario}
                  savnerVurderingError={savnerVurderingError}
                /> */}

                {/* {underarbeidCheck && (
                  <UnderArbeidFields
                    pvkDokument={pvkDokument}
                    isLoading={isLoading}
                    setFieldValue={setFieldValue}
                    submitForm={submitForm}
                    initialStatus={initialValues.status}
                    errorSummaryRef={errorSummaryRef}
                    errorSummaryComponent={
                      <SendInnErrorSummary
                        errors={errors}
                        etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
                        risikoeiereDataError={risikoeiereDataError}
                        avdelingError={avdelingError}
                        medlemError={medlemError}
                        behandlingensLivslopError={behandlingensLivslopError}
                        risikoscenarioError={risikoscenarioError}
                        tiltakError={tiltakError}
                        pvkKravError={pvkKravError}
                        savnerVurderingError={savnerVurderingError}
                        manglerBehandlingError={manglerBehandlingError}
                        errorSummaryRef={errorSummaryRef}
                      />
                    }
                  />
                )} */}

                {/* {(pvkDokument.status === EPvkDokumentStatus.SENDT_TIL_PVO ||
                  pvkDokument.status === EPvkDokumentStatus.SENDT_TIL_PVO_FOR_REVURDERING) && (
                  <SendtTilPvoFields
                    pvkDokument={pvkDokument}
                    isLoading={isLoading}
                    setFieldValue={setFieldValue}
                    submitForm={submitForm}
                  />
                )} */}

                {/* {pvkDokument.status === EPvkDokumentStatus.PVO_UNDERARBEID && (
                  <PVOUnderArbeidFIelds pvkDokument={pvkDokument} isLoading={isLoading} />
                )} */}

                {/* {pvkDokument.status === EPvkDokumentStatus.VURDERT_AV_PVO_TRENGER_MER_ARBEID &&
                  pvoTilbakemelding && (
                    <VurdertAvPvoOgTrengerMerArbeidFields
                      pvkDokument={pvkDokument}
                      pvoTilbakemelding={pvoTilbakemelding}
                      setFieldValue={setFieldValue}
                      submitForm={submitForm}
                      initialStatus={initialValues.status}
                      isLoading={isLoading}
                      pvoVurderingList={pvoVurderingList}
                      errorSummaryComponent={
                        <SendInnErrorSummary
                          errors={errors}
                          etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
                          risikoeiereDataError={risikoeiereDataError}
                          avdelingError={avdelingError}
                          medlemError={medlemError}
                          behandlingensLivslopError={behandlingensLivslopError}
                          risikoscenarioError={risikoscenarioError}
                          tiltakError={tiltakError}
                          pvkKravError={pvkKravError}
                          savnerVurderingError={savnerVurderingError}
                          manglerBehandlingError={manglerBehandlingError}
                          errorSummaryRef={errorSummaryRef}
                        />
                      }
                    />
                  )} */}

                {/* {pvkDokument.status === EPvkDokumentStatus.VURDERT_AV_PVO && pvoTilbakemelding && (
                  <VurdertAvPvoFields
                    pvkDokument={pvkDokument}
                    pvoTilbakemelding={pvoTilbakemelding}
                    setFieldValue={setFieldValue}
                    submitForm={submitForm}
                    initialStatus={initialValues.status}
                    isLoading={isLoading}
                    pvoVurderingList={pvoVurderingList}
                    errorSummaryComponent={
                      <SendInnErrorSummary
                        errors={errors}
                        etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
                        risikoeiereDataError={risikoeiereDataError}
                        avdelingError={avdelingError}
                        medlemError={medlemError}
                        behandlingensLivslopError={behandlingensLivslopError}
                        risikoscenarioError={risikoscenarioError}
                        tiltakError={tiltakError}
                        pvkKravError={pvkKravError}
                        savnerVurderingError={savnerVurderingError}
                        manglerBehandlingError={manglerBehandlingError}
                        errorSummaryRef={errorSummaryRef}
                      />
                    }
                  />
                )} */}

                {/* {pvkDokument.status === EPvkDokumentStatus.TRENGER_GODKJENNING &&
                  pvoTilbakemelding && (
                    <TrengerRisikoeierGodkjenningFields
                      pvkDokument={pvkDokument}
                      etterlevelseDokumentasjon={etterlevelseDokumentasjon}
                      pvoTilbakemelding={pvoTilbakemelding}
                      isLoading={isLoading}
                      setFieldValue={setFieldValue}
                      submitForm={submitForm}
                      initialStatus={initialValues.status}
                      pvoVurderingList={pvoVurderingList}
                      errorSummaryComponent={
                        <SendInnErrorSummary
                          errors={errors}
                          etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
                          risikoeiereDataError={risikoeiereDataError}
                          avdelingError={avdelingError}
                          medlemError={medlemError}
                          behandlingensLivslopError={behandlingensLivslopError}
                          risikoscenarioError={risikoscenarioError}
                          tiltakError={tiltakError}
                          pvkKravError={pvkKravError}
                          savnerVurderingError={savnerVurderingError}
                          manglerBehandlingError={manglerBehandlingError}
                          errorSummaryRef={errorSummaryRef}
                        />
                      }
                    />
                  )} */}

                {/* {pvkDokument.status === EPvkDokumentStatus.GODKJENT_AV_RISIKOEIER &&
                  pvoTilbakemelding && (
                    <GodkjentAvRisikoeierFields
                      pvkDokument={pvkDokument}
                      etterlevelseDokumentasjon={etterlevelseDokumentasjon}
                      pvoTilbakemelding={pvoTilbakemelding}
                      isLoading={isLoading}
                      setFieldValue={setFieldValue}
                      submitForm={submitForm}
                      pvoVurderingList={pvoVurderingList}
                      setAngretAvRisikoeier={setAngretAvRisikoeier}
                      errorSummaryComponent={
                        <SendInnErrorSummary
                          errors={errors}
                          etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
                          risikoeiereDataError={risikoeiereDataError}
                          avdelingError={avdelingError}
                          medlemError={medlemError}
                          behandlingensLivslopError={behandlingensLivslopError}
                          risikoscenarioError={risikoscenarioError}
                          tiltakError={tiltakError}
                          pvkKravError={pvkKravError}
                          savnerVurderingError={savnerVurderingError}
                          manglerBehandlingError={manglerBehandlingError}
                          errorSummaryRef={errorSummaryRef}
                        />
                      }
                    />
                  )} */}

                <InfoChangesMadeAfterApproval
                  pvkDokument={pvkDokument}
                  behandlingensLivslop={behandlingensLivslop}
                  alleRisikoscenario={alleRisikoscenario}
                  alleTiltak={alleTiltak}
                />

                {!isLoading && (
                  <FormButtons
                    etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
                    activeStep={activeStep}
                    setActiveStep={setActiveStep}
                    setSelectedStep={setSelectedStep}
                    submitForm={submitForm}
                    customButtons={
                      <div className='mt-5 flex gap-2 items-center'>
                        <div className='min-w-[446px]' />
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
