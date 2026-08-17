'use client'

import { useBehandlingensArtOgOmfang } from '@/api/behandlingensArtOgOmfang/behandlingensArtOgOmfangApi'
import {
  getBehandlingensLivslopByEtterlevelseDokumentId,
  mapBehandlingensLivslopToFormValue,
} from '@/api/behandlingensLivslop/behandlingensLivslopApi'
import { getEtterlevelseDokumentasjon } from '@/api/etterlevelseDokumentasjon/etterlevelseDokumentasjonApi'
import {
  getPvkDokument,
  godkjenOgArkiverPvkDokument,
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
import {
  EEtterlevelseDokumentasjonStatus,
  TEtterlevelseDokumentasjonQL,
} from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
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
import { BodyLong, Button, CopyButton, Heading, InlineMessage, Modal } from '@navikt/ds-react'
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
  refetchPvkKrav: () => Promise<{ data?: { krav: IPageResponse<TKravQL> } }>
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
  refetchPvkKrav,
  pvoTilbakemelding,
}) => {
  const errorSummaryRef: RefObject<HTMLDivElement | null> = useRef<HTMLDivElement>(null)
  const formRef: RefObject<any> = useRef(undefined)
  // Synchronous flag so submit() sees the result of the latest validate() run, avoiding a race
  // with React state updates not yet re-rendered when Formik calls onSubmit.
  const hasBlockingErrorsRef = useRef<boolean>(false)

  const [behandlingensLivslop, setBehandlingensLivslop] = useState<IBehandlingensLivslop>()
  const [alleRisikoscenario, setAlleRisikoscenario] = useState<IRisikoscenario[]>([])
  const [alleTiltak, setAlleTitltak] = useState<ITiltak[]>([])
  const [risikoeiereDataError, setRisikoeiereDataError] = useState<boolean>(false)
  const [avdelingError, setAvdelingError] = useState<boolean>(false)
  const [medlemError, setMedlemError] = useState<boolean>(false)
  const [behandlingensLivslopError, setBehandlingensLivslopError] = useState<boolean>(false)
  const [manglerBehandlingError, setManglerBehandlingError] = useState<boolean>(false)
  const [risikoscenarioError, setRisikoscenarioError] = useState<string>('')
  const [generelleRisikoscenarioMedFeil, setGenerelleRisikoscenarioMedFeil] = useState<
    IRisikoscenario[]
  >([])
  const [spesifikkeRisikoscenarioMedFeil, setSpesifikkeRisikoscenarioMedFeil] = useState<
    IRisikoscenario[]
  >([])
  const [savnerVurderingError, setsavnerVurderingError] = useState<string>('')
  const [tiltakError, setTiltakError] = useState<string>('')
  const [tiltakAnsvarligError, setTiltakAnsvarligError] = useState<string>('')
  const [tiltakFristError, setTiltakFristError] = useState<string>('')
  const [tiltakFristUtgaattError, setTiltakFristUtgaattError] = useState<string>('')
  const [pvkKravError, setPvkKravError] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [submitClick, setSubmitClick] = useState<boolean>(false)
  const [isPvoAlertModalOpen, setIsPvoAlertModalOpen] = useState<boolean>(false)
  const [isEdokStatusAlertModalOpen, setIsEdokStatusAlertModalOpen] = useState<boolean>(false)
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
  const hasAccess = user.isAdmin() || etterlevelseDokumentasjon.hasCurrentUserAccess

  const submit = async (submitedValues: IPvkDokument): Promise<void> => {
    if (!hasBlockingErrorsRef.current) {
      await getEtterlevelseDokumentasjon(etterlevelseDokumentasjon.id).then(async (edok) => {
        if (edok.status === EEtterlevelseDokumentasjonStatus.UNDER_ARBEID) {
          await getPvkDokument(submitedValues.id).then(async (response: IPvkDokument) => {
            if ([EPvkDokumentStatus.PVO_UNDERARBEID].includes(response.status)) {
              setIsPvoAlertModalOpen(true)
            } else {
              const updatedPvkDokument: IPvkDokument = {
                ...response,
                status:
                  response.status === EPvkDokumentStatus.GODKJENT_AV_RISIKOEIER &&
                  !angretAvRisikoeier
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
                      meldingTilPvo.etterlevelseDokumentVersjon =
                        etterlevelseDokumentasjon.etterlevelseDokumentVersjon
                      meldingTilPvo.sendtTilPvoAv = user.getIdent() + ' - ' + user.getName()
                      meldingTilPvo.sendtTilPvoDato = new Date().toISOString()
                    }
                  })
                }
              } else if (
                [
                  EPvkDokumentStatus.VURDERT_AV_PVO,
                  EPvkDokumentStatus.VURDERT_AV_PVO_TRENGER_MER_ARBEID,
                ].includes(submitedValues.status)
              ) {
                updatedPvkDokument.meldingerTilPvo.forEach((meldingTilPvo) => {
                  if (meldingTilPvo.innsendingId > submitedValues.antallInnsendingTilPvo) {
                    meldingTilPvo.sendtTilPvoAv = ''
                    meldingTilPvo.sendtTilPvoDato = ''
                  }
                })
              }

              if (submitedValues.status === EPvkDokumentStatus.GODKJENT_AV_RISIKOEIER) {
                await godkjenOgArkiverPvkDokument(updatedPvkDokument).then(
                  (savedResponse: IPvkDokument) => {
                    setPvkDokument(savedResponse)
                    setAngretAvRisikoeier(false)
                    setSavedSuccess(true)
                  }
                )
              } else {
                await updatePvkDokument(updatedPvkDokument).then((savedResponse: IPvkDokument) => {
                  setPvkDokument(savedResponse)
                  setAngretAvRisikoeier(false)
                  setSavedSuccess(true)
                })
              }
            }
          })
        } else {
          setIsEdokStatusAlertModalOpen(true)
        }
      })
    }
  }

  const manglerBehandlingErrorCheck = (): boolean => {
    const hasError =
      etterlevelseDokumentasjon.behandlingIds.length === 0 &&
      etterlevelseDokumentasjon.dpBehandlingIds.length === 0
    setManglerBehandlingError(hasError)
    return hasError
  }

  const risikoeiereDataFieldCheck = (): boolean => {
    const hasError = etterlevelseDokumentasjon.risikoeiereData?.length === 0
    setRisikoeiereDataError(hasError)
    return hasError
  }

  const avdelingFieldCheck = (): boolean => {
    const hasError = !etterlevelseDokumentasjon.nomAvdelingId
    setAvdelingError(hasError)
    return hasError
  }

  const medlemErrorCheck = (): boolean => {
    const hasError =
      (etterlevelseDokumentasjon.teamsData === undefined ||
        etterlevelseDokumentasjon.teamsData?.length === 0) &&
      (etterlevelseDokumentasjon.resourcesData === undefined ||
        etterlevelseDokumentasjon.resourcesData?.length === 0)
    setMedlemError(hasError)
    return hasError
  }

  const behandlingensLivslopFieldCheck = (
    data: IBehandlingensLivslop | undefined = behandlingensLivslop
  ): boolean => {
    const hasError = data?.filer.length === 0 && data.beskrivelse === ''
    setBehandlingensLivslopError(hasError)
    return hasError
  }

  const artOgOmfangFieldCheck = (): boolean => {
    const stemmerPersonkategorier =
      artOgOmfang.stemmerPersonkategorier === undefined ||
      artOgOmfang.stemmerPersonkategorier === null
    const personkategoriAntallBeskrivelse =
      artOgOmfang.personkategoriAntallBeskrivelse === '' ||
      artOgOmfang.personkategoriAntallBeskrivelse === undefined
    const tilgangsBeskrivelsePersonopplysningene =
      artOgOmfang.tilgangsBeskrivelsePersonopplysningene === '' ||
      artOgOmfang.tilgangsBeskrivelsePersonopplysningene === undefined
    const lagringsBeskrivelsePersonopplysningene =
      artOgOmfang.lagringsBeskrivelsePersonopplysningene === '' ||
      artOgOmfang.lagringsBeskrivelsePersonopplysningene === undefined

    setArtOgOmfangError({
      stemmerPersonkategorier,
      personkategoriAntallBeskrivelse,
      tilgangsBeskrivelsePersonopplysningene,
      lagringsBeskrivelsePersonopplysningene,
    })

    return (
      stemmerPersonkategorier ||
      personkategoriAntallBeskrivelse ||
      tilgangsBeskrivelsePersonopplysningene ||
      lagringsBeskrivelsePersonopplysningene
    )
  }

  const pvkKravCheck = (krav: IPageResponse<TKravQL> | undefined = pvkKrav?.krav): boolean => {
    if (isPvkKravLoading && krav === undefined) {
      return pvkKravError !== ''
    }

    const antallPvkKrav = krav?.totalElements
    const pvkEtterlevelser: TEtterlevelseQL[] = []

    krav?.content.forEach((pvkKravItem) => {
      pvkEtterlevelser.push(...pvkKravItem.etterlevelser)
    })

    const ferdigPvkEtterlevelser = pvkEtterlevelser.filter(
      (etterlevelse) => etterlevelse.status === EEtterlevelseStatus.FERDIG_DOKUMENTERT
    )

    const hasError = ferdigPvkEtterlevelser.length !== antallPvkKrav
    setPvkKravError(
      hasError
        ? 'Alle krav relatert til personvernkonsekvens vurdering må være ferdig dokumentert'
        : ''
    )
    return hasError
  }

  const risikoscenarioCheck = (data: IRisikoscenario[] = alleRisikoscenario): boolean => {
    if (data.length === 0) {
      setRisikoscenarioError('Dere må ha minst 1 risikoscenario.')
      setGenerelleRisikoscenarioMedFeil([])
      setSpesifikkeRisikoscenarioMedFeil([])
      return true
    }

    const ikkeFerdigBeskrevetScenario = data.filter((risiko: IRisikoscenario) =>
      isRisikoUnderarbeidCheck(risiko)
    )
    const generelleMedFeil = ikkeFerdigBeskrevetScenario.filter(
      (risiko: IRisikoscenario) => risiko.generelScenario
    )
    const spesifikkeMedFeil = ikkeFerdigBeskrevetScenario.filter(
      (risiko: IRisikoscenario) => !risiko.generelScenario
    )

    setRisikoscenarioError(
      generelleMedFeil.length !== 0
        ? `${generelleMedFeil.length} risikoscenarioer er ikke ferdig beskrevet.`
        : ''
    )
    setGenerelleRisikoscenarioMedFeil(generelleMedFeil)
    setSpesifikkeRisikoscenarioMedFeil(spesifikkeMedFeil)

    return generelleMedFeil.length !== 0 || spesifikkeMedFeil.length !== 0
  }

  const tiltakCheck = (data: ITiltak[] = alleTiltak): boolean => {
    if (data.length === 0) {
      setTiltakError('')
      return false
    }

    const ikkeFerdigBeskrevetTiltak = data.filter(
      (tiltak) => tiltak.beskrivelse === '' || tiltak.navn === ''
    )
    setTiltakError(
      ikkeFerdigBeskrevetTiltak.length !== 0
        ? `${ikkeFerdigBeskrevetTiltak.length} tiltak er ikke ferdig beskrevet`
        : ''
    )
    return ikkeFerdigBeskrevetTiltak.length !== 0
  }

  const tiltakAnsvarligCheck = (data: ITiltak[] = alleTiltak): boolean => {
    if (data.length === 0) {
      setTiltakAnsvarligError('')
      return false
    }

    const manglerTiltaksansvarlig = data.filter(
      (tiltak) =>
        tiltak.ansvarlig.navIdent === '' && tiltak.ansvarligTeam.name === null && !tiltak.iverksatt
    )
    setTiltakAnsvarligError(
      manglerTiltaksansvarlig.length !== 0
        ? `${manglerTiltaksansvarlig.length} tiltak mangler tiltaksansvarlig`
        : ''
    )
    return manglerTiltaksansvarlig.length !== 0
  }

  const tiltakFristCheck = (data: ITiltak[] = alleTiltak): boolean => {
    if (data.length === 0) {
      setTiltakFristError('')
      setTiltakFristUtgaattError('')
      return false
    }

    const now = new Date()
    let amountOfOverdueTiltak = 0
    let amountOfMissingTiltakFrist = 0

    data.map((tiltak) => {
      if (tiltak.frist !== null && !tiltak.iverksatt) {
        if (moment(now).isAfter(moment(tiltak.frist), 'day')) {
          amountOfOverdueTiltak++
        }
      }
      if (tiltak.frist === null && !tiltak.iverksatt) {
        amountOfMissingTiltakFrist++
      }
    })

    setTiltakFristError(
      amountOfMissingTiltakFrist > 0
        ? `${amountOfMissingTiltakFrist} tiltak mangler tiltaksfrist.`
        : ''
    )
    setTiltakFristUtgaattError(
      amountOfOverdueTiltak > 0 ? `${amountOfOverdueTiltak} tiltak har utløpt frist ` : ''
    )

    return amountOfMissingTiltakFrist > 0 || amountOfOverdueTiltak > 0
  }

  const savnerVurderingCheck = (data: IRisikoscenario[] = alleRisikoscenario): boolean => {
    const savnerVurdering = data
      .filter((risiko: IRisikoscenario) => !risiko.ingenTiltak && !isRisikoUnderarbeidCheck(risiko))
      .filter(
        (risiko) =>
          risiko.konsekvensNivaaEtterTiltak === 0 ||
          risiko.sannsynlighetsNivaaEtterTiltak === 0 ||
          risiko.nivaaBegrunnelseEtterTiltak === ''
      )

    setsavnerVurderingError(
      savnerVurdering.length !== 0
        ? `${savnerVurdering.length} risikoscenarioer savner en vurdering av tiltakenes effekt.`
        : ''
    )
    return savnerVurdering.length !== 0
  }

  // Refetches the latest state from backend so validation checks don't run on stale data
  const fetchValidationData = async (): Promise<{
    behandlingensLivslop: IBehandlingensLivslop
    alleRisikoscenario: IRisikoscenario[]
    alleTiltak: ITiltak[]
    pvkKrav: IPageResponse<TKravQL> | undefined
  }> => {
    let freshBehandlingensLivslop = behandlingensLivslop as IBehandlingensLivslop
    let freshAlleRisikoscenario = alleRisikoscenario
    let freshAlleTiltak = alleTiltak
    let freshPvkKrav = pvkKrav?.krav

    await getBehandlingensLivslopByEtterlevelseDokumentId(pvkDokument.etterlevelseDokumentId)
      .then((response: IBehandlingensLivslop) => {
        freshBehandlingensLivslop = response
        setBehandlingensLivslop(response)
      })
      .catch((error: AxiosError) => {
        if (error.status === 404) {
          freshBehandlingensLivslop = mapBehandlingensLivslopToFormValue({})
          setBehandlingensLivslop(freshBehandlingensLivslop)
        } else {
          console.debug(error)
        }
      })
    await getRisikoscenarioByPvkDokumentId(pvkDokument.id, ERisikoscenarioType.ALL).then(
      (response: IPageResponse<IRisikoscenario>) => {
        freshAlleRisikoscenario = response.content
        setAlleRisikoscenario(response.content)
      }
    )
    await getTiltakByPvkDokumentId(pvkDokument.id).then((response: IPageResponse<ITiltak>) => {
      freshAlleTiltak = response.content
      setAlleTitltak(response.content)
    })

    await refetchPvkKrav()
      .then((response) => {
        freshPvkKrav = response.data?.krav
      })
      .catch((error: AxiosError) => {
        console.debug(error)
      })

    return {
      behandlingensLivslop: freshBehandlingensLivslop,
      alleRisikoscenario: freshAlleRisikoscenario,
      alleTiltak: freshAlleTiltak,
      pvkKrav: freshPvkKrav,
    }
  }

  useEffect(() => {
    ;(async () => {
      if (pvkDokument) {
        setIsLoading(true)
        await fetchValidationData()
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
        spesifikkeRisikoscenarioMedFeil.length !== 0 ||
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

  useEffect(() => {
    if (savedSuccess) {
      const timer = setTimeout(() => setSavedSuccess(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [savedSuccess])

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

      {isEdokStatusAlertModalOpen && (
        <Modal
          open={isEdokStatusAlertModalOpen}
          onClose={() => setIsEdokStatusAlertModalOpen(false)}
          header={{ heading: 'Kan ikke redigeres' }}
        >
          <Modal.Body>Kan ikke redigeres pga statusen til etterlevelsesdokumentet</Modal.Body>
          <Modal.Footer>
            <Button type='button' onClick={() => setIsEdokStatusAlertModalOpen(false)}>
              Lukk
            </Button>
          </Modal.Footer>
        </Modal>
      )}
      <Formik
        validateOnChange={false}
        validateOnBlur={false}
        onSubmit={submit}
        innerRef={formRef}
        initialValues={mapPvkDokumentToFormValue(pvkDokument as IPvkDokument)}
        validate={async (value) => {
          try {
            if (
              [
                EPvkDokumentStatus.SENDT_TIL_PVO,
                EPvkDokumentStatus.SENDT_TIL_PVO_FOR_REVURDERING,
                EPvkDokumentStatus.TRENGER_GODKJENNING,
              ].includes(value.status)
            ) {
              const freshData = await fetchValidationData()

              let hasBlockingErrors = false
              hasBlockingErrors = manglerBehandlingErrorCheck() || hasBlockingErrors
              hasBlockingErrors = risikoeiereDataFieldCheck() || hasBlockingErrors
              hasBlockingErrors = avdelingFieldCheck() || hasBlockingErrors
              hasBlockingErrors = medlemErrorCheck() || hasBlockingErrors
              hasBlockingErrors =
                behandlingensLivslopFieldCheck(freshData.behandlingensLivslop) || hasBlockingErrors
              hasBlockingErrors = artOgOmfangFieldCheck() || hasBlockingErrors
              hasBlockingErrors = pvkKravCheck(freshData.pvkKrav) || hasBlockingErrors
              hasBlockingErrors =
                risikoscenarioCheck(freshData.alleRisikoscenario) || hasBlockingErrors

              if (
                freshData.alleRisikoscenario.filter(
                  (risiko: IRisikoscenario) => !risiko.ingenTiltak
                ).length !== 0
              ) {
                hasBlockingErrors = tiltakCheck(freshData.alleTiltak) || hasBlockingErrors
                hasBlockingErrors = tiltakAnsvarligCheck(freshData.alleTiltak) || hasBlockingErrors
                hasBlockingErrors = tiltakFristCheck(freshData.alleTiltak) || hasBlockingErrors
                hasBlockingErrors =
                  savnerVurderingCheck(freshData.alleRisikoscenario) || hasBlockingErrors
              }

              hasBlockingErrorsRef.current = hasBlockingErrors
            } else {
              hasBlockingErrorsRef.current = false
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
                  <InlineMessage status='info' className='my-5'>
                    Status: {pvkDokumentStatusToText(pvkDokument.status)}
                  </InlineMessage>
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
                    {underarbeidCheck && hasAccess && (
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
                            pvkDokumentId={pvkDokument.id}
                            risikoeiereDataError={risikoeiereDataError}
                            avdelingError={avdelingError}
                            medlemError={medlemError}
                            behandlingensLivslopError={behandlingensLivslopError}
                            artOgOmfangError={artOgOmfangError}
                            risikoscenarioError={risikoscenarioError}
                            generelleRisikoscenarioMedFeil={generelleRisikoscenarioMedFeil}
                            spesifikkeRisikoscenarioMedFeil={spesifikkeRisikoscenarioMedFeil}
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
                        userHasAccess={hasAccess}
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
                          userHasAccess={hasAccess}
                          errorSummaryComponent={
                            <SendInnErrorSummary
                              errors={errors}
                              etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
                              pvkDokumentId={pvkDokument.id}
                              risikoeiereDataError={risikoeiereDataError}
                              avdelingError={avdelingError}
                              medlemError={medlemError}
                              behandlingensLivslopError={behandlingensLivslopError}
                              artOgOmfangError={artOgOmfangError}
                              risikoscenarioError={risikoscenarioError}
                              generelleRisikoscenarioMedFeil={generelleRisikoscenarioMedFeil}
                              spesifikkeRisikoscenarioMedFeil={spesifikkeRisikoscenarioMedFeil}
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
                          userHasAccess={hasAccess}
                          errorSummaryComponent={
                            <SendInnErrorSummary
                              errors={errors}
                              etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
                              pvkDokumentId={pvkDokument.id}
                              risikoeiereDataError={risikoeiereDataError}
                              avdelingError={avdelingError}
                              medlemError={medlemError}
                              behandlingensLivslopError={behandlingensLivslopError}
                              artOgOmfangError={artOgOmfangError}
                              risikoscenarioError={risikoscenarioError}
                              generelleRisikoscenarioMedFeil={generelleRisikoscenarioMedFeil}
                              spesifikkeRisikoscenarioMedFeil={spesifikkeRisikoscenarioMedFeil}
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
                              pvkDokumentId={pvkDokument.id}
                              risikoeiereDataError={risikoeiereDataError}
                              avdelingError={avdelingError}
                              medlemError={medlemError}
                              behandlingensLivslopError={behandlingensLivslopError}
                              artOgOmfangError={artOgOmfangError}
                              risikoscenarioError={risikoscenarioError}
                              generelleRisikoscenarioMedFeil={generelleRisikoscenarioMedFeil}
                              spesifikkeRisikoscenarioMedFeil={spesifikkeRisikoscenarioMedFeil}
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
                              pvkDokumentId={pvkDokument.id}
                              risikoeiereDataError={risikoeiereDataError}
                              avdelingError={avdelingError}
                              medlemError={medlemError}
                              artOgOmfangError={artOgOmfangError}
                              behandlingensLivslopError={behandlingensLivslopError}
                              risikoscenarioError={risikoscenarioError}
                              generelleRisikoscenarioMedFeil={generelleRisikoscenarioMedFeil}
                              spesifikkeRisikoscenarioMedFeil={spesifikkeRisikoscenarioMedFeil}
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
                                  customText='Etterlevelsen er godkjent og arkivert i Public360.'
                                />
                              )}
                            </div>
                          }
                        />
                      )}
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
