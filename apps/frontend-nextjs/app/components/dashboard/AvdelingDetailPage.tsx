'use client'

import {
  IAvdelingDashboardStats,
  IAvdelingDetailData,
  getAvdelingDetailStats,
} from '@/api/dashboard/dashboardApi'
import { DashboardCard } from '@/components/dashboard/DashboardCard'
import { DashboardPieCard } from '@/components/dashboard/DashboardPieCard'
import { PageLayout } from '@/components/others/scaffold/scaffold'
import { EEtterlevelseDokumentasjonStatus } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import {
  EPvkDokumentStatus,
  EPvkVurdering,
  IPvkDokument,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { Link as AkselLink, Heading, Loader, Select, Table, Tabs } from '@navikt/ds-react'
import moment from 'moment'
import { useEffect, useState } from 'react'

interface IProps {
  avdelingId: string
}

const getEtterlevelseStatusText = (status: EEtterlevelseDokumentasjonStatus): string => {
  switch (status) {
    case EEtterlevelseDokumentasjonStatus.UNDER_ARBEID:
      return 'Ikke påbegynt'
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
  if (!pvk.hasPvkDocumentationStarted) return 'Vurdert: behov – ikke påbegynt'
  if (pvk.status === EPvkDokumentStatus.GODKJENT_AV_RISIKOEIER) return 'Godkjent av risikoeier'
  if (
    pvk.status === EPvkDokumentStatus.SENDT_TIL_PVO ||
    pvk.status === EPvkDokumentStatus.PVO_UNDERARBEID ||
    pvk.status === EPvkDokumentStatus.SENDT_TIL_PVO_FOR_REVURDERING
  )
    return 'Sendt til PVO'
  if (
    pvk.status === EPvkDokumentStatus.VURDERT_AV_PVO ||
    pvk.status === EPvkDokumentStatus.VURDERT_AV_PVO_TRENGER_MER_ARBEID
  )
    return 'Fått tilbakemelding fra PVO'
  return 'Under arbeid'
}

const AvdelingDetailPage = ({ avdelingId }: IProps) => {
  const [data, setData] = useState<IAvdelingDetailData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSeksjon, setSelectedSeksjon] = useState<string>('')
  const [activeTab, setActiveTab] = useState('figurer')
  const [tableTab, setTableTab] = useState('dok_pvk')

  useEffect(() => {
    getAvdelingDetailStats(avdelingId)
      .then(setData)
      .finally(() => setIsLoading(false))
  }, [avdelingId])

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

  const filteredDoks = selectedSeksjon
    ? data.dokumentasjoner.filter((d) =>
        d.seksjoner?.some((s) => s.nomSeksjonId === selectedSeksjon)
      )
    : data.dokumentasjoner

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

      {data.seksjoner.length > 0 && (
        <Select
          label='Velg seksjon'
          className='mt-4 w-64'
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

      <Tabs value={tableTab} onChange={setTableTab} className='mt-10'>
        <Tabs.List>
          <Tabs.Tab value='dok_pvk' label='Etterlevelsesdokumentasjon og PVK-er' />
          <Tabs.Tab value='krav' label='Krav og suksesskriterier' />
          <Tabs.Tab value='pvk' label='PVK' />
        </Tabs.List>
      </Tabs>

      {tableTab === 'dok_pvk' && (
        <Table className='mt-4' size='small'>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Etterlevelsesdokument</Table.ColumnHeader>
              <Table.ColumnHeader>Team</Table.ColumnHeader>
              <Table.ColumnHeader>Person</Table.ColumnHeader>
              <Table.ColumnHeader>Risikoeier</Table.ColumnHeader>
              <Table.ColumnHeader>Etterlevelse</Table.ColumnHeader>
              <Table.ColumnHeader>PVK</Table.ColumnHeader>
              <Table.ColumnHeader>Sist oppdatert</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {filteredDoks.map((dok) => {
              const pvk = data.pvkByDokId.get(dok.id)
              return (
                <Table.Row key={dok.id}>
                  <Table.DataCell>
                    <AkselLink href={`/dokumentasjon/${dok.id}`}>
                      E{dok.etterlevelseNummer} {dok.title}
                    </AkselLink>
                  </Table.DataCell>
                  <Table.DataCell>
                    {dok.teamsData?.map((t) => t.name).join(', ') || '-'}
                  </Table.DataCell>
                  <Table.DataCell>
                    {dok.resourcesData?.map((r) => r.fullName).join(', ') || '-'}
                  </Table.DataCell>
                  <Table.DataCell>
                    {dok.risikoeiereData?.map((r) => r.fullName).join(', ') || '-'}
                  </Table.DataCell>
                  <Table.DataCell>{getEtterlevelseStatusText(dok.status)}</Table.DataCell>
                  <Table.DataCell>{getPvkStatusText(pvk)}</Table.DataCell>
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
      )}
    </PageLayout>
  )
}

export default AvdelingDetailPage
