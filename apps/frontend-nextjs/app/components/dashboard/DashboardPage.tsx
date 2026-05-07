'use client'

import { getDashboardStats } from '@/api/dashboard/dashboardApi'
import { DashboardBarCard } from '@/components/dashboard/DashboardBarCard'
import { DashboardCard } from '@/components/dashboard/DashboardCard'
import { PageLayout } from '@/components/others/scaffold/scaffold'
import { IAvdelingDashboardStats } from '@/constants/dashboard/dashboardConstants'
import { Heading, LocalAlert, Select, Tabs } from '@navikt/ds-react'
import { useEffect, useState } from 'react'
import { CenteredLoader } from '../common/centeredLoader/centeredLoader'

const DashboardPage = () => {
  const [stats, setStats] = useState<IAvdelingDashboardStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAvdeling, setSelectedAvdeling] = useState<string>('')

  useEffect(() => {
    ;(async () => {
      await getDashboardStats()
        .then(setStats)
        .finally(() => setIsLoading(false))
    })()
  }, [])

  const filteredStats = selectedAvdeling
    ? stats.filter((s) => s.avdelingId === selectedAvdeling)
    : stats

  return (
    <PageLayout pageTitle='Dashboard' currentPage='Dashboard' breadcrumbPaths={[]}>
      <div className='flex justify-between items-center mt-4'>
        <Heading size='large' level='1'>
          Status i organisasjon
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

      <Heading size='medium' level='2' className='mt-4'>
        Avdelingoversikt
      </Heading>

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

      {isLoading && <CenteredLoader />}

      {!isLoading && (
        <Tabs className='mt-4' defaultValue='figurer'>
          <Tabs.List>
            <Tabs.Tab value='figurer' label='Vis figurer' />
            <Tabs.Tab value='nokkeltall' label='Vis nøkkeltall' />
          </Tabs.List>

          <Tabs.Panel value='figurer'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6'>
              {filteredStats.map((avdelingStats) => (
                <DashboardBarCard
                  key={avdelingStats.avdelingId}
                  stats={avdelingStats}
                  subHeadingLevel='4'
                />
              ))}
            </div>
          </Tabs.Panel>
          <Tabs.Panel value='nokkeltall'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6'>
              {filteredStats.map((avdelingStats) => (
                <DashboardCard
                  key={avdelingStats.avdelingId}
                  stats={avdelingStats}
                  subHeadingLevel='4'
                />
              ))}
            </div>
          </Tabs.Panel>
        </Tabs>
      )}
    </PageLayout>
  )
}

export default DashboardPage
