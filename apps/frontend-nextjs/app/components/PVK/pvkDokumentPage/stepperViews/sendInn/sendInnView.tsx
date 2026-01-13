'use client'

import { useBehandlingensArtOgOmfang } from '@/api/behandlingensArtOgOmfang/behandlingensArtOgOmfangApi'
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
import PVOUnderArbeidFIelds from '@/components/PVK/pvkDokumentPage/stepperViews/sendInn/sendInnCoponents/pvoUnderArbeidFIelds'
import SendtTilPvoFields from '@/components/PVK/pvkDokumentPage/stepperViews/sendInn/sendInnCoponents/sendtTilPvoFields'
import TrengerRisikoeierGodkjenningFields from '@/components/PVK/pvkDokumentPage/stepperViews/sendInn/sendInnCoponents/trengerRisikoeierGodkjenningFields'
import VurdertAvPvoFields from '@/components/PVK/pvkDokumentPage/stepperViews/sendInn/sendInnCoponents/vurdertAvPvoFields'
import VurdertAvPvoOgTrengerMerArbeidFields from '@/components/PVK/pvkDokumentPage/stepperViews/sendInn/sendInnCoponents/vurdertAvPvoOgTrengerMerArbeidFields'
import AlertPvoUnderArbeidModal from '@/components/pvoTilbakemelding/common/alertPvoUnderArbeidModal'
import { IArtOgOmfangError } from '@/constants/behandlingensArtOgOmfang/behandlingensArtOgOmfangConstants'
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
import moment from 'moment'
import { FunctionComponent, RefObject, useContext, useEffect, useRef, useState } from 'react'
import ArtOgOmFangSummary from '../../formSummary/artOgOmFangSummary'
import BehandlingensLivslopSummary from '../../formSummary/behandlingensLivslopSummary'
import InvolveringSummary from '../../formSummary/involveringSummary'
import RisikoscenarioEtterTitak from '../../formSummary/risikoscenarioEtterTitak'
import RisikoscenarioSummary from '../../formSummary/risikoscenarioSummary'
import TilhorendeDokumentasjonSummary from '../../formSummary/tilhorendeDokumentasjonSummary'
import { SendInnLagringVellykketAlert } from './sendInnCoponents/SendInnLagringVellykketAlert'
import GodkjentAvRisikoeierFields from './sendInnCoponents/godkjentAvRisikoeierFields'
import UnderArbeidFields from './sendInnCoponents/readOnly/underArbeidFields'
import SendInnErrorSummary from './sendInnCoponents/sendInnErrorSummary'

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
  const [tiltakAnsvarligError, setTiltakAnsvarligError] = useState<string>('')
  const [tiltakFristError, setTiltakFristError] = useState<string>('')
  const [tiltakFristUtgaattError, setTiltakFristUtgaattError] = useState<string>('')
  const [pvkKravError, setPvkKravError] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [submitClick, setSubmitClick] = useState<boolean>(false)
  const [isPvoAlertModalOpen, setIsPvoAlertModalOpen] = useState<boolean>(false)
  const [pvoVurderingList, setPvoVurderingList] = useState<ICode[]>([])
  const [angretAvRisikoeier, setAngretAvRisikoeier] = useState<boolean>(false)
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false)
  const [artOgOmfang] = useBehandlingensArtOgOmfang(etterlevelseDokumentasjon.id)
  const [artOgOmfangError, setArtOgOmfangError] = useState<IArtOgOmfangError>({
    stemmerPersonkategorier: false,
    personkategoriAntallBeskrivelse: false,
    tilgangsBeskrivelsePersonopplysningene: false,
    lagringsBeskrivelsePersonopplysningene: false,
  })
  const user = useContext(UserContext)

  const underarbeidCheck: boolean = pvkDokument.status === EPvkDokumentStatus.UNDERARBEID

  const submit = async (submitedValues: IPvkDokument): Promise<void> => {
    if (
      !behandlingensLivslopError &&
      !artOgOmfangError.stemmerPersonkategorier &&
      !artOgOmfangError.lagringsBeskrivelsePersonopplysningene &&
      !artOgOmfangError.tilgangsBeskrivelsePersonopplysningene &&
      !artOgOmfangError.personkategoriAntallBeskrivelse &&
      risikoscenarioError === '' &&
      savnerVurderingError === '' &&
      tiltakError === '' &&
      tiltakAnsvarligError === '' &&
      tiltakFristError === '' &&
      tiltakFristUtgaattError === '' &&
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
            berOmNyVurderingFraPvo: submitedValues.berOmNyVurderingFraPvo,
            meldingerTilPvo: submitedValues.meldingerTilPvo,
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
            antallInnsendingTilPvo: submitedValues.antallInnsendingTilPvo,
          }

          if (
            [
              EPvkDokumentStatus.SENDT_TIL_PVO,
              EPvkDokumentStatus.SENDT_TIL_PVO_FOR_REVURDERING,
            ].includes(submitedValues.status)
          ) {
            const relevantMeldingTilPvo = updatedPvkDokument.meldingerTilPvo.filter(
              (melding) => melding.innsendingId === updatedPvkDokument.antallInnsendingTilPvo
            )

            if (relevantMeldingTilPvo.length !== 0) {
              updatedPvkDokument.meldingerTilPvo.forEach((meldingTilPvo) => {
                if (meldingTilPvo.innsendingId === updatedPvkDokument.antallInnsendingTilPvo) {
                  meldingTilPvo.sendtTilPvoAv = user.getIdent() + ' - ' + user.getName()
                  meldingTilPvo.sendtTilPvoDato = new Date().toISOString()
                }
              })
            }
          }

          updatePvkDokument(updatedPvkDokument).then((savedResponse: IPvkDokument) => {
            setPvkDokument(savedResponse)
            setAngretAvRisikoeier(false)
            setSavedSuccess(true)
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

  const artOgOmfangFieldCheck = () => {
    let stemmerPersonkategorier = false
    let personkategoriAntallBeskrivelse = false
    let tilgangsBeskrivelsePersonopplysningene = false
    let lagringsBeskrivelsePersonopplysningene = false

    if (
      artOgOmfang.stemmerPersonkategorier === undefined ||
      artOgOmfang.stemmerPersonkategorier === null
    ) {
      stemmerPersonkategorier = true
    }
    if (
      artOgOmfang.personkategoriAntallBeskrivelse === '' ||
      artOgOmfang.personkategoriAntallBeskrivelse === undefined
    ) {
      personkategoriAntallBeskrivelse = true
    }

    if (
      artOgOmfang.tilgangsBeskrivelsePersonopplysningene === '' ||
      artOgOmfang.tilgangsBeskrivelsePersonopplysningene === undefined
    ) {
      tilgangsBeskrivelsePersonopplysningene = true
    }
    if (
      artOgOmfang.lagringsBeskrivelsePersonopplysningene === '' ||
      artOgOmfang.lagringsBeskrivelsePersonopplysningene === undefined
    ) {
      lagringsBeskrivelsePersonopplysningene = true
    }

    setArtOgOmfangError({
      stemmerPersonkategorier,
      personkategoriAntallBeskrivelse,
      tilgangsBeskrivelsePersonopplysningene,
      lagringsBeskrivelsePersonopplysningene,
    })
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
    if (alleTiltak.length > 0) {
      const ikkeFerdigBeskrevetTiltak = alleTiltak.filter(
        (tiltak) => tiltak.beskrivelse === '' || tiltak.navn === ''
      )
      if (ikkeFerdigBeskrevetTiltak.length !== 0) {
        setTiltakError(`${ikkeFerdigBeskrevetTiltak.length} tiltak er ikke ferdig beskrevet`)
      }
    } else {
      setTiltakError('')
    }
  }

  const tiltakAnsvarligCheck = () => {
    if (alleTiltak.length > 0) {
      const manglerTiltaksansvarlig = alleTiltak.filter(
        (tiltak) =>
          tiltak.ansvarlig.navIdent === '' &&
          tiltak.ansvarligTeam.name === null &&
          !tiltak.iverksatt
      )
      if (manglerTiltaksansvarlig.length !== 0) {
        setTiltakAnsvarligError(`${manglerTiltaksansvarlig.length} tiltak mangler tiltaksansvarlig`)
      }
    } else {
      setTiltakAnsvarligError('')
    }
  }

  const tiltakFristCheck = () => {
    if (alleTiltak.length > 0) {
      const now = new Date()
      let amountOfOverdueTiltak = 0
      let amountOfMissingTiltakFrist = 0

      alleTiltak.map((tiltak) => {
        if (tiltak.frist !== null && !tiltak.iverksatt) {
          if (moment(now).isAfter(moment(tiltak.frist))) {
            amountOfOverdueTiltak++
          }
        }
        if (tiltak.frist === null && !tiltak.iverksatt) {
          amountOfMissingTiltakFrist++
        }
      })

      if (amountOfMissingTiltakFrist > 0) {
        setTiltakFristError(`${amountOfMissingTiltakFrist} tiltak mangler tiltaksfrist.`)
      } else setTiltakFristError('')

      if (amountOfOverdueTiltak > 0) {
        setTiltakFristUtgaattError(`${amountOfOverdueTiltak} tiltak har utløpt frist.`)
      } else setTiltakFristUtgaattError('')
    } else {
      setTiltakFristError('')
      setTiltakFristUtgaattError('')
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
        artOgOmfangError.stemmerPersonkategorier ||
        artOgOmfangError.lagringsBeskrivelsePersonopplysningene ||
        artOgOmfangError.tilgangsBeskrivelsePersonopplysningene ||
        artOgOmfangError.personkategoriAntallBeskrivelse ||
        behandlingensLivslopError ||
        risikoscenarioError !== '' ||
        tiltakError !== '' ||
        tiltakAnsvarligError !== '' ||
        tiltakFristError.length !== 0 ||
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
        <AlertPvoUnderArbeidModal
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
              artOgOmfangFieldCheck()
              pvkKravCheck()
              risikoscenarioCheck()
              if (
                alleRisikoscenario.filter((risiko: IRisikoscenario) => !risiko.ingenTiltak)
                  .length !== 0
              ) {
                tiltakCheck()
                tiltakAnsvarligCheck()
                tiltakFristCheck()
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
                  text='Kopier lenken til denne siden'
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
                  artOgOmfang={artOgOmfang}
                  artOgOmfangError={artOgOmfangError}
                  personkategorier={personkategorier}
                  updateTitleUrlAndStep={updateTitleUrlAndStep}
                />

                <TilhorendeDokumentasjonSummary
                  etterlevelseDokumentasjon={etterlevelseDokumentasjon}
                  manglerBehandlingError={manglerBehandlingError}
                  pvkKravError={pvkKravError}
                  pvkKrav={pvkKrav}
                />

                <InvolveringSummary
                  databehandlere={databehandlere}
                  personkategorier={personkategorier}
                />

                <RisikoscenarioSummary
                  alleRisikoscenario={alleRisikoscenario}
                  alleTiltak={alleTiltak}
                  risikoscenarioError={risikoscenarioError}
                  tiltakError={tiltakError}
                  tiltakAnsvarligError={tiltakAnsvarligError}
                  tiltakFristError={tiltakFristError}
                  tiltakFristUtgaattError={tiltakFristUtgaattError}
                />

                <RisikoscenarioEtterTitak
                  alleRisikoscenario={alleRisikoscenario}
                  savnerVurderingError={savnerVurderingError}
                />

                <div className='flex justify-center'>
                  <div>
                    {underarbeidCheck && (
                      <UnderArbeidFields
                        pvkDokument={initialValues}
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
                            artOgOmfangError={artOgOmfangError}
                            risikoscenarioError={risikoscenarioError}
                            tiltakError={tiltakError}
                            tiltakAnsvarligError={tiltakAnsvarligError}
                            tiltakFristError={tiltakFristError}
                            tiltakFristUtgaattError={tiltakFristUtgaattError}
                            pvkKravError={pvkKravError}
                            savnerVurderingError={savnerVurderingError}
                            manglerBehandlingError={manglerBehandlingError}
                            errorSummaryRef={errorSummaryRef}
                          />
                        }
                        savedAlert={
                          <div>
                            {savedSuccess && (
                              <SendInnLagringVellykketAlert setSavedSuccessful={setSavedSuccess} />
                            )}
                          </div>
                        }
                      />
                    )}

                    {(pvkDokument.status === EPvkDokumentStatus.SENDT_TIL_PVO ||
                      pvkDokument.status === EPvkDokumentStatus.SENDT_TIL_PVO_FOR_REVURDERING) && (
                      <SendtTilPvoFields
                        pvkDokument={pvkDokument}
                        pvoTilbakemelding={pvoTilbakemelding}
                        isLoading={isLoading}
                        setFieldValue={setFieldValue}
                        submitForm={submitForm}
                      />
                    )}

                    {pvkDokument.status === EPvkDokumentStatus.PVO_UNDERARBEID && (
                      <PVOUnderArbeidFIelds pvkDokument={pvkDokument} isLoading={isLoading} />
                    )}

                    {pvkDokument.status === EPvkDokumentStatus.VURDERT_AV_PVO_TRENGER_MER_ARBEID &&
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
                              artOgOmfangError={artOgOmfangError}
                              risikoscenarioError={risikoscenarioError}
                              tiltakError={tiltakError}
                              tiltakAnsvarligError={tiltakAnsvarligError}
                              tiltakFristError={tiltakFristError}
                              tiltakFristUtgaattError={tiltakFristUtgaattError}
                              pvkKravError={pvkKravError}
                              savnerVurderingError={savnerVurderingError}
                              manglerBehandlingError={manglerBehandlingError}
                              errorSummaryRef={errorSummaryRef}
                            />
                          }
                          savedAlert={
                            <div>
                              {savedSuccess && (
                                <SendInnLagringVellykketAlert
                                  setSavedSuccessful={setSavedSuccess}
                                />
                              )}
                            </div>
                          }
                        />
                      )}

                    {pvkDokument.status === EPvkDokumentStatus.VURDERT_AV_PVO &&
                      pvoTilbakemelding && (
                        <VurdertAvPvoFields
                          pvkDokument={pvkDokument}
                          pvoTilbakemelding={pvoTilbakemelding}
                          setFieldValue={setFieldValue}
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
                              artOgOmfangError={artOgOmfangError}
                              risikoscenarioError={risikoscenarioError}
                              tiltakError={tiltakError}
                              tiltakAnsvarligError={tiltakAnsvarligError}
                              tiltakFristError={tiltakFristError}
                              tiltakFristUtgaattError={tiltakFristUtgaattError}
                              pvkKravError={pvkKravError}
                              savnerVurderingError={savnerVurderingError}
                              manglerBehandlingError={manglerBehandlingError}
                              errorSummaryRef={errorSummaryRef}
                            />
                          }
                          savedAlert={
                            <div>
                              {savedSuccess && (
                                <SendInnLagringVellykketAlert
                                  setSavedSuccessful={setSavedSuccess}
                                />
                              )}
                            </div>
                          }
                        />
                      )}

                    {pvkDokument.status === EPvkDokumentStatus.TRENGER_GODKJENNING &&
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
                          errors={errors}
                          errorSummaryComponent={
                            <SendInnErrorSummary
                              errors={errors}
                              etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
                              risikoeiereDataError={risikoeiereDataError}
                              avdelingError={avdelingError}
                              medlemError={medlemError}
                              behandlingensLivslopError={behandlingensLivslopError}
                              artOgOmfangError={artOgOmfangError}
                              risikoscenarioError={risikoscenarioError}
                              tiltakError={tiltakError}
                              tiltakAnsvarligError={tiltakAnsvarligError}
                              tiltakFristError={tiltakFristError}
                              tiltakFristUtgaattError={tiltakFristUtgaattError}
                              pvkKravError={pvkKravError}
                              savnerVurderingError={savnerVurderingError}
                              manglerBehandlingError={manglerBehandlingError}
                              errorSummaryRef={errorSummaryRef}
                            />
                          }
                          savedAlert={
                            <div>
                              {savedSuccess && (
                                <SendInnLagringVellykketAlert
                                  setSavedSuccessful={setSavedSuccess}
                                />
                              )}
                            </div>
                          }
                        />
                      )}

                    {pvkDokument.status === EPvkDokumentStatus.GODKJENT_AV_RISIKOEIER &&
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
                              artOgOmfangError={artOgOmfangError}
                              behandlingensLivslopError={behandlingensLivslopError}
                              risikoscenarioError={risikoscenarioError}
                              tiltakError={tiltakError}
                              tiltakAnsvarligError={tiltakAnsvarligError}
                              tiltakFristError={tiltakFristError}
                              tiltakFristUtgaattError={tiltakFristUtgaattError}
                              pvkKravError={pvkKravError}
                              savnerVurderingError={savnerVurderingError}
                              manglerBehandlingError={manglerBehandlingError}
                              errorSummaryRef={errorSummaryRef}
                            />
                          }
                        />
                      )}
                    <div className='flex justify-center w-full'>
                      <div className='max-w-[75ch]'>
                        <InfoChangesMadeAfterApproval
                          pvkDokument={pvkDokument}
                          behandlingensLivslop={behandlingensLivslop}
                          alleRisikoscenario={alleRisikoscenario}
                          alleTiltak={alleTiltak}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {!isLoading && (
                  <FormButtons
                    etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
                    activeStep={activeStep}
                    setActiveStep={setActiveStep}
                    setSelectedStep={setSelectedStep}
                    customButtons={
                      <div className='mt-5 flex gap-2 items-center'>
                        <div className='min-w-111.5' />
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
