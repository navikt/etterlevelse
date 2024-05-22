import { BodyShort, Button, Loader, Select, Tabs, TextField } from '@navikt/ds-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useArkiveringByEtterlevelseDokumentasjonId } from '../../../api/ArkiveringApi'
import { getAllKravPriorityList } from '../../../api/KravPriorityListApi'
import {
  EEtterlevelseStatus,
  IKravPriorityList,
  TEtterlevelseDokumentasjonQL,
  TKravQL,
} from '../../../constants'
import { isFerdigUtfylt } from '../../../pages/EtterlevelseDokumentasjonTemaPage'
import { TTemaCode } from '../../../services/Codelist'
import ExportEtterlevelseModal from '../../export/ExportEtterlevelseModal'
import { ArkiveringModal } from '../ArkiveringModal'
import FocusList from '../FocusList'
import { KravAccordionList } from '../KravAccordionList'
import { getNewestKravVersjon } from '../common/utils'

interface IProps {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  setEtterlevelseDokumentasjon: (e: TEtterlevelseDokumentasjonQL) => void
  temaListe: TTemaCode[]
  relevanteStats: TKravQL[]
  utgaattStats: TKravQL[]
  loading: boolean
}

export const DokumentasjonPageTabs = (props: IProps) => {
  const {
    etterlevelseDokumentasjon,
    setEtterlevelseDokumentasjon,
    temaListe,
    relevanteStats,
    utgaattStats,
    loading,
  } = props

  const params = useParams<{ id?: string; tema?: string }>()

  const [arkivModal, setArkivModal] = useState<boolean>(false)
  const [openAccordions, setOpenAccordions] = useState<boolean[]>(temaListe.map(() => false))
  const [statusFilter, setStatusFilter] = useState<string>('ALLE')
  const [searchKrav, setSearchKrav] = useState<string>('')
  const [relevantKravList, setRelevantKravList] = useState<TKravQL[]>([])
  const [utgaattKravList, setUtgaattKravList] = useState<TKravQL[]>([])
  const [allKravPriority, setAllKravPriority] = useState<IKravPriorityList[]>([])

  const [etterlevelseArkiv, setEtterlevelseArkiv] = useArkiveringByEtterlevelseDokumentasjonId(
    params.id
  )

  const navigate = useNavigate()

  const filterStatus = (dataToFilter: TKravQL[]): TKravQL[] => {
    if (statusFilter === EEtterlevelseStatus.UNDER_REDIGERING) {
      return dataToFilter.filter(
        (krav) =>
          krav.etterlevelser.length !== 0 &&
          krav.etterlevelser[0].status !== EEtterlevelseStatus.FERDIG_DOKUMENTERT &&
          krav.etterlevelser[0].status !== EEtterlevelseStatus.OPPFYLLES_SENERE
      )
    } else if (statusFilter === EEtterlevelseStatus.OPPFYLLES_SENERE) {
      return dataToFilter.filter(
        (krav) =>
          krav.etterlevelser.length !== 0 &&
          krav.etterlevelser[0].status === EEtterlevelseStatus.OPPFYLLES_SENERE
      )
    } else if (statusFilter === '') {
      return dataToFilter.filter((krav) => krav.etterlevelser.length === 0)
    } else if (statusFilter === EEtterlevelseStatus.FERDIG_DOKUMENTERT) {
      return dataToFilter.filter(
        (krav) =>
          krav.etterlevelser.length !== 0 &&
          (krav.etterlevelser[0].status === EEtterlevelseStatus.FERDIG_DOKUMENTERT ||
            krav.etterlevelser[0].status === EEtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT)
      )
    } else {
      return dataToFilter
    }
  }

  useEffect(() => {
    if (params.tema === 'ALLE') {
      setOpenAccordions(temaListe.map(() => true))
    } else if (!params.tema) {
      setOpenAccordions(temaListe.map(() => false))
    } else {
      setOpenAccordions(
        temaListe.map((t) =>
          t.code.toLocaleLowerCase() === params.tema?.toLocaleLowerCase() ? true : false
        )
      )
    }
  }, [temaListe])

  useEffect(() => {
    getAllKravPriorityList().then((priority) => setAllKravPriority(priority))
  }, [])

  useEffect(() => {
    let relevanteStatusListe: TKravQL[] = relevanteStats
    let utgaattStatusListe: TKravQL[] = utgaattStats
    if (statusFilter !== 'ALLE') {
      relevanteStatusListe = filterStatus(relevanteStatusListe)
      utgaattStatusListe = filterStatus(utgaattStatusListe)
    }
    if (searchKrav !== '') {
      relevanteStatusListe = relevanteStatusListe.filter((krav) => {
        const kravName = 'K' + krav.kravNummer + '.' + krav.kravVersjon + ' ' + krav.navn

        return kravName.toLowerCase().includes(searchKrav.toLowerCase())
      })
      utgaattStatusListe = utgaattStatusListe.filter((krav) => {
        const kravName = 'K' + krav.kravNummer + '.' + krav.kravVersjon + ' ' + krav.navn

        return kravName.toLowerCase().includes(searchKrav.toLowerCase())
      })
    }

    setRelevantKravList(relevanteStatusListe)
    setUtgaattKravList(utgaattStatusListe)
  }, [relevanteStats, utgaattStats])

  let antallFylttKrav = 0

  getNewestKravVersjon(relevanteStats).forEach((k: TKravQL) => {
    if (k.etterlevelser.length && isFerdigUtfylt(k.etterlevelser[0].status)) {
      antallFylttKrav += 1
    }
  })

  return (
    <div>
      <Tabs defaultValue="alleKrav">
        <Tabs.List>
          <Tabs.Tab value="alleKrav" label="Alle Krav" />
          <Tabs.Tab value="prioritertKravliste" label="Prioritert kravliste" />
        </Tabs.List>
        <Tabs.Panel value="alleKrav">
          <div className="pt-4 flex flex-col gap-4">
            <div className="flex items-center w-full">
              <div className="flex items-center w-full gap-4">
                <Button
                  variant="tertiary"
                  size="xsmall"
                  onClick={() => {
                    setOpenAccordions(temaListe.map(() => true))
                    navigate(`/dokumentasjon/${params.id}/ALLE`)
                  }}
                >
                  Åpne alle tema
                </Button>
                <Button
                  variant="tertiary"
                  size="xsmall"
                  onClick={() => {
                    setOpenAccordions(temaListe.map(() => false))
                    navigate(`/dokumentasjon/${params.id}/`)
                  }}
                >
                  Lukk alle tema
                </Button>
              </div>

              <div className="flex justify-end w-full items-center">
                <BodyShort size="medium">
                  Totalt {getNewestKravVersjon(relevanteStats).length} krav
                  {statusFilter === 'ALLE'
                    ? `, ${antallFylttKrav} ferdig
              utfylt`
                    : ''}
                </BodyShort>
              </div>
            </div>

            <div className="flex items-center w-full gap-4">
              <BodyShort>Filter:</BodyShort>
              <TextField
                label="Søk etter kravet"
                hideLabel
                placeholder="Søk etter krav"
                onChange={(event) => setSearchKrav(event.target.value)}
              />
              <Select
                label="Velg status"
                hideLabel
                onChange={(event) => {
                  setStatusFilter(event.target.value)
                }}
              >
                <option value="ALLE">Velg status</option>
                <option value="ALLE">Alle</option>
                <option value={EEtterlevelseStatus.UNDER_REDIGERING}>Under arbeid</option>
                <option value={EEtterlevelseStatus.OPPFYLLES_SENERE}>Oppfylles senere</option>
                <option value="">Ikke påbegynt</option>
                <option value={EEtterlevelseStatus.FERDIG_DOKUMENTERT}>Ferdig utfylt</option>
              </Select>
            </div>

            {loading && (
              <div className="flex w-full justify-center mt-3.5">
                <Loader size={'large'} />
              </div>
            )}

            {!loading && (relevanteStats.length !== 0 || utgaattStats.length !== 0) && (
              <KravAccordionList
                allKravPriority={allKravPriority}
                etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
                relevanteStats={relevantKravList}
                utgaattStats={utgaattKravList}
                temaListe={temaListe}
                openAccordions={openAccordions}
                setOpenAccordions={setOpenAccordions}
              />
            )}

            {!loading && relevanteStats.length === 0 && utgaattStats.length === 0 && (
              <div className="flex w-full justify-center">
                <BodyShort>Fant ingen krav</BodyShort>
              </div>
            )}

            {/*
        DISABLED TEMPORARY
        {irrelevanteStats.length > 0 && (
          <>
            <div>
              <H3>Tema dere har filtrert bort</H3>
              <ParagraphMedium maxWidth={'574px'}>Dere har filtrert bort tema med krav som dere må kjenne til og selv vurdere om dere skal etterleve.</ParagraphMedium>
            </div>
            <div display="flex" width="100%" justifyContent="space-between" flexWrap marginTop={theme.sizing.scale550}>
              {temaListe.map((tema) => (
                <TemaCardBehandling tema={tema} stats={irrelevanteStats} behandling={behandling} key={`${tema.shortName}_panel`} irrelevant={true}/>
              ))}
            </div>
          </>
        )} */}
            <div className="w-full flex justify-end items-center">
              <ExportEtterlevelseModal etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id} />
              <Button variant="tertiary" size="small" onClick={() => setArkivModal(true)}>
                Arkivér i WebSak
              </Button>
              <ArkiveringModal
                arkivModal={arkivModal}
                setArkivModal={setArkivModal}
                etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
                etterlevelseArkiv={etterlevelseArkiv}
                setEtterlevelseArkiv={setEtterlevelseArkiv}
              />
            </div>
          </div>
        </Tabs.Panel>
        <Tabs.Panel value="prioritertKravliste">
          <div className="pt-4 flex flex-col gap-4">
            <FocusList
              allKravPriority={allKravPriority}
              etterlevelseDokumentasjon={etterlevelseDokumentasjon}
              setEtterlevelseDokumentasjon={setEtterlevelseDokumentasjon}
              relevanteStats={relevanteStats}
              utgaattStats={utgaattStats}
              temaListe={temaListe}
            />
          </div>
        </Tabs.Panel>
      </Tabs>
    </div>
  )
}
export default DokumentasjonPageTabs
