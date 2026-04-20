'use client'

import {
  IAvdelingDashboardStats,
  IAvdelingDetailData,
  getAvdelingDetailStats,
} from '@/api/dashboard/dashboardApi'
import { DashboardCard } from '@/components/dashboard/DashboardCard'
import { DashboardPieCard } from '@/components/dashboard/DashboardPieCard'
import { PageLayout } from '@/components/others/scaffold/scaffold'
import { BodyShort, Heading, Loader, Select, Tabs } from '@navikt/ds-react'
import { useEffect, useState } from 'react'

interface IProps {
  avdelingId: string
}

const AvdelingDetailPage = ({ avdelingId }: IProps) => {
  const [data, setData] = useState<IAvdelingDetailData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSeksjon, setSelectedSeksjon] = useState<string>('')
  const [activeTab, setActiveTab] = useState('figurer')

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

  const vurdertBehov =
    currentStats.behovForPvk.totalMedPersonopplysninger - currentStats.behovForPvk.ikkeVurdertBehov

  return (
    <PageLayout
      pageTitle={data.avdelingNavn}
      currentPage={data.avdelingNavn}
      breadcrumbPaths={[
        { href: '/', pathName: 'Forsiden' },
        { href: '/dashboard', pathName: 'Dashboard' },
      ]}
    >
      <div className='flex justify-between items-start mt-4'>
        <Heading size='large' level='1'>
          {data.avdelingNavn}
        </Heading>
        <div
          style={{
            padding: '12px 16px',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            backgroundColor: 'white',
          }}
        >
          <BodyShort>
            Vurdert behov for PVK{' '}
            <span className='font-bold'>
              {vurdertBehov} av {currentStats.behovForPvk.totalMedPersonopplysninger}
            </span>
          </BodyShort>
        </div>
      </div>

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
    </PageLayout>
  )
}

export default AvdelingDetailPage
