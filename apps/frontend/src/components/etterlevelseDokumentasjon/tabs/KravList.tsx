import { BodyShort, Button, Label, Loader, Select, TextField } from '@navikt/ds-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  EEtterlevelseStatus,
  ESuksesskriterieStatus,
  IKravPriorityList,
  TEtterlevelseDokumentasjonQL,
  TKravQL,
} from '../../../constants'
import { isFerdigUtfylt } from '../../../pages/EtterlevelseDokumentasjonTemaPage'
import { TTemaCode } from '../../../services/Codelist'
import { KravAccordionList } from '../KravAccordionList'
import { filterStatus, filterSuksesskriterieStatus, getNewestKravVersjon } from '../common/utils'

interface IProps {
  temaListe: TTemaCode[]
  relevanteStats: TKravQL[]
  utgaattStats: TKravQL[]
  allKravPriority: IKravPriorityList[]
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  loading: boolean
}

export const KravList = (props: IProps) => {
  const params = useParams<{ id?: string; tema?: string }>()

  const {
    temaListe,
    loading,
    relevanteStats,
    utgaattStats,
    allKravPriority,
    etterlevelseDokumentasjon,
  } = props
  const [openAccordions, setOpenAccordions] = useState<boolean[]>(temaListe.map(() => false))
  const [statusFilter, setStatusFilter] = useState<string>('ALLE')
  const [suksesskriterieStatusFilter, setSuksesskriterieStatusFilter] = useState<string>('ALLE')
  const [searchKrav, setSearchKrav] = useState<string>('')
  const [relevantKravList, setRelevantKravList] = useState<TKravQL[]>([])
  const [utgaattKravList, setUtgaattKravList] = useState<TKravQL[]>([])
  const navigate = useNavigate()

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
    let relevanteStatusListe: TKravQL[] = relevanteStats
    let utgaattStatusListe: TKravQL[] = utgaattStats
    if (statusFilter !== 'ALLE') {
      relevanteStatusListe = filterStatus(statusFilter, relevanteStatusListe)
      utgaattStatusListe = filterStatus(statusFilter, utgaattStatusListe)
    }

    if (suksesskriterieStatusFilter !== 'ALLE') {
      relevanteStatusListe = filterSuksesskriterieStatus(
        suksesskriterieStatusFilter,
        relevanteStatusListe
      )
      utgaattStatusListe = filterSuksesskriterieStatus(
        suksesskriterieStatusFilter,
        utgaattStatusListe
      )
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
  }, [relevanteStats, utgaattStats, searchKrav, statusFilter, suksesskriterieStatusFilter])

  let antallFylttKrav = 0

  getNewestKravVersjon(relevanteStats).forEach((k: TKravQL) => {
    if (k.etterlevelser.length && isFerdigUtfylt(k.etterlevelser[0].status)) {
      antallFylttKrav += 1
    }
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end w-full gap-6 py-2">
        <Label className="pb-3">Filter:</Label>
        <TextField
          label="Søk etter kravet"
          onChange={(event) => setSearchKrav(event.target.value)}
        />
        <Select
          label="Velg fullføringsgrad"
          onChange={(event) => {
            setStatusFilter(event.target.value)
          }}
        >
          <option value="ALLE">Alle</option>
          <option value={EEtterlevelseStatus.UNDER_REDIGERING}>Under arbeid</option>
          <option value={EEtterlevelseStatus.OPPFYLLES_SENERE}>Oppfylles senere</option>
          <option value="">Ikke påbegynt</option>
          <option value={EEtterlevelseStatus.FERDIG_DOKUMENTERT}>Ferdig utfylt</option>
        </Select>

        <Select
          label="Velg suksesskriterie status"
          onChange={(event) => {
            setSuksesskriterieStatusFilter(event.target.value)
          }}
        >
          <option value="ALLE">Alle</option>
          <option value={ESuksesskriterieStatus.OPPFYLT}>Oppfylt</option>
          <option value={ESuksesskriterieStatus.IKKE_RELEVANT}>Ikke relevant</option>
          <option value={ESuksesskriterieStatus.IKKE_OPPFYLT}>Ikke oppfylt</option>
          <option value={ESuksesskriterieStatus.UNDER_ARBEID}>Under arbeid</option>
        </Select>
      </div>

      <div className="flex items-center w-full pb-2">
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

      {!loading &&
        (relevanteStats.length !== 0 || utgaattStats.length !== 0) &&
        relevantKravList.length === 0 &&
        utgaattKravList.length === 0 && (
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
    </div>
  )
}

export default KravList
