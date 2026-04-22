'use client'

import {
  getDashboardAvdelingStats,
  getDashboardTableByAvdeling,
} from '@/api/dashboard/dashboardApi'
import { DashboardCard } from '@/components/dashboard/DashboardCard'
import { DashboardPieCard } from '@/components/dashboard/DashboardPieCard'
import { PageLayout } from '@/components/others/scaffold/scaffold'
import {
  IAvdelingDashboardStats,
  IDashboardDetailResponse,
  IDashboardTable,
} from '@/constants/dashboard/dashboardConstants'
import { getEtterlevelseDokumentStatusText } from '@/util/etterlevelseDokumentasjon/etterlevelseDokumentasjonUtil'
import { getPvkStatusText } from '@/util/etterlevelseDokumentasjon/pvkDokument/pvkDokumentUtils'
import { handleSort } from '@/util/handleTableSort'
import { Heading, Link, LocalAlert, Select, SortState, Table, Tabs } from '@navikt/ds-react'
import moment from 'moment'
import { useEffect, useMemo, useState } from 'react'
import { CenteredLoader } from '../common/centeredLoader/centeredLoader'

interface IProps {
  avdelingId: string
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
      if (selectedSeksjon) {
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
              return dok.teamsData?.map((teamsData) => teamsData.name[0]).join(', ') || ''
            case 'person':
              return dok.resourcesData?.map((resource) => resource.fullName).join(', ') || ''
            case 'risikoeier':
              return dok.risikoeiereData?.map((risikoeier) => risikoeier.fullName).join(', ') || ''
            case 'etterlevelse':
              return getEtterlevelseDokumentStatusText(dok.etterlevelseDokumentasjonStatus)
            case 'pvk':
              return getPvkStatusText(
                dok.pvkVurdering,
                dok.pvkDokumentStatus,
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
              return getPvkStatusText(
                dok.pvkVurdering,
                dok.pvkDokumentStatus,
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
      <LocalAlert status='announcement' className='mt-4'>
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

      <div className='mt-4'>
        <Heading size='large' level='1'>
          {data.avdelingNavn}
        </Heading>
      </div>
      {data.seksjoner.length > 0 && (
        <Select
          label='Velg seksjon'
          className='mt-4 w-fit min-w-64'
          value={selectedSeksjon}
          onChange={(e) => setSelectedSeksjon(e.target.value)}
        >
          <option value=''>Alle seksjoner</option>
          {data.seksjoner.map((s) => (
            <option key={s.id} value={s.id}>
              {s.navn}
            </option>
          ))}
        </Select>
      )}
      <Tabs className='mt-4' defaultValue='figurer'>
        <Tabs.List>
          <Tabs.Tab value='figurer' label='Vis figurer' />
          <Tabs.Tab value='nokkeltall' label='Vis nøkkeltall' />
        </Tabs.List>
        <Tabs.Panel value='figurer'>
          <div className='mt-6'>
            <DashboardPieCard stats={getCurrentStats()} hideHeader />
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
          <Tabs
            value={tableTab}
            onChange={(val) => {
              setTableTab(val)
              setSort(undefined)
            }}
            className='mt-10'
          >
            <Tabs.List>
              <Tabs.Tab value='dok_pvk' label='Dokumentasjonsoversikt' />
              <Tabs.Tab value='krav' label='Etterlevelseskrav' />
              <Tabs.Tab value='pvk' label='PVK' />
            </Tabs.List>
            <Tabs.Panel value='dok_pvk'>
              <div className='dashboard-table-wrapper'>
                <Table
                  className='mt-4 dashboard-table'
                  size='small'
                  zebraStripes
                  sort={sort}
                  onSortChange={(sortKey) => handleSort(sort, setSort, sortKey)}
                >
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader sortable sortKey='dok'>
                        Etterlevelsesdokument
                      </Table.ColumnHeader>
                      <Table.ColumnHeader sortable sortKey='team'>
                        Team
                      </Table.ColumnHeader>
                      <Table.ColumnHeader sortable sortKey='person'>
                        Person
                      </Table.ColumnHeader>
                      <Table.ColumnHeader sortable sortKey='risikoeier'>
                        Risikoeier
                      </Table.ColumnHeader>
                      <Table.ColumnHeader sortable sortKey='etterlevelse'>
                        Etterlevelse
                      </Table.ColumnHeader>
                      <Table.ColumnHeader sortable sortKey='pvk'>
                        PVK
                      </Table.ColumnHeader>
                      <Table.ColumnHeader sortable sortKey='behandlinger'>
                        Behandlinger
                      </Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {sortedDoks.map((dok) => {
                      return (
                        <Table.Row key={dok.etterlevelseDokumentasjonId}>
                          <Table.DataCell>
                            <Link
                              href={`/dokumentasjon/${dok.etterlevelseDokumentasjonId}`}
                              target='_blank'
                            >
                              E{dok.etterlevelseNummer}.{dok.etterlevelseDokumentVersjon}{' '}
                              {dok.etterlevelseDokumentasjonTittel}
                            </Link>
                          </Table.DataCell>
                          <Table.DataCell>
                            {dok.teamsData && dok.teamsData.length > 0
                              ? dok.teamsData.map((team) => team.name).join(', ')
                              : '-'}
                          </Table.DataCell>
                          <Table.DataCell>
                            {dok.resourcesData && dok.resourcesData.length > 0
                              ? dok.resourcesData.map((resource) => (
                                  <div key={resource.navIdent}>{resource.fullName}</div>
                                ))
                              : '-'}
                          </Table.DataCell>
                          <Table.DataCell>
                            {dok.risikoeiereData && dok.risikoeiereData.length > 0
                              ? dok.risikoeiereData.map((risikoeier) => (
                                  <div key={risikoeier.navIdent}>{risikoeier.fullName}</div>
                                ))
                              : '-'}
                          </Table.DataCell>
                          <Table.DataCell>
                            {getEtterlevelseDokumentStatusText(dok.etterlevelseDokumentasjonStatus)}
                          </Table.DataCell>
                          <Table.DataCell>
                            {getPvkStatusText(
                              dok.pvkVurdering,
                              dok.pvkDokumentStatus,
                              dok.hasPvkDocumentationStarted
                            )}
                          </Table.DataCell>
                          <Table.DataCell>
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
                        </Table.Row>
                      )
                    })}
                  </Table.Body>
                </Table>
              </div>
            </Tabs.Panel>

            <Tabs.Panel value='krav'>
              <div className='dashboard-table-wrapper'>
                <Table
                  className='mt-4 dashboard-table'
                  size='small'
                  zebraStripes
                  sort={sort}
                  onSortChange={(sortKey) => handleSort(sort, setSort, sortKey)}
                >
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader sortable sortKey='dok'>
                        Etterlevelsesdokument
                      </Table.ColumnHeader>
                      <Table.ColumnHeader sortable sortKey='team'>
                        Team
                      </Table.ColumnHeader>
                      <Table.ColumnHeader sortable sortKey='person'>
                        Person
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
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {sortedDoks.map((dok) => {
                      return (
                        <Table.Row key={dok.etterlevelseDokumentasjonId}>
                          <Table.DataCell>
                            <Link
                              href={`/dokumentasjon/${dok.etterlevelseDokumentasjonId}`}
                              target='_blank'
                            >
                              E{dok.etterlevelseNummer}.{dok.etterlevelseDokumentVersjon}{' '}
                              {dok.etterlevelseDokumentasjonTittel}
                            </Link>
                          </Table.DataCell>
                          <Table.DataCell>
                            {dok.teamsData && dok.teamsData.length > 0
                              ? dok.teamsData.map((team) => team.name).join(', ')
                              : '-'}
                          </Table.DataCell>
                          <Table.DataCell>
                            {dok.resourcesData && dok.resourcesData.length > 0
                              ? dok.resourcesData.map((resource) => (
                                  <div key={resource.navIdent}>{resource.fullName}</div>
                                ))
                              : '-'}
                          </Table.DataCell>
                          <Table.DataCell>
                            {dok.risikoeiereData && dok.risikoeiereData.length > 0
                              ? dok.risikoeiereData.map((risikoeier) => (
                                  <div key={risikoeier.navIdent}>{risikoeier.fullName}</div>
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
                              color={getOppfyltTrafficColor(
                                dok.antallOppfyltKrav || 0,
                                dok.antallKrav || 0
                              )}
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
                        </Table.Row>
                      )
                    })}
                  </Table.Body>
                </Table>
              </div>
            </Tabs.Panel>

            <Tabs.Panel value='pvk'>
              <div className='dashboard-table-wrapper'>
                <Table
                  className='mt-4 dashboard-table'
                  size='small'
                  zebraStripes
                  sort={sort}
                  onSortChange={(sortKey) => handleSort(sort, setSort, sortKey)}
                >
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader sortable sortKey='dok'>
                        Etterlevelsesdokument
                      </Table.ColumnHeader>
                      <Table.ColumnHeader sortable sortKey='team'>
                        Team
                      </Table.ColumnHeader>
                      <Table.ColumnHeader sortable sortKey='person'>
                        Person
                      </Table.ColumnHeader>
                      <Table.ColumnHeader sortable sortKey='risikoeier'>
                        Risikoeier
                      </Table.ColumnHeader>
                      <Table.ColumnHeader sortable sortKey='pvkStatus'>
                        PVK-status
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
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {sortedDoks.map((dok) => {
                      return (
                        <Table.Row key={dok.etterlevelseDokumentasjonId}>
                          <Table.DataCell>
                            <Link
                              href={`/dokumentasjon/${dok.etterlevelseDokumentasjonId}`}
                              target='_blank'
                            >
                              E{dok.etterlevelseNummer}.{dok.etterlevelseDokumentVersjon}{' '}
                              {dok.etterlevelseDokumentasjonTittel}
                            </Link>
                          </Table.DataCell>
                          <Table.DataCell>
                            {dok.teamsData && dok.teamsData.length > 0
                              ? dok.teamsData.map((team) => team.name).join(', ')
                              : '-'}
                          </Table.DataCell>
                          <Table.DataCell>
                            {dok.resourcesData && dok.resourcesData.length > 0
                              ? dok.resourcesData.map((resource) => (
                                  <div key={resource.navIdent}>{resource.fullName}</div>
                                ))
                              : '-'}
                          </Table.DataCell>
                          <Table.DataCell>
                            {dok.risikoeiereData && dok.risikoeiereData.length > 0
                              ? dok.risikoeiereData.map((risikoeier) => (
                                  <div key={risikoeier.navIdent}>{risikoeier.fullName}</div>
                                ))
                              : '-'}
                          </Table.DataCell>
                          <Table.DataCell>
                            {getPvkStatusText(
                              dok.pvkVurdering,
                              dok.pvkDokumentStatus,
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
                        </Table.Row>
                      )
                    })}
                  </Table.Body>
                </Table>
              </div>
            </Tabs.Panel>
          </Tabs>
        )}
      </div>
    </PageLayout>
  )
}

export default AvdelingDetailPage
