'use client'

import {
  getDashboardAvdelingStats,
  getDashboardTableByAvdeling,
} from '@/api/dashboard/dashboardApi'
import { DashboardBarCard } from '@/components/dashboard/DashboardBarCard'
import { DashboardCard } from '@/components/dashboard/DashboardCard'
import { StickyHorizontalScroll } from '@/components/dashboard/StickyHorizontalScroll'
import { PageLayout } from '@/components/others/scaffold/scaffold'
import {
  IAvdelingDashboardStats,
  IDashboardDetailResponse,
  IDashboardTable,
} from '@/constants/dashboard/dashboardConstants'
import {
  EPvkDokumentStatus,
  EPvkVurdering,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { getEtterlevelseDokumentStatusText } from '@/util/etterlevelseDokumentasjon/etterlevelseDokumentasjonUtil'
import { handleSort } from '@/util/handleTableSort'
import { Heading, Link, LocalAlert, Select, SortState, Table, Tabs } from '@navikt/ds-react'
import moment from 'moment'
import { useEffect, useMemo, useState } from 'react'
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
  const [tableTab, setTableTab] = useState('dok_pvk')
  const [sort, setSort] = useState<SortState | undefined>()

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

  const getFilteredDoks = (): IDashboardTable[] => {
    if (tableData) {
      if (selectedSeksjon === 'ingen-seksjon') {
        return tableData.filter(
          (etterlevelseDokTableValue) => !etterlevelseDokTableValue.seksjoner?.length
        )
      } else if (selectedSeksjon) {
        return tableData.filter((etterlevelseDokTableValue) =>
          etterlevelseDokTableValue.seksjoner.map((s) => s.nomSeksjonId).includes(selectedSeksjon)
        )
      } else {
        return tableData
      }
    } else {
      return []
    }
  }

  const sortedDoks = useMemo(() => {
    if (!sort || !tableData) {
      return getFilteredDoks()
    } else {
      const dir = sort.direction === 'ascending' ? 1 : -1
      return [...getFilteredDoks()].sort((a, b) => {
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
              return dok.oppfyltKravProsent && dok.oppfyltKravProsent > 0
                ? dok.oppfyltKravProsent
                : 0
            }
            case 'pvkStatus':
              return getPvkOnlyStatusText(
                dok.pvkVurdering,
                dok.pvkStatus,
                dok.hasPvkDocumentationStarted
              )
            case 'antallScenarioer':
              return dok.antallRisikoscenario || 0
            case 'hoyRisiko':
              return dok.antallHoyRisikoscenario || 0
            case 'hoyRisikoEtterTiltak':
              return dok.antallHoyRisikoEtterTiltak || 0
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
    }
  }, [sort, tableData, selectedSeksjon])

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

      <LocalAlert status='announcement' className='mt-4' aria-live='off'>
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

      <Heading size='medium' level='2' className='mt-4'>
        Oversikt
      </Heading>

      {data.seksjoner && data.seksjoner.length > 0 && (
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
            <DashboardBarCard stats={getCurrentStats()} hideHeader singleRow />
          </div>
        </Tabs.Panel>
        <Tabs.Panel value='nokkeltall'>
          <div className='mt-6'>
            <DashboardCard stats={getCurrentStats()} hideHeader />
          </div>
        </Tabs.Panel>
      </Tabs>

      <div className='dashboard-full-width-breakout'>
        {isTableLoading && <CenteredLoader />}

        {!isTableLoading && tableData && (
          <>
            <Heading size='medium' level='2' className='mt-10'>
              Detaljert om etterlevelse
            </Heading>
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
                <Tabs.Tab value='krav' label='Etterlevelseskrav' />
                <Tabs.Tab value='pvk' label='PVK' />
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
                          Etterlevelsesdokument
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortable sortKey='risikoeier'>
                          Risikoeier
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortable sortKey='seksjon'>
                          Seksjon
                        </Table.ColumnHeader>
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
                          Behandlinger
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
                                    href={`https://behandlingskatalog.intern.nav.no/process/purpose/NAV/${b.id}`}
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
                          Etterlevelsesdokument
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortable sortKey='risikoeier'>
                          Risikoeier
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortable sortKey='krav' align='center'>
                          Etterlevelseskrav
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortable sortKey='oppfylt' align='center'>
                          Oppfylt
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
                          Etterlevelsesdokument
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
                          Høy risiko scenarioer
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortable sortKey='hoyRisikoEtterTiltak' align='center'>
                          Høy risiko etter tiltak
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
