'use client'

import { IAvdelingDashboardStats, getDashboardStats } from '@/api/dashboard/dashboardApi'
import { DashboardCard } from '@/components/dashboard/DashboardCard'
import { DashboardPieCard } from '@/components/dashboard/DashboardPieCard'
import { PageLayout } from '@/components/others/scaffold/scaffold'
import { Heading, Loader, LocalAlert, Select, Tabs } from '@navikt/ds-react'
import { useEffect, useState } from 'react'

const DashboardPage = () => {
  const [stats, setStats] = useState<IAvdelingDashboardStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('figurer')
  const [selectedAvdeling, setSelectedAvdeling] = useState<string>('')

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .finally(() => setIsLoading(false))
  }, [])

  const filteredStats = selectedAvdeling
    ? stats.filter((s) => s.avdelingId === selectedAvdeling)
    : stats

  return (
    <PageLayout
      pageTitle='Dashboard'
      currentPage='Dashboard'
      breadcrumbPaths={[{ href: '/', pathName: 'Forsiden' }]}
    >
      <div className='flex justify-between items-center mt-4'>
        <Heading size='large' level='1'>
          Status i organisasjon
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

      <Select
        label='Velg avdeling'
        className='mt-4 w-fit min-w-64'
        value={selectedAvdeling}
        onChange={(e) => setSelectedAvdeling(e.target.value)}
      >
        <option value=''>Alle avdelinger</option>
        {stats.map((s) => (
          <option key={s.avdelingId} value={s.avdelingId}>
            {s.avdelingNavn}
          </option>
        ))}
      </Select>

      <Tabs value={activeTab} onChange={setActiveTab} className='mt-4'>
        <Tabs.List>
          <Tabs.Tab value='figurer' label='Vis figurer' />
          <Tabs.Tab value='nokkeltall' label='Vis nøkkeltall' />
        </Tabs.List>
      </Tabs>

      {isLoading ? (
        <div className='flex justify-center mt-12'>
          <Loader size='xlarge' />
        </div>
      ) : activeTab === 'nokkeltall' ? (
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6'>
          {filteredStats.map((avdelingStats) => (
            <DashboardCard key={avdelingStats.avdelingId} stats={avdelingStats} />
          ))}
        </div>
      ) : (
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6'>
          {filteredStats.map((avdelingStats) => (
            <DashboardPieCard key={avdelingStats.avdelingId} stats={avdelingStats} />
          ))}
        </div>
      )}
    </PageLayout>
  )
}

export default DashboardPage
