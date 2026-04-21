'use client'

import {
  IAvdelingDashboardStats,
  IAvdelingDetailData,
  getAvdelingDetailStats,
} from '@/api/dashboard/dashboardApi'
import { usePersonName, useTeam } from '@/api/teamkatalogen/teamkatalogenApi'
import { DashboardCard } from '@/components/dashboard/DashboardCard'
import { DashboardPieCard } from '@/components/dashboard/DashboardPieCard'
import { PageLayout } from '@/components/others/scaffold/scaffold'
import { EEtterlevelseDokumentasjonStatus } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import {
  EPvkDokumentStatus,
  EPvkVurdering,
  IPvkDokument,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { handleSort } from '@/util/handleTableSort'
import {
  Link as AkselLink,
  Heading,
  Loader,
  LocalAlert,
  Select,
  SortState,
  Table,
  Tabs,
} from '@navikt/ds-react'
import moment from 'moment'
import { useEffect, useMemo, useState } from 'react'

interface IProps {
  avdelingId: string
}

const getEtterlevelseStatusText = (status: EEtterlevelseDokumentasjonStatus): string => {
  switch (status) {
    case EEtterlevelseDokumentasjonStatus.UNDER_ARBEID:
      return 'Under arbeid'
    case EEtterlevelseDokumentasjonStatus.SENDT_TIL_GODKJENNING_TIL_RISIKOEIER:
      return 'Sendt til godkjenning'
    case EEtterlevelseDokumentasjonStatus.GODKJENT_AV_RISIKOEIER:
      return 'Godkjent'
    default:
      return 'Ukjent'
  }
}

const getPvkStatusText = (pvk?: IPvkDokument): string => {
  if (!pvk) return 'Ikke vurdert behov'
  if (pvk.pvkVurdering === EPvkVurdering.SKAL_IKKE_UTFORE) return 'Vurdert: ikke behov'
  if (pvk.pvkVurdering === EPvkVurdering.ALLEREDE_UTFORT) return 'PVK i Word'
  if (!pvk.hasPvkDocumentationStarted) return 'Ikke påbegynt'
  if (pvk.status === EPvkDokumentStatus.GODKJENT_AV_RISIKOEIER) return 'Godkjent av risikoeier'
  if (pvk.status === EPvkDokumentStatus.TRENGER_GODKJENNING) return 'Sendt til risikoeier'
  if (
    pvk.status === EPvkDokumentStatus.SENDT_TIL_PVO ||
    pvk.status === EPvkDokumentStatus.PVO_UNDERARBEID ||
    pvk.status === EPvkDokumentStatus.SENDT_TIL_PVO_FOR_REVURDERING
  )
    return 'Sendt til PVO'
  if (pvk.status === EPvkDokumentStatus.VURDERT_AV_PVO) return 'Fått tilbakemelding fra PVO'
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
  const [data, setData] = useState<IAvdelingDetailData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSeksjon, setSelectedSeksjon] = useState<string>('')
  const [activeTab, setActiveTab] = useState('figurer')
  const [tableTab, setTableTab] = useState('dok_pvk')
  const [sort, setSort] = useState<SortState | undefined>()
  const getTeamName = useTeam()
  const getPersonName = usePersonName()

  useEffect(() => {
    getAvdelingDetailStats(avdelingId)
      .then(setData)
      .finally(() => setIsLoading(false))
  }, [avdelingId])

  const filteredDoks = data
    ? selectedSeksjon
      ? data.dokumentasjoner.filter((d) =>
          d.seksjoner?.some((s) => s.nomSeksjonId === selectedSeksjon)
        )
      : data.dokumentasjoner
    : []

  const sortedDoks = useMemo(() => {
    if (!sort || !data) return filteredDoks
    const dir = sort.direction === 'ascending' ? 1 : -1
    return [...filteredDoks].sort((a, b) => {
      const getValue = (dok: typeof a): string | number => {
        switch (sort.orderBy) {
          case 'dok':
            return `E${dok.etterlevelseNummer} ${dok.title}`
          case 'team':
            return dok.teams?.map((id) => getTeamName(id)[0]).join(', ') || ''
          case 'person':
            return dok.resources?.map((id) => getPersonName(id)).join(', ') || ''
          case 'risikoeier':
            return dok.risikoeiere?.map((id) => getPersonName(id)).join(', ') || ''
          case 'etterlevelse':
            return getEtterlevelseStatusText(dok.status)
          case 'pvk':
            return getPvkStatusText(data.pvkByDokId.get(dok.id))
          case 'dato':
            return dok.changeStamp?.lastModifiedDate || ''
          case 'behandlinger':
            return (
              data.kravStatsByDokId
                .get(dok.id)
                ?.behandlinger.map((b) => b.navn)
                .join(', ') || ''
            )
          case 'krav':
            return data.kravStatsByDokId.get(dok.id)?.ferdigDokumentert || 0
          case 'oppfylt': {
            const stats = data.kravStatsByDokId.get(dok.id)
            return stats && stats.totalKrav > 0
              ? Math.round((stats.ferdigDokumentert / stats.totalKrav) * 100)
              : 0
          }
          case 'pvkStatus':
            return getPvkStatusText(data.pvkByDokId.get(dok.id))
          case 'antallScenarioer':
            return data.pvkStatsByDokId.get(dok.id)?.antallScenarioer || 0
          case 'hoyRisiko':
            return data.pvkStatsByDokId.get(dok.id)?.hoyRisikoScenarioer || 0
          case 'hoyRisikoEtterTiltak':
            return data.pvkStatsByDokId.get(dok.id)?.hoyRisikoEtterTiltak || 0
          case 'ikkeIverksatte':
            return data.pvkStatsByDokId.get(dok.id)?.ikkeIverksatteTiltak || 0
          case 'fristPassert':
            return data.pvkStatsByDokId.get(dok.id)?.tiltakFristPassert || 0
          default:
            return ''
        }
      }
      const aVal = getValue(a)
      const bVal = getValue(b)
      if (typeof aVal === 'number' && typeof bVal === 'number') return (aVal - bVal) * dir
      return String(aVal).localeCompare(String(bVal)) * dir
    })
  }, [filteredDoks, sort, data])

  if (isLoading) {
    return (
      <PageLayout
        pageTitle='Dashboard'
        currentPage='Dashboard'
        breadcrumbPaths={[{ href: '/', pathName: 'Forsiden' }]}
      >
        <div className='flex justify-center mt-12'>
          <Loader size='xlarge' />
        </div>
      </PageLayout>
    )
  }

  if (!data) return null

  const currentStats: IAvdelingDashboardStats =
    selectedSeksjon && data.statsBySeksjon.get(selectedSeksjon)
      ? data.statsBySeksjon.get(selectedSeksjon)!
      : data.totalStats

  return (
    <PageLayout
      pageTitle={data.avdelingNavn}
      currentPage={data.avdelingNavn}
      breadcrumbPaths={[
        { href: '/', pathName: 'Forsiden' },
        { href: '/dashboard', pathName: 'Dashboard' },
      ]}
    >
      <div className='mt-4'>
        <Heading size='large' level='1'>
          {data.avdelingNavn}
        </Heading>
      </div>

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

      <Tabs value={activeTab} onChange={setActiveTab} className='mt-4'>
        <Tabs.List>
          <Tabs.Tab value='figurer' label='Vis figurer' />
          <Tabs.Tab value='nokkeltall' label='Vis nøkkeltall' />
        </Tabs.List>
      </Tabs>

      {activeTab === 'figurer' ? (
        <div className='mt-6'>
          <DashboardPieCard stats={currentStats} hideHeader />
        </div>
      ) : (
        <div className='mt-6'>
          <DashboardCard stats={currentStats} hideHeader />
        </div>
      )}

      <div className='dashboard-full-width-breakout'>
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
            <Tabs.Tab value='krav' label='Krav og suksesskriterier' />
            <Tabs.Tab value='pvk' label='PVK' />
          </Tabs.List>
        </Tabs>

        {tableTab === 'dok_pvk' && (
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
                  <Table.ColumnHeader sortable sortKey='dato'>
                    Sist oppdatert
                  </Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {sortedDoks.map((dok) => {
                  const pvk = data.pvkByDokId.get(dok.id)
                  const kravStats = data.kravStatsByDokId.get(dok.id)
                  return (
                    <Table.Row key={dok.id}>
                      <Table.DataCell>
                        <AkselLink href={`/dokumentasjon/${dok.id}`} target='_blank'>
                          E{dok.etterlevelseNummer} {dok.title}
                        </AkselLink>
                      </Table.DataCell>
                      <Table.DataCell>
                        {dok.teams?.length
                          ? dok.teams.map((id) => getTeamName(id)[0]).join(', ')
                          : '-'}
                      </Table.DataCell>
                      <Table.DataCell>
                        {dok.resources?.length
                          ? dok.resources.map((id) => <div key={id}>{getPersonName(id)}</div>)
                          : '-'}
                      </Table.DataCell>
                      <Table.DataCell>
                        {dok.risikoeiere?.length
                          ? dok.risikoeiere.map((id) => <div key={id}>{getPersonName(id)}</div>)
                          : '-'}
                      </Table.DataCell>
                      <Table.DataCell>{getEtterlevelseStatusText(dok.status)}</Table.DataCell>
                      <Table.DataCell>{getPvkStatusText(pvk)}</Table.DataCell>
                      <Table.DataCell>
                        {kravStats?.behandlinger.map((b) => (
                          <div key={b.id}>
                            <AkselLink
                              href={`https://behandlingskatalog.intern.nav.no/process/purpose/NAV/${b.id}`}
                              target='_blank'
                            >
                              B{b.nummer} {b.navn}
                            </AkselLink>
                          </div>
                        )) || '-'}
                      </Table.DataCell>
                      <Table.DataCell>
                        {dok.changeStamp?.lastModifiedDate
                          ? moment(dok.changeStamp.lastModifiedDate).format('D. MMMM YYYY')
                          : '-'}
                      </Table.DataCell>
                    </Table.Row>
                  )
                })}
              </Table.Body>
            </Table>
          </div>
        )}

        {tableTab === 'krav' && (
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
                  <Table.ColumnHeader sortable sortKey='dato'>
                    Sist oppdatert
                  </Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {sortedDoks.map((dok) => {
                  const kravStats = data.kravStatsByDokId.get(dok.id)
                  const ferdig = kravStats?.ferdigDokumentert || 0
                  const totalKrav = kravStats?.totalKrav || 0
                  const oppfyltPct = totalKrav > 0 ? Math.round((ferdig / totalKrav) * 100) : 0
                  return (
                    <Table.Row key={dok.id}>
                      <Table.DataCell>
                        <AkselLink href={`/dokumentasjon/${dok.id}`} target='_blank'>
                          E{dok.etterlevelseNummer} {dok.title}
                        </AkselLink>
                      </Table.DataCell>
                      <Table.DataCell>
                        {dok.teams?.length
                          ? dok.teams.map((id) => getTeamName(id)[0]).join(', ')
                          : '-'}
                      </Table.DataCell>
                      <Table.DataCell>
                        {dok.resources?.length
                          ? dok.resources.map((id) => <div key={id}>{getPersonName(id)}</div>)
                          : '-'}
                      </Table.DataCell>
                      <Table.DataCell>
                        {dok.risikoeiere?.length
                          ? dok.risikoeiere.map((id) => <div key={id}>{getPersonName(id)}</div>)
                          : '-'}
                      </Table.DataCell>
                      <Table.DataCell align='center'>
                        <TrafficDot color={getKravTrafficColor(ferdig, totalKrav)} />
                        {ferdig} av {totalKrav}
                      </Table.DataCell>
                      <Table.DataCell align='center'>
                        <TrafficDot color={getOppfyltTrafficColor(ferdig, totalKrav)} />
                        {totalKrav > 0 ? `${oppfyltPct}%` : '-'}
                      </Table.DataCell>
                      <Table.DataCell>
                        {dok.changeStamp?.lastModifiedDate
                          ? moment(dok.changeStamp.lastModifiedDate).format('D. MMMM YYYY')
                          : '-'}
                      </Table.DataCell>
                    </Table.Row>
                  )
                })}
              </Table.Body>
            </Table>
          </div>
        )}

        {tableTab === 'pvk' && (
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
                  <Table.ColumnHeader sortable sortKey='dato'>
                    Sist oppdatert
                  </Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {sortedDoks.map((dok) => {
                  const pvk = data.pvkByDokId.get(dok.id)
                  const pvkStats = data.pvkStatsByDokId.get(dok.id)
                  return (
                    <Table.Row key={dok.id}>
                      <Table.DataCell>
                        <AkselLink href={`/dokumentasjon/${dok.id}`} target='_blank'>
                          E{dok.etterlevelseNummer} {dok.title}
                        </AkselLink>
                      </Table.DataCell>
                      <Table.DataCell>
                        {dok.teams?.length
                          ? dok.teams.map((id) => getTeamName(id)[0]).join(', ')
                          : '-'}
                      </Table.DataCell>
                      <Table.DataCell>
                        {dok.resources?.length
                          ? dok.resources.map((id) => <div key={id}>{getPersonName(id)}</div>)
                          : '-'}
                      </Table.DataCell>
                      <Table.DataCell>
                        {dok.risikoeiere?.length
                          ? dok.risikoeiere.map((id) => <div key={id}>{getPersonName(id)}</div>)
                          : '-'}
                      </Table.DataCell>
                      <Table.DataCell>{getPvkStatusText(pvk)}</Table.DataCell>
                      <Table.DataCell align='center'>
                        {pvkStats ? pvkStats.antallScenarioer : '-'}
                      </Table.DataCell>
                      <Table.DataCell align='center'>
                        {pvkStats && pvkStats.hoyRisikoScenarioer > 0 ? (
                          <span className='inline-flex items-center'>
                            <TrafficDot color='#C30000' />
                            {pvkStats.hoyRisikoScenarioer}
                          </span>
                        ) : (
                          '-'
                        )}
                      </Table.DataCell>
                      <Table.DataCell align='center'>
                        {pvkStats && pvkStats.hoyRisikoEtterTiltak > 0 ? (
                          <span className='inline-flex items-center'>
                            <TrafficDot color='#C30000' />
                            {pvkStats.hoyRisikoEtterTiltak}
                          </span>
                        ) : pvkStats ? (
                          '0'
                        ) : (
                          '-'
                        )}
                      </Table.DataCell>
                      <Table.DataCell align='center'>
                        {pvkStats ? pvkStats.ikkeIverksatteTiltak : '-'}
                      </Table.DataCell>
                      <Table.DataCell align='center'>
                        {pvkStats && pvkStats.tiltakFristPassert > 0 ? (
                          <span className='inline-flex items-center'>
                            <TrafficDot color='#C30000' />
                            {pvkStats.tiltakFristPassert}
                          </span>
                        ) : pvkStats ? (
                          '0'
                        ) : (
                          '-'
                        )}
                      </Table.DataCell>
                      <Table.DataCell>
                        {dok.changeStamp?.lastModifiedDate
                          ? moment(dok.changeStamp.lastModifiedDate).format('D. MMMM YYYY')
                          : '-'}
                      </Table.DataCell>
                    </Table.Row>
                  )
                })}
              </Table.Body>
            </Table>
          </div>
        )}
      </div>
    </PageLayout>
  )
}

export default AvdelingDetailPage
