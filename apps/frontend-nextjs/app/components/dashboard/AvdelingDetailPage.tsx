'use client'

import {
  DownloadIcon,
  ExclamationmarkTriangleFillIcon,
  InformationSquareIcon,
} from '@navikt/aksel-icons'
import { Events } from '@navikt/analytics-types'
import {
  Button,
  Chips,
  Heading,
  InfoCard,
  Link,
  List,
  LocalAlert,
  ReadMore,
  Search,
  Select,
  SortState,
  Tabs,
} from '@navikt/ds-react'
import { DataGrid } from '@navikt/ds-react/PREVIEW/DataGrid'
import moment from 'moment'
import { useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  getDashboardAvdelingStats,
  getDashboardTableByAvdeling,
} from '@/api/dashboard/dashboardApi'
import { getEnheterBySeksjonId } from '@/api/nom/nomApi'
import { DashboardBarCard } from '@/components/dashboard/DashboardBarCard'
import { DashboardCard } from '@/components/dashboard/DashboardCard'
import { PageLayout } from '@/components/others/scaffold/scaffold'
import {
  IAvdelingDashboardStats,
  IDashboardDetailResponse,
  IDashboardTable,
} from '@/constants/dashboard/dashboardConstants'
import { EEtterlevelseDokumentasjonStatus } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import {
  EPvkDokumentStatus,
  EPvkVurdering,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { IOrgEnhet } from '@/constants/teamkatalogen/teamkatalogConstants'
import { sporInnblikkHendelse } from '@/util/analytics/innblikk'
import { getPollyBaseUrl } from '@/util/behandling/behandlingUtil'
import { getEtterlevelseDokumentStatusText } from '@/util/etterlevelseDokumentasjon/etterlevelseDokumentasjonUtil'
import { useUrlFilterSync } from '@/util/hooks/urlFilterSync/urlFilterSync'
import { CenteredLoader } from '../common/centeredLoader/centeredLoader'
import { DashboardCopyLinkButton } from './DashboardCopyLinkButton'
import { DashboardDataGrid } from './DashboardDataGrid'
import { AvdelingDetailReadMore } from './DashboardReadmore/AvdelingDetailReadMore'
import { OppfyltCell, TrafficDot, getKravTrafficColor } from './DashboardTableCells'

interface IProps {
  avdelingId: string
}

const getBehovForPvkText = (
  pvkVurdering: EPvkVurdering,
  behandlerPersonopplysninger: boolean,
  pvkStatus: EPvkDokumentStatus
): string => {
  if (!behandlerPersonopplysninger) return 'Behandler ikke personopplysninger'
  if (!pvkVurdering || pvkVurdering === EPvkVurdering.UNDEFINED) return 'Ikke vurdert behov'
  if (pvkVurdering === EPvkVurdering.SKAL_IKKE_UTFORE) return 'Skal ikke gjennomføre PVK'
  if (pvkVurdering === EPvkVurdering.SKAL_UTFORE) return 'Skal gjennomføre PVK'
  if (pvkVurdering === EPvkVurdering.LEGGE_OVER_EKSISTERENDE)
    return pvkStatus === EPvkDokumentStatus.GODKJENT_AV_RISIKOEIER
      ? 'Skal gjennomføre PVK'
      : 'Overfører godkjent PVK'
  if (pvkVurdering === EPvkVurdering.ALLEREDE_UTFORT) return 'PVK i Word'
  return 'Ikke vurdert behov'
}

const getPvkOnlyStatusText = (
  pvkVurdering: EPvkVurdering,
  pvkStatus: EPvkDokumentStatus,
  hasPvkDocumentationStarted: boolean
): string => {
  if (!pvkVurdering || pvkVurdering === EPvkVurdering.UNDEFINED) return '-'
  if (pvkVurdering === EPvkVurdering.SKAL_IKKE_UTFORE) return '-'
  if (pvkVurdering === EPvkVurdering.ALLEREDE_UTFORT) return '-'
  if (!hasPvkDocumentationStarted) return 'Ikke påbegynt'
  if (pvkStatus === EPvkDokumentStatus.GODKJENT_AV_RISIKOEIER) return 'Godkjent av risikoeier'
  if (pvkStatus === EPvkDokumentStatus.TRENGER_GODKJENNING) return 'Sendt til godkjenning'
  if (
    pvkStatus === EPvkDokumentStatus.SENDT_TIL_PVO ||
    pvkStatus === EPvkDokumentStatus.PVO_UNDERARBEID ||
    pvkStatus === EPvkDokumentStatus.SENDT_TIL_PVO_FOR_REVURDERING
  )
    return 'Til behandling hos PVO'
  if (
    pvkStatus === EPvkDokumentStatus.VURDERT_AV_PVO ||
    pvkStatus === EPvkDokumentStatus.VURDERT_AV_PVO_TRENGER_MER_ARBEID
  )
    return 'Tilbakemelding fra PVO'
  return 'Under arbeid'
}

const AvdelingDetailPage = ({ avdelingId }: IProps) => {
  const searchParams = useSearchParams()
  const [data, setData] = useState<IDashboardDetailResponse>()
  const [tableData, settableData] = useState<IDashboardTable[]>()
  const [isLoading, setIsLoading] = useState(true)
  const [isTableLoading, setIsTableLoading] = useState(true)
  const [selectedSeksjon, setSelectedSeksjon] = useState<string>(
    () => searchParams.get('seksjon') ?? ''
  )
  const [selectedEnhet, setSelectedEnhet] = useState<string>(() => searchParams.get('enhet') ?? '')
  const [enhetOptions, setEnhetOptions] = useState<IOrgEnhet[]>([])
  const [tableTab, setTableTab] = useState(() => searchParams.get('tab') ?? 'dok_pvk')
  const navigasjonsMetode = useRef<'click' | 'keyboard' | undefined>(undefined)
  const [sort, setSort] = useState<SortState | undefined>()
  const [searchFilters, setSearchFilters] = useState<string[]>(() => searchParams.getAll('sok'))
  const [searchValue, setSearchValue] = useState<string>('')

  const shareUrl = useUrlFilterSync({
    seksjon: selectedSeksjon,
    enhet: selectedEnhet,
    sok: searchFilters,
    tab: tableTab === 'dok_pvk' ? undefined : tableTab,
  })

  useEffect(() => {
    ;(async () => {
      await getDashboardAvdelingStats(avdelingId)
        .then((response) => {
          response.statsBySeksjon = new Map(Object.entries(response.statsBySeksjon ?? {}))
          setData(response)
        })
        .finally(() => setIsLoading(false))

      await getDashboardTableByAvdeling(avdelingId)
        .then(settableData)
        .finally(() => setIsTableLoading(false))
    })()
  }, [avdelingId])

  useEffect(() => {
    const hasValidSeksjon = selectedSeksjon && selectedSeksjon !== 'ingen-seksjon'
    const promise = hasValidSeksjon ? getEnheterBySeksjonId(selectedSeksjon) : Promise.resolve([])
    promise
      .then((result) => {
        setEnhetOptions(result)
        if (!hasValidSeksjon) {
          setSelectedEnhet('')
        }
      })
      .catch(() => {
        setEnhetOptions([])
        setSelectedEnhet('')
      })
  }, [selectedSeksjon])

  const getSearchableText = (dok: IDashboardTable): string => {
    return [
      `E${dok.etterlevelseNummer} ${dok.etterlevelseDokumentasjonTittel}`,
      dok.teamsData?.map((t) => t.name)?.join(' ') ?? '',
      dok.resourcesData?.map((r) => r.fullName)?.join(' ') ?? '',
      dok.risikoeiereData?.map((r) => r.fullName)?.join(' ') ?? '',
      dok.behandlinger?.map((b) => `B${b.nummer} ${b.navn}`)?.join(' ') ?? '',
      dok.ikkePaabegynt
        ? 'Ikke påbegynt'
        : getEtterlevelseDokumentStatusText(dok.etterlevelseDokumentasjonStatus),
      getBehovForPvkText(dok.pvkVurdering, dok.behandlerPersonopplysninger, dok.pvkStatus),
      getPvkOnlyStatusText(dok.pvkVurdering, dok.pvkStatus, dok.hasPvkDocumentationStarted),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
  }

  const addSearchFilter = (term: string) => {
    const trimmed = term.trim()
    if (trimmed && !searchFilters.includes(trimmed)) {
      setSearchFilters((prev) => [...prev, trimmed])
    }
  }

  const removeSearchFilter = (term: string) => {
    setSearchFilters((prev) => prev.filter((f) => f !== term))
  }

  const getFilteredDoks = (): IDashboardTable[] => {
    if (tableData) {
      let filtered: IDashboardTable[]
      if (selectedSeksjon === 'ingen-seksjon') {
        filtered = tableData.filter(
          (etterlevelseDokTableValue) => !etterlevelseDokTableValue.seksjoner?.length
        )
      } else if (selectedSeksjon) {
        filtered = tableData.filter((etterlevelseDokTableValue) =>
          etterlevelseDokTableValue.seksjoner.map((s) => s.nomSeksjonId).includes(selectedSeksjon)
        )
      } else {
        filtered = tableData
      }

      if (selectedEnhet === 'ingen-enhet') {
        filtered = filtered.filter((dok) => !dok.enheter?.length)
      } else if (selectedEnhet) {
        filtered = filtered.filter((dok) =>
          dok.enheter?.some((e) => e.nomEnhetId === selectedEnhet)
        )
      }

      return filtered
    } else {
      return []
    }
  }

  const sortedDoks = useMemo(() => {
    let filtered = getFilteredDoks()

    if (searchFilters.length > 0) {
      filtered = filtered.filter((dok) => {
        const text = getSearchableText(dok)
        return searchFilters.some((filter) => text.includes(filter.toLowerCase()))
      })
    }

    if (!sort) {
      return filtered
    }

    const dir = sort.direction === 'ascending' ? 1 : -1
    return [...filtered].sort((a, b) => {
      const getValue = (dok: typeof a): string | number => {
        switch (sort.orderBy) {
          case 'dok':
            return `E${dok.etterlevelseNummer} ${dok.etterlevelseDokumentasjonTittel}`
          case 'team':
            return dok.teamsData?.map((teamsData) => teamsData.name).join(', ') || ''
          case 'person':
            return dok.resourcesData?.map((resource) => resource.fullName).join(', ') || ''
          case 'risikoeier':
            return dok.risikoeiereData?.map((risikoeier) => risikoeier.fullName).join(', ') || ''
          case 'seksjon':
            return dok.seksjoner?.map((s) => s.nomSeksjonName).join(', ') || ''
          case 'enhet':
            return dok.enheter?.map((e) => e.nomEnhetName).join(', ') || ''
          case 'etterlevelse':
            return dok.ikkePaabegynt
              ? 'Ikke påbegynt'
              : getEtterlevelseDokumentStatusText(dok.etterlevelseDokumentasjonStatus)
          case 'behovForPvk':
            return getBehovForPvkText(
              dok.pvkVurdering,
              dok.behandlerPersonopplysninger,
              dok.pvkStatus
            )
          case 'pvkStatus':
            return getPvkOnlyStatusText(
              dok.pvkVurdering,
              dok.pvkStatus,
              dok.hasPvkDocumentationStarted
            )
          case 'dato_etterlvelse':
            return dok.sistOppdatertEtterlevelse || ''
          case 'dato_godkjent':
            return dok.sistGodkjentEtterlevelse || ''
          case 'dato_pvk':
            return dok.sistOppdatertPvk || ''
          case 'dato_godkjent_pvk':
            return dok.sistGodkjentPvk || ''
          case 'behandlinger':
            return dok.behandlinger?.map((b) => b.navn).join(', ') || ''
          case 'krav':
            return dok.antallOppfyltKrav || 0
          case 'oppfylt': {
            return dok.oppfyltKravProsent && dok.oppfyltKravProsent > 0 ? dok.oppfyltKravProsent : 0
          }
          case 'antallScenarioer':
            return dok.antallRisikoscenario || 0
          case 'hoyRisiko':
            return dok.antallHoyRisikoscenario || 0
          case 'hoyRisikoEtterTiltak':
            return dok.antallHoyRisikoEtterTiltak || 0
          case 'antallTiltak':
            return dok.antallTiltak || 0
          case 'ikkeIverksatte':
            return dok.antallIkkeIverksattTiltak || 0
          case 'fristPassert':
            return dok.antallTiltakFristPassert || 0
          default:
            return ''
        }
      }
      const aVal = getValue(a)
      const bVal = getValue(b)
      if (typeof aVal === 'number' && typeof bVal === 'number') return (aVal - bVal) * dir
      return String(aVal).localeCompare(String(bVal)) * dir
    })
  }, [sort, tableData, selectedSeksjon, selectedEnhet, searchFilters])

  const hasEnheter = useMemo(() => {
    return tableData?.some((dok) => dok.enheter && dok.enheter.length > 0) ?? false
  }, [tableData])

  const pvkTotals = useMemo(() => {
    return sortedDoks.reduce(
      (acc, dok) => {
        acc.antallRisikoscenario += dok.antallRisikoscenario || 0
        acc.antallHoyRisikoscenario += dok.antallHoyRisikoscenario || 0
        acc.antallHoyRisikoEtterTiltak += dok.antallHoyRisikoEtterTiltak || 0
        acc.antallTiltak += dok.antallTiltak || 0
        acc.antallIkkeIverksattTiltak += dok.antallIkkeIverksattTiltak || 0
        acc.antallTiltakFristPassert += dok.antallTiltakFristPassert || 0
        return acc
      },
      {
        antallRisikoscenario: 0,
        antallHoyRisikoscenario: 0,
        antallHoyRisikoEtterTiltak: 0,
        antallTiltak: 0,
        antallIkkeIverksattTiltak: 0,
        antallTiltakFristPassert: 0,
      }
    )
  }, [sortedDoks])

  const dokPvkColumns = useMemo<DataGrid.Columns<IDashboardTable>>(
    () => [
      {
        id: 'dok',
        header: 'Etterlevelsesdokument',
        headerCell: (
          <>
            <span className='flex flex-col'>
              <span>Etterlevelsesdokument</span>
              <span className='font-normal'>(Lenker åpnes i ny fane)</span>
            </span>
          </>
        ),
        isSortable: true,
        isRowHeader: true,

        bodyCell: (dok) => (
          <div className='whitespace-normal wrap-break-word'>
            <div className='dashboard-cell-doc-content'>
              <Link href={`/dokumentasjon/${dok.etterlevelseDokumentasjonId}`} target='_blank'>
                E{dok.etterlevelseNummer}.{dok.etterlevelseDokumentVersjon}{' '}
                {dok.etterlevelseDokumentasjonTittel}
              </Link>
            </div>
          </div>
        ),
      },
      {
        id: 'etterlevelse',
        header: 'Etterlevelse',

        isSortable: true,

        bodyCell: (dok) => (
          <div className='whitespace-nowrap'>
            {dok.ikkePaabegynt
              ? 'Ikke p\u00e5begynt'
              : getEtterlevelseDokumentStatusText(dok.etterlevelseDokumentasjonStatus)}
          </div>
        ),
      },
      {
        id: 'behovForPvk',
        header: 'Vurdere behov for PVK',

        isSortable: true,

        bodyCell: (dok) => (
          <div className='whitespace-nowrap'>
            {getBehovForPvkText(dok.pvkVurdering, dok.behandlerPersonopplysninger, dok.pvkStatus)}
          </div>
        ),
      },
      {
        id: 'pvkStatus',
        header: 'Digital PVK status',

        isSortable: true,

        bodyCell: (dok) => (
          <div className='whitespace-nowrap'>
            {getPvkOnlyStatusText(dok.pvkVurdering, dok.pvkStatus, dok.hasPvkDocumentationStarted)}
          </div>
        ),
      },
      {
        id: 'behandlinger',
        header: 'Behandlinger',
        headerCell: (
          <>
            <span className='flex flex-col'>
              <span>Behandlinger</span>
              <span className='font-normal'>(Lenker åpnes i ny fane)</span>
            </span>
          </>
        ),
        isSortable: true,

        bodyCell: (dok) => (
          <div className='whitespace-normal min-w-[75ch] max-w-[75ch] wrap-break-word'>
            {dok.behandlinger?.map((b) => (
              <div key={b.id}>
                <Link href={`${getPollyBaseUrl()}process/${b.id}`} target='_blank'>
                  B{b.nummer} {b.navn}
                </Link>
              </div>
            )) || '-'}
          </div>
        ),
      },
      {
        id: 'seksjon',
        header: 'Seksjon',

        isSortable: true,

        bodyCell: (dok) => (
          <div className='whitespace-nowrap'>
            {dok.seksjoner?.length
              ? dok.seksjoner.map((s) => <div key={s.nomSeksjonId}>{s.nomSeksjonName}</div>)
              : '-'}
          </div>
        ),
      },
      ...(hasEnheter
        ? [
            {
              id: 'enhet',
              header: 'Enhet',

              isSortable: true,

              bodyCell: (dok) => (
                <div className='whitespace-nowrap'>
                  {dok.enheter?.length
                    ? dok.enheter.map((e) => <div key={e.nomEnhetId}>{e.nomEnhetName}</div>)
                    : '-'}
                </div>
              ),
            } satisfies DataGrid.Columns<IDashboardTable>[number],
          ]
        : []),
      {
        id: 'risikoeier',
        header: 'Risikoeier',

        isSortable: true,

        bodyCell: (dok) => (
          <div className='whitespace-nowrap'>
            {dok.risikoeiereData && dok.risikoeiereData.length > 0
              ? dok.risikoeiereData.map((risikoeier, index) => (
                  <div key={`${risikoeier.navIdent}-${index}`}>{risikoeier.fullName}</div>
                ))
              : '-'}
          </div>
        ),
      },
      {
        id: 'team',
        header: 'Team',

        isSortable: true,

        bodyCell: (dok) => (
          <div className='whitespace-nowrap'>
            {dok.teamsData && dok.teamsData.length > 0
              ? dok.teamsData.map((team, index) => (
                  <div key={`${team.id}-${index}`}>{team.name}</div>
                ))
              : '-'}
          </div>
        ),
      },
      {
        id: 'person',
        header: 'Person',

        isSortable: true,

        bodyCell: (dok) => (
          <div className='whitespace-nowrap'>
            {dok.resourcesData && dok.resourcesData.length > 0
              ? dok.resourcesData.map((resource, index) => (
                  <div key={`${resource.navIdent}-${index}`}>{resource.fullName}</div>
                ))
              : '-'}
          </div>
        ),
      },
    ],
    [hasEnheter]
  )

  const kravColumns = useMemo<DataGrid.Columns<IDashboardTable>>(
    () => [
      {
        id: 'dok',
        header: 'Etterlevelsesdokument',
        headerCell: (
          <>
            <span className='flex flex-col'>
              <span>Etterlevelsesdokument</span>
              <span className='font-normal'>(Lenker åpnes i ny fane)</span>
            </span>
          </>
        ),
        isSortable: true,
        isRowHeader: true,

        bodyCell: (dok) => (
          <div className='whitespace-normal wrap-break-word'>
            <div className='dashboard-cell-doc-content'>
              <Link href={`/dokumentasjon/${dok.etterlevelseDokumentasjonId}`} target='_blank'>
                E{dok.etterlevelseNummer}.{dok.etterlevelseDokumentVersjon}{' '}
                {dok.etterlevelseDokumentasjonTittel}
              </Link>
            </div>
          </div>
        ),
      },
      {
        id: 'krav',
        header: 'Antall krav ferdig utfylt',

        isSortable: true,

        align: 'center',
        bodyCell: (dok) => (
          <div className='whitespace-nowrap'>
            <TrafficDot
              color={getKravTrafficColor(dok.antallOppfyltKrav || 0, dok.antallKrav || 0)}
            />
            {dok.antallOppfyltKrav} av {dok.antallKrav}
          </div>
        ),
      },
      {
        id: 'oppfylt',
        header: 'Oppfylte suksesskriterier',

        isSortable: true,

        align: 'center',
        bodyCell: (dok) => (
          <div className='whitespace-nowrap'>
            <OppfyltCell dok={dok} />
          </div>
        ),
      },
      {
        id: 'dato_etterlvelse',
        header: 'Sist oppdatert',

        isSortable: true,

        bodyCell: (dok) => (
          <div className='whitespace-nowrap'>
            {dok.sistOppdatertEtterlevelse
              ? moment(dok.sistOppdatertEtterlevelse).format('D. MMMM YYYY')
              : '-'}
          </div>
        ),
      },
      {
        id: 'dato_godkjent',
        header: 'Sist godkjent',

        isSortable: true,

        bodyCell: (dok) => (
          <div className='whitespace-nowrap'>
            {dok.sistGodkjentEtterlevelse
              ? moment(dok.sistGodkjentEtterlevelse).format('D. MMMM YYYY')
              : 'Ikke godkjent i ny løsning'}
          </div>
        ),
      },
      {
        id: 'risikoeier',
        header: 'Risikoeier',

        isSortable: true,

        bodyCell: (dok) => (
          <div className='whitespace-nowrap'>
            {dok.risikoeiereData && dok.risikoeiereData.length > 0
              ? dok.risikoeiereData.map((risikoeier, index) => (
                  <div key={`${risikoeier.navIdent}-${index}`}>{risikoeier.fullName}</div>
                ))
              : '-'}
          </div>
        ),
      },
      {
        id: 'team',
        header: 'Team',

        isSortable: true,

        bodyCell: (dok) => (
          <div className='whitespace-nowrap'>
            {dok.teamsData && dok.teamsData.length > 0
              ? dok.teamsData.map((team, index) => (
                  <div key={`${team.id}-${index}`}>{team.name}</div>
                ))
              : '-'}
          </div>
        ),
      },
      {
        id: 'person',
        header: 'Person',

        isSortable: true,

        bodyCell: (dok) => (
          <div className='whitespace-nowrap'>
            {dok.resourcesData && dok.resourcesData.length > 0
              ? dok.resourcesData.map((resource, index) => (
                  <div key={`${resource.navIdent}-${index}`}>{resource.fullName}</div>
                ))
              : '-'}
          </div>
        ),
      },
    ],
    []
  )

  const pvkColumns = useMemo<DataGrid.Columns<IDashboardTable>>(
    () => [
      {
        id: 'dok',
        header: 'Etterlevelsesdokument',
        headerCell: (
          <>
            <span className='flex flex-col'>
              <span>Etterlevelsesdokument</span>
              <span className='font-normal'>(Lenker åpnes i ny fane)</span>
            </span>
          </>
        ),
        isSortable: true,
        isRowHeader: true,

        bodyCell: (dok) => (
          <div className='whitespace-normal wrap-break-word'>
            <div className='dashboard-cell-doc-content'>
              <Link href={`/dokumentasjon/${dok.etterlevelseDokumentasjonId}`} target='_blank'>
                E{dok.etterlevelseNummer}.{dok.etterlevelseDokumentVersjon}{' '}
                {dok.etterlevelseDokumentasjonTittel}
              </Link>
            </div>
          </div>
        ),
      },
      {
        id: 'behovForPvk',
        header: 'Vurdere behov for PVK',

        isSortable: true,

        bodyCell: (dok) => (
          <div className='whitespace-nowrap'>
            {getBehovForPvkText(dok.pvkVurdering, dok.behandlerPersonopplysninger, dok.pvkStatus)}
          </div>
        ),
      },
      {
        id: 'pvkStatus',
        header: 'Digital PVK status',

        isSortable: true,

        bodyCell: (dok) => (
          <div className='whitespace-nowrap'>
            {getPvkOnlyStatusText(dok.pvkVurdering, dok.pvkStatus, dok.hasPvkDocumentationStarted)}
          </div>
        ),
      },
      {
        id: 'antallScenarioer',
        header: 'Antall risikoscenarioer',
        headerCell: (
          <>
            <span className='whitespace-nowrap'>
              Antall risikoscenarioer{' '}
              <span className='font-normal'>({pvkTotals.antallRisikoscenario})</span>
            </span>
          </>
        ),
        isSortable: true,

        align: 'center',
        bodyCell: (dok) => (
          <div className='whitespace-nowrap'>
            {dok.antallRisikoscenario ? dok.antallRisikoscenario : '-'}
          </div>
        ),
      },
      {
        id: 'hoyRisiko',
        header: 'Høy risiko',
        headerCell: (
          <>
            <span className='whitespace-nowrap'>
              Høy risiko før tiltak{' '}
              <span className='font-normal'>({pvkTotals.antallHoyRisikoscenario})</span>
            </span>
          </>
        ),
        isSortable: true,

        align: 'center',
        bodyCell: (dok) => (
          <div className='whitespace-nowrap'>
            {dok.antallHoyRisikoscenario ? (
              <span className='inline-flex items-center'>
                <TrafficDot color='#C30000' />
                {dok.antallHoyRisikoscenario}
              </span>
            ) : (
              '-'
            )}
          </div>
        ),
      },
      {
        id: 'hoyRisikoEtterTiltak',
        header: 'Høy risiko etter tiltak',
        headerCell: (
          <>
            <span className='whitespace-nowrap'>
              Høy risiko etter tiltak{' '}
              <span className='font-normal'>({pvkTotals.antallHoyRisikoEtterTiltak})</span>
            </span>
          </>
        ),
        isSortable: true,

        align: 'center',
        bodyCell: (dok) => (
          <div className='whitespace-nowrap'>
            {dok.antallHoyRisikoEtterTiltak ? (
              <span className='inline-flex items-center'>
                <TrafficDot color='#C30000' />
                {dok.antallHoyRisikoEtterTiltak}
              </span>
            ) : (
              '-'
            )}
          </div>
        ),
      },
      {
        id: 'antallTiltak',
        header: 'Antall tiltak',
        headerCell: (
          <>
            <span className='whitespace-nowrap'>
              Antall tiltak <span className='font-normal'>({pvkTotals.antallTiltak})</span>
            </span>
          </>
        ),
        isSortable: true,

        align: 'center',
        bodyCell: (dok) => <div className='whitespace-nowrap'>{dok.antallTiltak ?? '-'}</div>,
      },
      {
        id: 'ikkeIverksatte',
        header: 'Ikke iverksatte tiltak',
        headerCell: (
          <>
            <span className='whitespace-nowrap'>
              Ikke iverksatte tiltak{' '}
              <span className='font-normal'>({pvkTotals.antallIkkeIverksattTiltak})</span>
            </span>
          </>
        ),
        isSortable: true,

        align: 'center',
        bodyCell: (dok) => (
          <div className='whitespace-nowrap'>
            {dok.antallIkkeIverksattTiltak ? dok.antallIkkeIverksattTiltak : '-'}
          </div>
        ),
      },
      {
        id: 'fristPassert',
        header: 'Tiltaksfrist passert',
        headerCell: (
          <>
            <span className='whitespace-nowrap'>
              Tiltaksfrist passert{' '}
              <span className='font-normal'>({pvkTotals.antallTiltakFristPassert})</span>
            </span>
          </>
        ),
        isSortable: true,

        align: 'center',
        bodyCell: (dok) => (
          <div className='whitespace-nowrap'>
            {dok.antallTiltakFristPassert ? (
              <span className='inline-flex items-center'>
                <TrafficDot color='#C30000' />
                {dok.antallTiltakFristPassert}
              </span>
            ) : (
              '-'
            )}
          </div>
        ),
      },
      {
        id: 'dato_pvk',
        header: 'Sist oppdatert',

        isSortable: true,

        bodyCell: (dok) => (
          <div className='whitespace-nowrap'>
            {dok.sistOppdatertPvk ? moment(dok.sistOppdatertPvk).format('D. MMMM YYYY') : '-'}
          </div>
        ),
      },
      {
        id: 'dato_godkjent_pvk',
        header: 'Sist godkjent',

        isSortable: true,

        bodyCell: (dok) => (
          <div className='whitespace-nowrap'>
            {dok.sistGodkjentPvk
              ? moment(dok.sistGodkjentPvk).format('D. MMMM YYYY')
              : 'Ikke godkjent i ny løsning'}
          </div>
        ),
      },
      {
        id: 'risikoeier',
        header: 'Risikoeier',

        isSortable: true,

        bodyCell: (dok) => (
          <div className='whitespace-nowrap'>
            {dok.risikoeiereData && dok.risikoeiereData.length > 0
              ? dok.risikoeiereData.map((risikoeier, index) => (
                  <div key={`${risikoeier.navIdent}-${index}`}>{risikoeier.fullName}</div>
                ))
              : '-'}
          </div>
        ),
      },
      {
        id: 'team',
        header: 'Team',

        isSortable: true,

        bodyCell: (dok) => (
          <div className='whitespace-nowrap'>
            {dok.teamsData && dok.teamsData.length > 0
              ? dok.teamsData.map((team, index) => (
                  <div key={`${team.id}-${index}`}>{team.name}</div>
                ))
              : '-'}
          </div>
        ),
      },
      {
        id: 'person',
        header: 'Person',

        isSortable: true,

        bodyCell: (dok) => (
          <div className='whitespace-nowrap'>
            {dok.resourcesData && dok.resourcesData.length > 0
              ? dok.resourcesData.map((resource, index) => (
                  <div key={`${resource.navIdent}-${index}`}>{resource.fullName}</div>
                ))
              : '-'}
          </div>
        ),
      },
    ],
    [pvkTotals]
  )

  if (isLoading || data == null) {
    return (
      <PageLayout pageTitle='Dashboard' currentPage='Dashboard' breadcrumbPaths={[]}>
        <CenteredLoader />
      </PageLayout>
    )
  }

  const getCurrentStats = (): IAvdelingDashboardStats => {
    if (selectedSeksjon && data.statsBySeksjon.has(selectedSeksjon)) {
      return data.statsBySeksjon.get(selectedSeksjon)!
    } else {
      return data
    }
  }

  const computeStatsFromDoks = (doks: IDashboardTable[]): IAvdelingDashboardStats => {
    const total = doks.length
    const ikkePaabegynt = doks.filter(
      (d) =>
        d.etterlevelseDokumentasjonStatus === EEtterlevelseDokumentasjonStatus.UNDER_ARBEID &&
        d.ikkePaabegynt === true
    ).length
    const underArbeid = doks.filter(
      (d) =>
        d.etterlevelseDokumentasjonStatus === EEtterlevelseDokumentasjonStatus.UNDER_ARBEID &&
        !d.ikkePaabegynt
    ).length
    const sendtTilGodkjenning = doks.filter(
      (d) =>
        d.etterlevelseDokumentasjonStatus ===
        EEtterlevelseDokumentasjonStatus.SENDT_TIL_GODKJENNING_TIL_RISIKOEIER
    ).length
    const godkjent = doks.filter(
      (d) =>
        d.etterlevelseDokumentasjonStatus ===
        EEtterlevelseDokumentasjonStatus.GODKJENT_AV_RISIKOEIER
    ).length

    const medPersonopplysninger = doks.filter((d) => d.behandlerPersonopplysninger)
    const ikkeVurdertBehov = medPersonopplysninger.filter(
      (d) => !d.pvkVurdering || d.pvkVurdering === EPvkVurdering.UNDEFINED
    ).length
    const vurdertIkkeBehov = medPersonopplysninger.filter(
      (d) => d.pvkVurdering === EPvkVurdering.SKAL_IKKE_UTFORE
    ).length
    const leggeOver = medPersonopplysninger.filter(
      (d) => d.pvkVurdering === EPvkVurdering.LEGGE_OVER_EKSISTERENDE
    )
    const leggeOverGodkjent = leggeOver.filter(
      (d) => d.pvkStatus === EPvkDokumentStatus.GODKJENT_AV_RISIKOEIER
    ).length
    const behovIkkePaabegynt =
      medPersonopplysninger.filter((d) => d.pvkVurdering === EPvkVurdering.SKAL_UTFORE).length +
      leggeOverGodkjent
    const overforerGodkjentPvk = leggeOver.length - leggeOverGodkjent
    const pvkIWord = medPersonopplysninger.filter(
      (d) => d.pvkVurdering === EPvkVurdering.ALLEREDE_UTFORT
    ).length

    const digitalePvk = doks.filter(
      (d) =>
        d.pvkVurdering === EPvkVurdering.SKAL_UTFORE ||
        d.pvkVurdering === EPvkVurdering.LEGGE_OVER_EKSISTERENDE
    )

    const pvkIkkePaabegynt = digitalePvk.filter((d) => !d.hasPvkDocumentationStarted).length
    const pvkGodkjent = digitalePvk.filter(
      (d) => d.pvkStatus === EPvkDokumentStatus.GODKJENT_AV_RISIKOEIER
    ).length
    const pvkTilBehandling = digitalePvk.filter(
      (d) =>
        d.hasPvkDocumentationStarted &&
        (d.pvkStatus === EPvkDokumentStatus.SENDT_TIL_PVO ||
          d.pvkStatus === EPvkDokumentStatus.PVO_UNDERARBEID ||
          d.pvkStatus === EPvkDokumentStatus.SENDT_TIL_PVO_FOR_REVURDERING)
    ).length
    const pvkTilbakemelding = digitalePvk.filter(
      (d) =>
        d.hasPvkDocumentationStarted &&
        (d.pvkStatus === EPvkDokumentStatus.VURDERT_AV_PVO ||
          d.pvkStatus === EPvkDokumentStatus.VURDERT_AV_PVO_TRENGER_MER_ARBEID)
    ).length
    const pvkSendtTilGodkjenning = digitalePvk.filter(
      (d) => d.hasPvkDocumentationStarted && d.pvkStatus === EPvkDokumentStatus.TRENGER_GODKJENNING
    ).length
    const pvkUnderArbeid =
      digitalePvk.length -
      pvkIkkePaabegynt -
      pvkGodkjent -
      pvkTilBehandling -
      pvkTilbakemelding -
      pvkSendtTilGodkjenning

    const baseStats = getCurrentStats()

    const sk = doks.reduce(
      (acc, d) => ({
        total: acc.total + (d.suksesskriterier?.total ?? 0),
        ikkePaabegynt: acc.ikkePaabegynt + (d.suksesskriterier?.ikkePaabegyntAntall ?? 0),
        underArbeid: acc.underArbeid + (d.suksesskriterier?.underArbeidAntall ?? 0),
        oppfylt: acc.oppfylt + (d.suksesskriterier?.oppfyltAntall ?? 0),
        ikkeOppfylt: acc.ikkeOppfylt + (d.suksesskriterier?.ikkeOppfyltAntall ?? 0),
        ikkeRelevant: acc.ikkeRelevant + (d.suksesskriterier?.ikkeRelevantAntall ?? 0),
      }),
      { total: 0, ikkePaabegynt: 0, underArbeid: 0, oppfylt: 0, ikkeOppfylt: 0, ikkeRelevant: 0 }
    )
    const skProsent = (antall: number) => (sk.total > 0 ? Math.round((antall / sk.total) * 100) : 0)

    return {
      ...baseStats,
      dokumenter: {
        total,
        ikkePaabegynt,
        underArbeid,
        sendtTilGodkjenning,
        godkjentAvRisikoeier: godkjent,
      },
      suksesskriterier: {
        total: sk.total,
        ikkePaabegyntAntall: sk.ikkePaabegynt,
        underArbeidAntall: sk.underArbeid,
        oppfyltAntall: sk.oppfylt,
        ikkeOppfyltAntall: sk.ikkeOppfylt,
        ikkeRelevantAntall: sk.ikkeRelevant,
        ikkePaabegyntProsent: skProsent(sk.ikkePaabegynt),
        underArbeidProsent: skProsent(sk.underArbeid),
        oppfyltProsent: skProsent(sk.oppfylt),
        ikkeOppfyltProsent: skProsent(sk.ikkeOppfylt),
        ikkeRelevantProsent: skProsent(sk.ikkeRelevant),
      },
      behovForPvk: {
        totalMedPersonopplysninger: medPersonopplysninger.length,
        ikkeVurdertBehov,
        vurdertIkkeBehov,
        behovIkkePaabegynt,
        overforerGodkjentPvk,
      },
      pvk: {
        total: digitalePvk.length + pvkIWord,
        ikkePaabegynt: pvkIkkePaabegynt,
        underArbeid: pvkUnderArbeid,
        tilBehandlingHosPvo: pvkTilBehandling,
        tilbakemeldingFraPvo: pvkTilbakemelding,
        sendtTilGodkjenning: pvkSendtTilGodkjenning,
        godkjentAvRisikoeier: pvkGodkjent,
        pvkIWord,
      },
    }
  }

  const getDisplayStats = (): IAvdelingDashboardStats => {
    if (searchFilters.length > 0 || selectedEnhet) {
      return computeStatsFromDoks(sortedDoks)
    }
    return getCurrentStats()
  }

  return (
    <PageLayout
      pageTitle={data ? data.avdelingNavn : ''}
      currentPage={data ? data.avdelingNavn : ''}
      breadcrumbPaths={[{ href: '/dashboard', pathName: 'Dashboard' }]}
    >
      <div className='mt-4'>
        <Heading size='large' level='1'>
          {data.avdelingNavn}
        </Heading>
      </div>

      <ReadMore header='Hvordan bruker jeg denne siden?' className='mt-4 mb-4 max-w-[75ch]'>
        <p>På denne siden kan du:</p>
        <List className='mt-4'>
          <List.Item>
            Se figurer og lese nøkkeltall om avdelingens nåværende etterlevelser og
            personvernkonsekvensvurderinger (PVK-er).
          </List.Item>
          <List.Item>
            Utforske nærmere i tabeller, hvilke etterlevelser og PVK-er som finnes, hvem de
            tilhører, etterlevelsens nåværende tilstand, med mer.
          </List.Item>
          <List.Item>
            Søke og filtrere i datasettet: du kan finne seksjon, enhet, team, risikoeier,
            dokumentnavn, med flere. Du kan også sortere tabellene, for eksempel etter teamnavn.
          </List.Item>
        </List>
        <p className='mt-4'>
          For mer detaljer anbefaler vi informasjonssidene{' '}
          <Link href='/omstottetiletterlevelse' target='_blank'>
            Om Støtte til etterlevelse
          </Link>
          ,{' '}
          <Link href='/om-pvk' target='_blank'>
            Om Digital PVK
          </Link>{' '}
          og{' '}
          <Link href='/om-behandlingskatalogen' target='_blank'>
            Om Behandlingskatalogen
          </Link>
          .
        </p>
      </ReadMore>

      {avdelingId === 'ingen-avdeling' && (
        <LocalAlert status='warning' className='mt-4 mb-4' aria-live='off'>
          <LocalAlert.Header>
            <LocalAlert.Title as='h2'>
              Disse etterlevelsesdokumentene mangler avdeling og/eller seksjon
            </LocalAlert.Title>
          </LocalAlert.Header>
          <LocalAlert.Content>
            <ul>
              <li>
                Det er viktig at alle oppdaterer informasjon om avdeling og seksjon i
                etterlevelsesdokumentene sine.
              </li>
              <li>
                Dersom du oppdager etterlevelsesdokumenter som ikke er aktuelle lenger, ta kontakt
                med Team Datajegerne på #etterlevelse på slack.
              </li>
            </ul>
          </LocalAlert.Content>
        </LocalAlert>
      )}

      <div className='rounded-lg px-6 py-4' style={{ backgroundColor: '#e3eff7' }}>
        <div className='flex justify-between items-start gap-4'>
          <div className='flex gap-4 flex-wrap items-end'>
            {data.seksjoner && data.seksjoner.length > 0 && (
              <>
                <Select
                  label='Velg seksjon'
                  className='mt-4 w-fit min-w-64'
                  value={selectedSeksjon}
                  onChange={(e) => {
                    setSelectedSeksjon(e.target.value)
                    setSelectedEnhet('')
                  }}
                >
                  <option value=''>Alle seksjoner</option>
                  {data.seksjoner
                    .filter((s) => s.navn !== data.avdelingNavn)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.navn}
                      </option>
                    ))}
                </Select>

                {selectedSeksjon &&
                  selectedSeksjon !== 'ingen-seksjon' &&
                  enhetOptions.length > 0 && (
                    <Select
                      label='Velg enhet'
                      className='mt-4 w-fit min-w-64'
                      value={selectedEnhet}
                      onChange={(e) => setSelectedEnhet(e.target.value)}
                    >
                      <option value=''>Alle enheter</option>
                      {[...enhetOptions]
                        .sort((a, b) => a.navn.localeCompare(b.navn))
                        .map((e) => (
                          <option key={e.id} value={e.id}>
                            {e.navn}
                          </option>
                        ))}
                      <option value='ingen-enhet'>Ikke valgt enhet</option>
                    </Select>
                  )}
              </>
            )}
          </div>
        </div>

        <div className='mt-4'>
          <form
            role='search'
            onSubmit={(e) => {
              e.preventDefault()
              addSearchFilter(searchValue)
              setSearchValue('')
            }}
          >
            <Search
              label='Søk etter team, personer eller dokumentnavn'
              description='Trykk Enter for å legge til søkeord. Du kan velge flere.'
              hideLabel={false}
              variant='secondary'
              value={searchValue}
              onChange={setSearchValue}
              onClear={() => setSearchValue('')}
            />
          </form>
        </div>

        {searchFilters.length > 0 && (
          <Chips className='mt-4'>
            {searchFilters.map((filter) => (
              <Chips.Removable key={filter} onDelete={() => removeSearchFilter(filter)}>
                {filter}
              </Chips.Removable>
            ))}
          </Chips>
        )}

        <div className='flex flex-row flex-wrap items-center gap-4 mt-5'>
          <DashboardCopyLinkButton url={shareUrl} />
          <Button
            variant='tertiary'
            size='small'
            icon={<DownloadIcon aria-hidden />}
            onClick={() => {
              const stats = getDisplayStats()
              const BOM = '\uFEFF'
              const seksjonNavn =
                selectedSeksjon === 'ingen-seksjon'
                  ? 'Ikke valgt seksjon'
                  : data.seksjoner?.find((s) => s.id === selectedSeksjon)?.navn
              const enhetNavn =
                selectedEnhet === 'ingen-enhet'
                  ? 'Ikke valgt enhet'
                  : enhetOptions.find((e) => e.id === selectedEnhet)?.navn
              const filterLines = [
                `Avdeling;${data.avdelingNavn}`,
                `Seksjon;${seksjonNavn || 'Alle seksjoner'}`,
                ...(enhetOptions.length > 0 ? [`Enhet;${enhetNavn || 'Alle enheter'}`] : []),
                ...(searchFilters.length > 0 ? [`Søkefilter;${searchFilters.join(', ')}`] : []),
                '',
              ]
              const header = [
                'Etterlevelsesdokumenter totalt',
                'Etterlevelsesdokumenter - ikke påbegynt',
                'Etterlevelsesdokumenter - under arbeid',
                'Etterlevelsesdokumenter - sendt til godkjenning',
                'Etterlevelsesdokumenter - godkjent',
                'Suksesskriterier - ikke påbegynt %',
                'Suksesskriterier - under arbeid %',
                'Suksesskriterier - oppfylt %',
                'Suksesskriterier - ikke oppfylt %',
                'Suksesskriterier - ikke relevant %',
                'Vurdere behov for PVK - totalt med personopplysninger',
                'Ikke vurdert behov',
                'Skal ikke gjennomføre PVK',
                'Skal gjennomføre PVK',
                'Overfører godkjent PVK',
                'PVK i Word',
                'Digital PVK totalt',
                'Digital PVK - ikke påbegynt',
                'Digital PVK - under arbeid',
                'Digital PVK - til behandling hos PVO',
                'Digital PVK - tilbakemelding fra PVO',
                'Digital PVK - sendt til godkjenning',
                'Digital PVK - godkjent av risikoeier',
              ].join(';')
              const row = [
                stats.dokumenter.total,
                stats.dokumenter.ikkePaabegynt,
                stats.dokumenter.underArbeid,
                stats.dokumenter.sendtTilGodkjenning,
                stats.dokumenter.godkjentAvRisikoeier,
                stats.suksesskriterier.ikkePaabegyntProsent,
                stats.suksesskriterier.underArbeidProsent,
                stats.suksesskriterier.oppfyltProsent,
                stats.suksesskriterier.ikkeOppfyltProsent,
                stats.suksesskriterier.ikkeRelevantProsent,
                stats.behovForPvk.totalMedPersonopplysninger,
                stats.behovForPvk.ikkeVurdertBehov,
                stats.behovForPvk.vurdertIkkeBehov,
                stats.behovForPvk.behovIkkePaabegynt,
                stats.behovForPvk.overforerGodkjentPvk,
                stats.pvk.pvkIWord,
                stats.pvk.total - stats.pvk.pvkIWord,
                stats.pvk.ikkePaabegynt,
                stats.pvk.underArbeid,
                stats.pvk.tilBehandlingHosPvo,
                stats.pvk.tilbakemeldingFraPvo,
                stats.pvk.sendtTilGodkjenning,
                stats.pvk.godkjentAvRisikoeier,
              ].join(';')
              const csv = BOM + [...filterLines, header, row].join('\n')
              const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
              const url = URL.createObjectURL(blob)
              const link = document.createElement('a')
              link.href = url
              link.download = `nokkeltall-${data.avdelingNavn}-${new Date().toISOString().slice(0, 10)}.csv`
              link.click()
              URL.revokeObjectURL(url)
            }}
          >
            Last ned nøkkeltallutvalg som CSV
          </Button>
        </div>

        {!isTableLoading &&
          sortedDoks.length === 0 &&
          (searchFilters.length > 0 || !!selectedSeksjon || !!selectedEnhet) && (
            <InfoCard data-color='warning' className='mt-4 max-w-[75ch]'>
              <InfoCard.Header icon={<ExclamationmarkTriangleFillIcon aria-hidden />}>
                <InfoCard.Title as='h3'>Filtrering har ført til 0 treff</InfoCard.Title>
              </InfoCard.Header>
              <InfoCard.Content>Prøv å fjerne et av filtervalgene dine.</InfoCard.Content>
            </InfoCard>
          )}

        {selectedSeksjon === 'ingen-seksjon' && (
          <LocalAlert status='warning' className='mt-4' aria-live='off'>
            <LocalAlert.Header>
              <LocalAlert.Title as='h2'>
                Disse etterlevelsesdokumentene mangler avdeling og/eller seksjon
              </LocalAlert.Title>
            </LocalAlert.Header>
            <LocalAlert.Content>
              <ul>
                <li>
                  Det er viktig at alle oppdaterer informasjon om avdeling og seksjon i
                  etterlevelsesdokumentene sine.
                </li>
                <li>
                  Dersom du oppdager etterlevelsesdokumenter som ikke er aktuelle lenger, ta kontakt
                  med Team Datajegerne på #etterlevelse på slack.
                </li>
              </ul>
            </LocalAlert.Content>
          </LocalAlert>
        )}
      </div>

      <Heading size='medium' level='2' className='mt-6'>
        Oversikt
      </Heading>

      <Tabs className='mt-4' defaultValue='figurer'>
        <Tabs.List>
          <Tabs.Tab value='figurer' label='Vis figurer' />
          <Tabs.Tab value='nokkeltall' label='Vis nøkkeltall' />
        </Tabs.List>
        <Tabs.Panel value='figurer'>
          <div className='mt-6'>
            <DashboardBarCard stats={getDisplayStats()} hideHeader />
            <AvdelingDetailReadMore />
          </div>
        </Tabs.Panel>
        <Tabs.Panel value='nokkeltall'>
          <div className='mt-6'>
            <DashboardCard stats={getDisplayStats()} hideHeader />
            <AvdelingDetailReadMore />
          </div>
        </Tabs.Panel>
      </Tabs>

      {(isTableLoading || tableData) && (
        <>
          <Heading size='medium' level='2' className='mt-10'>
            Detaljert om etterlevelse
          </Heading>
        </>
      )}

      <div className='dashboard-full-width-breakout'>
        {(isTableLoading || tableData) && (
          <>
            <Tabs
              value={tableTab}
              onChange={(val) => {
                const metode = navigasjonsMetode.current
                navigasjonsMetode.current = undefined
                if (val === tableTab) return

                setTableTab(val)
                setSort(undefined)

                sporInnblikkHendelse(Events.FANE_BYTTET, {
                  fraFane: tableTab,
                  tilFane: val,
                  tilFaneTekst:
                    val === 'dok_pvk'
                      ? 'Dokumentasjonsoversikt'
                      : val === 'krav'
                        ? 'Etterlevelse'
                        : 'Digital PVK',
                  navigasjonsMetode: metode,
                  antallFaner: 3,
                  selectionFollowsFocus: false,
                  kontekst: 'dashboard-avdeling-detail',
                  komponentId: 'dashboard-avdeling-detail-table-tabs',
                  seksjon: 'dashboard',
                  opprinnelse: 'etterlevelse',
                })
              }}
              className='mt-4'
            >
              <Tabs.List
                onPointerDownCapture={() => {
                  navigasjonsMetode.current = 'click'
                }}
                onKeyDownCapture={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    navigasjonsMetode.current = 'keyboard'
                  }
                }}
              >
                <Tabs.Tab value='dok_pvk' label='Dokumentasjonsoversikt' />
                <Tabs.Tab value='krav' label='Etterlevelse' />
                <Tabs.Tab value='pvk' label='Digital PVK' />
              </Tabs.List>
              <Tabs.Panel value='dok_pvk'>
                <div style={{ maxWidth: '75ch' }}>
                  <ReadMore header='Hvordan bruker jeg denne tabellen?' className='mt-4 mb-4'>
                    <List>
                      <List.Item>
                        <strong>Du kan bla bortover i tabellen</strong>
                        <br />
                        Med mindre du bruker en veldig stor skjerm, er det sannsynligvis flere
                        kolonner bortover til høyre som du kanskje ikke har sett.
                      </List.Item>
                      <List.Item>
                        <strong>Du kan sortere tabellen etter kolonne</strong>
                        <br />
                        Ved å klikke på øverste rad i tabellen kan du velge om du vil sortere etter
                        kolonnenavnet. Dette kan gjøre det enklere å finne informasjonen du lurer
                        på.
                      </List.Item>
                      <List.Item>
                        <strong>Savner du noen etterlevelser i tabellen?</strong>
                        <br />
                        Hvis du savner et visst etterlevelsesdokument i listen, sjekk hvilke filtre
                        som er valgt øverst i siden, eller se i{' '}
                        <Link
                          href='/dashboard/ingen-avdeling'
                          target='_blank'
                          style={{ display: 'inline' }}
                        >
                          listen over etterlevelsesdokumenter der avdeling/seksjon ikke er valgt
                          (åpner i en ny fane)
                        </Link>
                      </List.Item>
                    </List>
                  </ReadMore>
                </div>
                <DashboardDataGrid
                  columns={dokPvkColumns}
                  data={sortedDoks}
                  isLoading={isTableLoading}
                  sort={sort}
                  onSortChange={setSort}
                />
              </Tabs.Panel>

              <Tabs.Panel value='krav'>
                <div style={{ maxWidth: '75ch' }}>
                  <ReadMore header='Hvordan bruker jeg denne tabellen?' className='mt-4 mb-4'>
                    <List>
                      <List.Item>
                        <strong>Du kan bla bortover i tabellen</strong>
                        <br />
                        Med mindre du bruker en veldig stor skjerm, er det sannsynligvis flere
                        kolonner bortover til høyre som du kanskje ikke har sett.
                      </List.Item>
                      <List.Item>
                        <strong>Du kan sortere tabellen etter kolonne</strong>
                        <br />
                        Ved å klikke på øverste rad i tabellen kan du velge om du vil sortere etter
                        kolonnenavnet. Dette kan gjøre det enklere å finne informasjonen du lurer
                        på.
                      </List.Item>
                      <List.Item>
                        <strong>Hvordan tolke &quot;Antall krav ferdig utfylt&quot;?</strong>
                        <br />
                        Første tall viser hvor mange etterlevelseskrav som etterleveren har satt til
                        &quot;ferdig utfylt&quot;. Andre tall viser totalantall krav som
                        etterleveren må besvare i sitt etterlevelsesdokument. Ulike
                        etterlevelsesdokumenter inneholder ulike antall krav basert på hvilke
                        egenskaper som gjelder for dokumentet.
                      </List.Item>
                      <List.Item>
                        <strong>Hva betyr “Oppfylt”?</strong>
                        <br />I denne kolonna kan du klikke på prosentandel og finne mer
                        informasjon. Etterleveren må først ha markert hele kravet som ferdig utfylt
                        for at tallene blir tatt med her. Prosentandelen er beregnet basert på
                        forholdet mellom suksesskriterier vurdert som oppfylt, og suksesskriterier
                        vurdert som ikke oppfylt. Det tas ikke med suksesskriterier som ble vurdert
                        som ikke relevant.
                      </List.Item>
                      <List.Item>
                        <strong>Hva innebærer “Ikke godkjent i ny løsning”?</strong>
                        <br />
                        Etterlevelsesdokumenter som har blitt godkjent av risikoeieren utenfor ny
                        løsning vil ikke vise oppdatert status her. “Ikke godkjent i ny løsning”
                        sier dermed ingenting om etterlevelsens godkjenningsstatus, bare at
                        godkjenning ikke ennå er blitt gjennomført digitalt. Det blir først når
                        godkjenning gjennomføres digitalt i Støtte til etterlevelse at denne
                        statusen vil endre seg.{' '}
                        <Link
                          href='/omstottetiletterlevelse#fa-etterlevelsen-godkjent-av-risikoeier'
                          target='_blank'
                          style={{ display: 'inline' }}
                        >
                          Les mer om digital godkjenning av etterlevelsesdokumenter (åpner i en ny
                          fane).
                        </Link>
                      </List.Item>
                      <List.Item>
                        <strong>Savner du noen etterlevelser i tabellen?</strong>
                        <br />
                        Hvis du savner et visst etterlevelsesdokument i listen, sjekk hvilke filtre
                        som er valgt øverst i siden, eller se i{' '}
                        <Link
                          href='/dashboard/ingen-avdeling'
                          target='_blank'
                          style={{ display: 'inline' }}
                        >
                          listen over etterlevelsesdokumenter der avdeling/seksjon ikke er valgt
                          (åpner i en ny fane)
                        </Link>
                      </List.Item>
                    </List>
                  </ReadMore>
                </div>
                <DashboardDataGrid
                  columns={kravColumns}
                  data={sortedDoks}
                  isLoading={isTableLoading}
                  sort={sort}
                  onSortChange={setSort}
                />
              </Tabs.Panel>

              <Tabs.Panel value='pvk'>
                <div style={{ maxWidth: '75ch' }}>
                  <ReadMore header='Hvordan bruker jeg denne tabellen?' className='mt-4 mb-4'>
                    <List>
                      <List.Item>
                        <strong>Du kan bla bortover i tabellen</strong>
                        <br />
                        Med mindre du bruker en veldig stor skjerm, er det sannsynligvis flere
                        kolonner bortover til høyre som du kanskje ikke har sett.
                      </List.Item>
                      <List.Item>
                        <strong>Du kan sortere tabellen etter kolonne</strong>
                        <br />
                        Ved å klikke på øverste rad i tabellen kan du velge om du vil sortere etter
                        kolonnenavnet. Dette kan gjøre det enklere å finne informasjonen du lurer
                        på.
                      </List.Item>
                      <List.Item>
                        <strong>Hva vil det si å vurdere behov for PVK?</strong>
                        <br />I Støtte til etterlevelse er det mulig å gå inn og registrere at man
                        har vurdert behov for PVK, og hva som ble konklusjonen. Muligheten vises for
                        alle etterlevere som har valgt “Behandler personopplysninger” som egenskap i
                        etterlevelsesdokumentet sitt. Det er viktig at vurderingen om behov for PVK
                        registreres, uansett konklusjon, slik at Nav har oversikt.{' '}
                        <Link
                          href='/om-pvk#beslutningsstotte'
                          target='_blank'
                          style={{ display: 'inline' }}
                        >
                          Les mer om beslutningsstøtte ved vurdering av behov for PVK (åpner i en ny
                          fane).
                        </Link>
                      </List.Item>
                      <List.Item>
                        <strong>Har vi statistikk om PVK i Word?</strong>
                        <br />
                        Vi har ikke statistikk om PVK i Word annet enn hva man registrerer under
                        vurdering av behov for PVK. Her er det mulig å velge “Vi har en tidligere
                        godkjent PVK i Word”. Etter hvert som PVK-en skal oppdateres og sendes til
                        personvernombudet på nytt, skal etterleveren gå over til å bruke Digital
                        PVK. Antall PVK i Word vil dermed senke med tiden, og statistikk om PVK bli
                        mer detaljert når flere PVK-er ligger i ny løsning.
                      </List.Item>
                      <List.Item>
                        <strong>Hva innebærer “Ikke godkjent i ny løsning”?</strong>
                        <br />
                        PVK-er som har blitt dokumentert og godkjent av risikoeieren utenfor ny
                        løsning vil ikke vise oppdatert status her. “Ikke godkjent i ny løsning”
                        sier dermed ingenting om PVK-ens godkjenningsstatus, bare at godkjenning
                        ikke ennå er blitt gjennomført digitalt. Det blir først når PVK dokumenteres
                        og godkjennes i Digital PVK at denne statusen vil endre seg.{' '}
                        <Link
                          href='/om-pvk#hvordan-er-pvk-prosessen'
                          target='_blank'
                          style={{ display: 'inline' }}
                        >
                          Les mer om digital godkjenning av etterlevelsesdokumenter (åpner i en ny
                          fane).
                        </Link>
                      </List.Item>
                      <List.Item>
                        <strong>Jeg savner PVK-er i tabellen</strong>
                        <br />
                        Hvis du savner en viss PVK i listen, er det fordi etterleveren ikke har
                        valgt avdeling eller seksjon når de har opprettet etterlevelsesdokumentet
                        sitt. PVK-en er koblet på etterlevelsesdokumentet i løsningen.{' '}
                        <Link
                          href='/dashboard/ingen-avdeling'
                          target='_blank'
                          style={{ display: 'inline' }}
                        >
                          Se på listen over etterlevelsesdokumenter der avdeling/seksjon ikke er
                          valgt (åpner i en ny fane).
                        </Link>
                      </List.Item>
                    </List>
                  </ReadMore>
                </div>
                <DashboardDataGrid
                  columns={pvkColumns}
                  data={sortedDoks}
                  isLoading={isTableLoading}
                  sort={sort}
                  onSortChange={setSort}
                />
              </Tabs.Panel>
            </Tabs>
          </>
        )}
      </div>

      {!isTableLoading && (
        <InfoCard data-color='info' className='mt-8'>
          <InfoCard.Header icon={<InformationSquareIcon aria-hidden />}>
            <InfoCard.Title as='h2'>
              Savner du noe, eller har du tilbakemelding til oss?
            </InfoCard.Title>
          </InfoCard.Header>
          <InfoCard.Content>
            Hvis du savner et visst etterlevelsesdokument i listen, sjekk hvilke filtre som er valgt
            i søkefeltet, eller se{' '}
            <Link href='/dashboard/ingen-avdeling' target='_blank'>
              listen over etterlevelsesdokumenter der avdeling/seksjon ikke er valgt (åpner i en ny
              fane)
            </Link>
            . Hvis du har andre tilbakemeldinger om dashboards, bli med på #etterlevelse på Slack,
            eller send mail til teamdatajegerne@nav.no.
          </InfoCard.Content>
        </InfoCard>
      )}
    </PageLayout>
  )
}

export default AvdelingDetailPage
