'use client'

import {
  getDashboardAvdelingStats,
  getDashboardTableByAvdeling,
} from '@/api/dashboard/dashboardApi'
import { getEnheterBySeksjonId } from '@/api/nom/nomApi'
import { DashboardBarCard } from '@/components/dashboard/DashboardBarCard'
import { DashboardCard } from '@/components/dashboard/DashboardCard'
import { StickyHorizontalScroll } from '@/components/dashboard/StickyHorizontalScroll'
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
import { getPollyBaseUrl } from '@/util/behandling/behandlingUtil'
import { getEtterlevelseDokumentStatusText } from '@/util/etterlevelseDokumentasjon/etterlevelseDokumentasjonUtil'
import { handleSort } from '@/util/handleTableSort'
import {
  Chips,
  Heading,
  Link,
  LocalAlert,
  Search,
  Select,
  SortState,
  Table,
  Tabs,
} from '@navikt/ds-react'
import moment from 'moment'
import { useEffect, useMemo, useRef, useState } from 'react'
import { CenteredLoader } from '../common/centeredLoader/centeredLoader'

interface IProps {
  avdelingId: string
}

const getBehovForPvkText = (
  pvkVurdering: EPvkVurdering,
  behandlerPersonopplysninger: boolean
): string => {
  if (!behandlerPersonopplysninger) return 'Behandler ikke personopplysninger'
  if (!pvkVurdering || pvkVurdering === EPvkVurdering.UNDEFINED) return 'Ikke vurdert behov'
  if (pvkVurdering === EPvkVurdering.SKAL_IKKE_UTFORE) return 'Skal ikke gjennomføre PVK'
  if (pvkVurdering === EPvkVurdering.SKAL_UTFORE) return 'Skal gjennomføre PVK'
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
  if (pvkStatus === EPvkDokumentStatus.TRENGER_GODKJENNING) return 'Sendt til risikoeier'
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

const getKravTrafficColor = (ferdig: number, total: number): string => {
  if (total === 0) return '#C6C2BF'
  const pct = (ferdig / total) * 100
  if (pct >= 100) return '#06893A'
  if (pct >= 50) return '#E67E22'
  return '#C30000'
}

const getOppfyltTrafficColor = (ferdig: number, total: number): string => {
  if (total === 0) return '#C6C2BF'
  const pct = (ferdig / total) * 100
  if (pct >= 90) return '#06893A'
  if (pct >= 70) return '#E67E22'
  return '#C30000'
}

const TrafficDot = ({ color }: { color: string }) => (
  <span
    style={{
      display: 'inline-block',
      width: 12,
      height: 12,
      borderRadius: '50%',
      backgroundColor: color,
      marginRight: 6,
      verticalAlign: 'middle',
    }}
  />
)

const AvdelingDetailPage = ({ avdelingId }: IProps) => {
  const [data, setData] = useState<IDashboardDetailResponse>()
  const [tableData, settableData] = useState<IDashboardTable[]>()
  const [isLoading, setIsLoading] = useState(true)
  const [isTableLoading, setIsTableLoading] = useState(true)
  const [selectedSeksjon, setSelectedSeksjon] = useState<string>('')
  const [selectedEnhet, setSelectedEnhet] = useState<string>('')
  const [enhetOptions, setEnhetOptions] = useState<IOrgEnhet[]>([])
  const [tableTab, setTableTab] = useState('dok_pvk')
  const [sort, setSort] = useState<SortState | undefined>()
  const [searchInput, setSearchInput] = useState('')
  const [searchFilters, setSearchFilters] = useState<string[]>([])
  const searchRef = useRef<HTMLInputElement>(null)

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
    if (selectedSeksjon && selectedSeksjon !== 'ingen-seksjon') {
      getEnheterBySeksjonId(selectedSeksjon)
        .then(setEnhetOptions)
        .catch(() => setEnhetOptions([]))
    } else {
      setEnhetOptions([])
    }
    setSelectedEnhet('')
  }, [selectedSeksjon])

  const getSearchableText = (dok: IDashboardTable): string => {
    return [
      `E${dok.etterlevelseNummer} ${dok.etterlevelseDokumentasjonTittel}`,
      dok.teamsData?.map((t) => t.name)?.join(' ') ?? '',
      dok.resourcesData?.map((r) => r.fullName)?.join(' ') ?? '',
      dok.risikoeiereData?.map((r) => r.fullName)?.join(' ') ?? '',
      dok.seksjoner?.map((s) => s.nomSeksjonName)?.join(' ') ?? '',
      dok.behandlinger?.map((b) => `B${b.nummer} ${b.navn}`)?.join(' ') ?? '',
      getEtterlevelseDokumentStatusText(dok.etterlevelseDokumentasjonStatus),
      getBehovForPvkText(dok.pvkVurdering, dok.behandlerPersonopplysninger),
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
    setSearchInput('')
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

      if (selectedEnhet) {
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
        return searchFilters.every((filter) => text.includes(filter.toLowerCase()))
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
            return getEtterlevelseDokumentStatusText(dok.etterlevelseDokumentasjonStatus)
          case 'behovForPvk':
            return getBehovForPvkText(dok.pvkVurdering, dok.behandlerPersonopplysninger)
          case 'pvkStatus':
            return getPvkOnlyStatusText(
              dok.pvkVurdering,
              dok.pvkStatus,
              dok.hasPvkDocumentationStarted
            )
          case 'dato_etterlvelse':
            return dok.sistOppdatertEtterlevelse || ''
          case 'dato_pvk':
            return dok.sistOppdatertPvk || ''
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
    const underArbeid = doks.filter(
      (d) => d.etterlevelseDokumentasjonStatus === EEtterlevelseDokumentasjonStatus.UNDER_ARBEID
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
    const behovIkkePaabegynt = medPersonopplysninger.filter(
      (d) => d.pvkVurdering === EPvkVurdering.SKAL_UTFORE
    ).length
    const pvkIWord = medPersonopplysninger.filter(
      (d) => d.pvkVurdering === EPvkVurdering.ALLEREDE_UTFORT
    ).length

    const skalUtfore = doks.filter((d) => d.pvkVurdering === EPvkVurdering.SKAL_UTFORE)
    const pvkIkkePaabegynt = skalUtfore.filter((d) => !d.hasPvkDocumentationStarted).length
    const pvkGodkjent = skalUtfore.filter(
      (d) =>
        d.hasPvkDocumentationStarted && d.pvkStatus === EPvkDokumentStatus.GODKJENT_AV_RISIKOEIER
    ).length
    const pvkTilBehandling = skalUtfore.filter(
      (d) =>
        d.hasPvkDocumentationStarted &&
        (d.pvkStatus === EPvkDokumentStatus.SENDT_TIL_PVO ||
          d.pvkStatus === EPvkDokumentStatus.PVO_UNDERARBEID ||
          d.pvkStatus === EPvkDokumentStatus.SENDT_TIL_PVO_FOR_REVURDERING)
    ).length
    const pvkTilbakemelding = skalUtfore.filter(
      (d) =>
        d.hasPvkDocumentationStarted &&
        (d.pvkStatus === EPvkDokumentStatus.VURDERT_AV_PVO ||
          d.pvkStatus === EPvkDokumentStatus.VURDERT_AV_PVO_TRENGER_MER_ARBEID)
    ).length
    const pvkUnderArbeid =
      skalUtfore.filter((d) => d.hasPvkDocumentationStarted).length -
      pvkGodkjent -
      pvkTilBehandling -
      pvkTilbakemelding

    const baseStats = getCurrentStats()

    return {
      ...baseStats,
      dokumenter: {
        total,
        underArbeid,
        sendtTilGodkjenning,
        godkjentAvRisikoeier: godkjent,
      },
      behovForPvk: {
        totalMedPersonopplysninger: medPersonopplysninger.length,
        ikkeVurdertBehov,
        vurdertIkkeBehov,
        behovIkkePaabegynt,
      },
      pvk: {
        total: skalUtfore.length + pvkIWord,
        ikkePaabegynt: pvkIkkePaabegynt,
        underArbeid: pvkUnderArbeid,
        tilBehandlingHosPvo: pvkTilBehandling,
        tilbakemeldingFraPvo: pvkTilbakemelding,
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

      <LocalAlert status='announcement' className='mt-4 mb-6' aria-live='off'>
        <LocalAlert.Header>
          <LocalAlert.Title as='h2'>
            Obs! Disse sidene er fortsatt under utvikling.
          </LocalAlert.Title>
        </LocalAlert.Header>
        <LocalAlert.Content>
          Dersom dere finner feil eller har forslag til forbedringer, ta kontakt på #etterlevelse på
          slack.
        </LocalAlert.Content>
      </LocalAlert>

      {avdelingId === 'ingen-avdeling' && (
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

      <Heading size='medium' level='2' className='mt-4 mb-6'>
        Oversikt
      </Heading>

      {data.seksjoner && data.seksjoner.length > 0 && (
        <div className='flex gap-4 flex-wrap'>
          <Select
            label='Velg seksjon'
            className='mt-4 w-fit min-w-64'
            value={selectedSeksjon}
            onChange={(e) => setSelectedSeksjon(e.target.value)}
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

          {selectedSeksjon && selectedSeksjon !== 'ingen-seksjon' && enhetOptions.length > 0 && (
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
            </Select>
          )}
        </div>
      )}

      <form
        className='mt-6'
        onSubmit={(e) => {
          e.preventDefault()
          addSearchFilter(searchInput)
        }}
      >
        <Search
          label='Søk etter team, seksjon, person, dokument, enhet m.m. Trykk enter for å legge til filter.'
          hideLabel={false}
          variant='secondary'
          value={searchInput}
          onChange={setSearchInput}
          onClear={() => setSearchInput('')}
          ref={searchRef}
          className='max-w-2xl'
        />
      </form>

      {searchFilters.length > 0 && (
        <Chips className='mt-4 mb-8'>
          {searchFilters.map((filter) => (
            <Chips.Removable key={filter} onDelete={() => removeSearchFilter(filter)}>
              {filter}
            </Chips.Removable>
          ))}
        </Chips>
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

      <Tabs className='mt-4' defaultValue='figurer'>
        <Tabs.List>
          <Tabs.Tab value='figurer' label='Vis figurer' />
          <Tabs.Tab value='nokkeltall' label='Vis nøkkeltall' />
        </Tabs.List>
        <Tabs.Panel value='figurer'>
          <div className='mt-6'>
            <DashboardBarCard stats={getDisplayStats()} hideHeader />
          </div>
        </Tabs.Panel>
        <Tabs.Panel value='nokkeltall'>
          <div className='mt-6'>
            <DashboardCard stats={getDisplayStats()} hideHeader />
          </div>
        </Tabs.Panel>
      </Tabs>

      {!isTableLoading && tableData && (
        <>
          <Heading size='medium' level='2' className='mt-10'>
            Detaljert om etterlevelse
          </Heading>
        </>
      )}

      <div className='dashboard-full-width-breakout'>
        {isTableLoading && <CenteredLoader />}

        {!isTableLoading && tableData && (
          <>
            <Tabs
              value={tableTab}
              onChange={(val) => {
                setTableTab(val)
                setSort(undefined)
              }}
              className='mt-4'
            >
              <Tabs.List>
                <Tabs.Tab value='dok_pvk' label='Dokumentasjonsoversikt' />
                <Tabs.Tab value='krav' label='Etterlevelse' />
                <Tabs.Tab value='pvk' label='Digital PVK' />
              </Tabs.List>
              <Tabs.Panel value='dok_pvk'>
                <StickyHorizontalScroll>
                  <Table
                    className='mt-4 dashboard-table'
                    size='small'
                    zebraStripes
                    stickyHeader
                    sort={sort}
                    onSortChange={(sortKey) => handleSort(sort, setSort, sortKey)}
                  >
                    <Table.Header>
                      <Table.Row>
                        <Table.ColumnHeader sortable sortKey='dok'>
                          <span className='flex flex-col'>
                            <span>Etterlevelsesdokument</span>
                            <span className='font-normal'>(Lenker åpnes i ny fane)</span>
                          </span>
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortable sortKey='risikoeier'>
                          Risikoeier
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortable sortKey='seksjon'>
                          Seksjon
                        </Table.ColumnHeader>
                        {hasEnheter && (
                          <Table.ColumnHeader sortable sortKey='enhet'>
                            Enhet
                          </Table.ColumnHeader>
                        )}
                        <Table.ColumnHeader sortable sortKey='etterlevelse'>
                          Etterlevelse
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortable sortKey='behovForPvk'>
                          Vurdere behov for PVK
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortable sortKey='pvkStatus'>
                          Digital PVK status
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortable sortKey='behandlinger'>
                          <span className='flex flex-col'>
                            <span>Behandlinger</span>
                            <span className='font-normal'>(Lenker åpnes i ny fane)</span>
                          </span>
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortable sortKey='team'>
                          Team
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortable sortKey='person'>
                          Person
                        </Table.ColumnHeader>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {sortedDoks.map((dok) => {
                        return (
                          <Table.Row key={dok.etterlevelseDokumentasjonId}>
                            <Table.DataCell className='dashboard-cell-wide'>
                              <Link
                                href={`/dokumentasjon/${dok.etterlevelseDokumentasjonId}`}
                                target='_blank'
                              >
                                E{dok.etterlevelseNummer}.{dok.etterlevelseDokumentVersjon}{' '}
                                {dok.etterlevelseDokumentasjonTittel}
                              </Link>
                            </Table.DataCell>
                            <Table.DataCell>
                              {dok.risikoeiereData && dok.risikoeiereData.length > 0
                                ? dok.risikoeiereData.map((risikoeier, index) => (
                                    <div key={`${risikoeier.navIdent}-${index}`}>
                                      {risikoeier.fullName}
                                    </div>
                                  ))
                                : '-'}
                            </Table.DataCell>
                            <Table.DataCell>
                              {dok.seksjoner?.length
                                ? dok.seksjoner.map((s) => (
                                    <div key={s.nomSeksjonId}>{s.nomSeksjonName}</div>
                                  ))
                                : '-'}
                            </Table.DataCell>
                            {hasEnheter && (
                              <Table.DataCell>
                                {dok.enheter?.length
                                  ? dok.enheter.map((e) => (
                                      <div key={e.nomEnhetId}>{e.nomEnhetName}</div>
                                    ))
                                  : '-'}
                              </Table.DataCell>
                            )}
                            <Table.DataCell>
                              {getEtterlevelseDokumentStatusText(
                                dok.etterlevelseDokumentasjonStatus
                              )}
                            </Table.DataCell>
                            <Table.DataCell>
                              {getBehovForPvkText(
                                dok.pvkVurdering,
                                dok.behandlerPersonopplysninger
                              )}
                            </Table.DataCell>
                            <Table.DataCell>
                              {getPvkOnlyStatusText(
                                dok.pvkVurdering,
                                dok.pvkStatus,
                                dok.hasPvkDocumentationStarted
                              )}
                            </Table.DataCell>
                            <Table.DataCell className='dashboard-cell-wide'>
                              {dok.behandlinger?.map((b) => (
                                <div key={b.id}>
                                  <Link
                                    href={`${getPollyBaseUrl()}process/${b.id}`}
                                    target='_blank'
                                  >
                                    B{b.nummer} {b.navn}
                                  </Link>
                                </div>
                              )) || '-'}
                            </Table.DataCell>
                            <Table.DataCell>
                              {dok.teamsData && dok.teamsData.length > 0
                                ? dok.teamsData.map((team) => <div key={team.id}>{team.name}</div>)
                                : '-'}
                            </Table.DataCell>
                            <Table.DataCell>
                              {dok.resourcesData && dok.resourcesData.length > 0
                                ? dok.resourcesData.map((resource, index) => (
                                    <div key={`${resource.navIdent}-${index}`}>
                                      {resource.fullName}
                                    </div>
                                  ))
                                : '-'}
                            </Table.DataCell>
                          </Table.Row>
                        )
                      })}
                    </Table.Body>
                  </Table>
                </StickyHorizontalScroll>
              </Tabs.Panel>

              <Tabs.Panel value='krav'>
                <StickyHorizontalScroll>
                  <Table
                    className='mt-4 dashboard-table'
                    size='small'
                    zebraStripes
                    stickyHeader
                    sort={sort}
                    onSortChange={(sortKey) => handleSort(sort, setSort, sortKey)}
                  >
                    <Table.Header>
                      <Table.Row>
                        <Table.ColumnHeader sortable sortKey='dok'>
                          <span className='flex flex-col'>
                            <span>Etterlevelsesdokument</span>
                            <span className='font-normal'>(Lenker åpnes i ny fane)</span>
                          </span>
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortable sortKey='risikoeier'>
                          Risikoeier
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortable sortKey='krav' align='center'>
                          Antall krav ferdig utfylt
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortable sortKey='oppfylt' align='center'>
                          Oppfylt der kravet er ferdig vurdert
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortable sortKey='dato_etterlvelse'>
                          Sist oppdatert
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortable sortKey='team'>
                          Team
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortable sortKey='person'>
                          Person
                        </Table.ColumnHeader>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {sortedDoks.map((dok) => {
                        return (
                          <Table.Row key={dok.etterlevelseDokumentasjonId}>
                            <Table.DataCell className='dashboard-cell-wide'>
                              <Link
                                href={`/dokumentasjon/${dok.etterlevelseDokumentasjonId}`}
                                target='_blank'
                              >
                                E{dok.etterlevelseNummer}.{dok.etterlevelseDokumentVersjon}{' '}
                                {dok.etterlevelseDokumentasjonTittel}
                              </Link>
                            </Table.DataCell>
                            <Table.DataCell>
                              {dok.risikoeiereData && dok.risikoeiereData.length > 0
                                ? dok.risikoeiereData.map((risikoeier, index) => (
                                    <div key={`${risikoeier.navIdent}-${index}`}>
                                      {risikoeier.fullName}
                                    </div>
                                  ))
                                : '-'}
                            </Table.DataCell>
                            <Table.DataCell align='center'>
                              <TrafficDot
                                color={getKravTrafficColor(
                                  dok.antallOppfyltKrav || 0,
                                  dok.antallKrav || 0
                                )}
                              />
                              {dok.antallOppfyltKrav} av {dok.antallKrav}
                            </Table.DataCell>
                            <Table.DataCell align='center'>
                              <TrafficDot
                                color={
                                  dok.oppfyltKravProsent != null && dok.oppfyltKravProsent > 0
                                    ? getOppfyltTrafficColor(dok.oppfyltKravProsent, 100)
                                    : '#C6C2BF'
                                }
                              />
                              {dok.oppfyltKravProsent && dok.oppfyltKravProsent > 0
                                ? `${dok.oppfyltKravProsent}%`
                                : '-'}
                            </Table.DataCell>
                            <Table.DataCell>
                              {dok.sistOppdatertEtterlevelse
                                ? moment(dok.sistOppdatertEtterlevelse).format('D. MMMM YYYY')
                                : '-'}
                            </Table.DataCell>
                            <Table.DataCell>
                              {dok.teamsData && dok.teamsData.length > 0
                                ? dok.teamsData.map((team) => <div key={team.id}>{team.name}</div>)
                                : '-'}
                            </Table.DataCell>
                            <Table.DataCell>
                              {dok.resourcesData && dok.resourcesData.length > 0
                                ? dok.resourcesData.map((resource, index) => (
                                    <div key={`${resource.navIdent}-${index}`}>
                                      {resource.fullName}
                                    </div>
                                  ))
                                : '-'}
                            </Table.DataCell>
                          </Table.Row>
                        )
                      })}
                    </Table.Body>
                  </Table>
                </StickyHorizontalScroll>
              </Tabs.Panel>

              <Tabs.Panel value='pvk'>
                <StickyHorizontalScroll>
                  <Table
                    className='mt-4 dashboard-table'
                    size='small'
                    zebraStripes
                    stickyHeader
                    sort={sort}
                    onSortChange={(sortKey) => handleSort(sort, setSort, sortKey)}
                  >
                    <Table.Header>
                      <Table.Row>
                        <Table.ColumnHeader sortable sortKey='dok'>
                          <span className='flex flex-col'>
                            <span>Etterlevelsesdokument</span>
                            <span className='font-normal'>(Lenker åpnes i ny fane)</span>
                          </span>
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortable sortKey='risikoeier'>
                          Risikoeier
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortable sortKey='behovForPvk'>
                          Vurdere behov for PVK
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortable sortKey='pvkStatus'>
                          Digital PVK status
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortable sortKey='antallScenarioer' align='center'>
                          Antall risikoscenarioer
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortable sortKey='hoyRisiko' align='center'>
                          Høy risiko før tiltak
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortable sortKey='hoyRisikoEtterTiltak' align='center'>
                          Høy risiko etter tiltak
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortable sortKey='antallTiltak' align='center'>
                          Antall tiltak
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortable sortKey='ikkeIverksatte' align='center'>
                          Ikke iverksatte tiltak
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortable sortKey='fristPassert' align='center'>
                          Tiltaksfrist passert
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortable sortKey='dato_pvk'>
                          Sist oppdatert
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortable sortKey='team'>
                          Team
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortable sortKey='person'>
                          Person
                        </Table.ColumnHeader>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {sortedDoks.map((dok) => {
                        return (
                          <Table.Row key={dok.etterlevelseDokumentasjonId}>
                            <Table.DataCell className='dashboard-cell-wide'>
                              <Link
                                href={`/dokumentasjon/${dok.etterlevelseDokumentasjonId}`}
                                target='_blank'
                              >
                                E{dok.etterlevelseNummer}.{dok.etterlevelseDokumentVersjon}{' '}
                                {dok.etterlevelseDokumentasjonTittel}
                              </Link>
                            </Table.DataCell>
                            <Table.DataCell>
                              {dok.risikoeiereData && dok.risikoeiereData.length > 0
                                ? dok.risikoeiereData.map((risikoeier, index) => (
                                    <div key={`${risikoeier.navIdent}-${index}`}>
                                      {risikoeier.fullName}
                                    </div>
                                  ))
                                : '-'}
                            </Table.DataCell>
                            <Table.DataCell>
                              {getBehovForPvkText(
                                dok.pvkVurdering,
                                dok.behandlerPersonopplysninger
                              )}
                            </Table.DataCell>
                            <Table.DataCell>
                              {getPvkOnlyStatusText(
                                dok.pvkVurdering,
                                dok.pvkStatus,
                                dok.hasPvkDocumentationStarted
                              )}
                            </Table.DataCell>
                            <Table.DataCell align='center'>
                              {dok.antallRisikoscenario ? dok.antallRisikoscenario : '-'}
                            </Table.DataCell>
                            <Table.DataCell align='center'>
                              {dok.antallHoyRisikoscenario ? (
                                <span className='inline-flex items-center'>
                                  <TrafficDot color='#C30000' />
                                  {dok.antallHoyRisikoscenario}
                                </span>
                              ) : (
                                '-'
                              )}
                            </Table.DataCell>
                            <Table.DataCell align='center'>
                              {dok.antallHoyRisikoEtterTiltak ? (
                                <span className='inline-flex items-center'>
                                  <TrafficDot color='#C30000' />
                                  {dok.antallHoyRisikoEtterTiltak}
                                </span>
                              ) : (
                                '-'
                              )}
                            </Table.DataCell>
                            <Table.DataCell align='center'>
                              {dok.antallTiltak ?? '-'}
                            </Table.DataCell>
                            <Table.DataCell align='center'>
                              {dok.antallIkkeIverksattTiltak ? dok.antallIkkeIverksattTiltak : '-'}
                            </Table.DataCell>
                            <Table.DataCell align='center'>
                              {dok.antallTiltakFristPassert ? (
                                <span className='inline-flex items-center'>
                                  <TrafficDot color='#C30000' />
                                  {dok.antallTiltakFristPassert}
                                </span>
                              ) : (
                                '-'
                              )}
                            </Table.DataCell>
                            <Table.DataCell>
                              {dok.sistOppdatertPvk
                                ? moment(dok.sistOppdatertPvk).format('D. MMMM YYYY')
                                : '-'}
                            </Table.DataCell>
                            <Table.DataCell>
                              {dok.teamsData && dok.teamsData.length > 0
                                ? dok.teamsData.map((team) => <div key={team.id}>{team.name}</div>)
                                : '-'}
                            </Table.DataCell>
                            <Table.DataCell>
                              {dok.resourcesData && dok.resourcesData.length > 0
                                ? dok.resourcesData.map((resource, index) => (
                                    <div key={`${resource.navIdent}-${index}`}>
                                      {resource.fullName}
                                    </div>
                                  ))
                                : '-'}
                            </Table.DataCell>
                          </Table.Row>
                        )
                      })}
                    </Table.Body>
                  </Table>
                </StickyHorizontalScroll>
              </Tabs.Panel>
            </Tabs>
          </>
        )}
      </div>
    </PageLayout>
  )
}

export default AvdelingDetailPage
