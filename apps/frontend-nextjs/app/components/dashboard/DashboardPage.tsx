'use client'

import { getDashboardStats } from '@/api/dashboard/dashboardApi'
import { DashboardOverviewCard } from '@/components/dashboard/DashboardOverviewCard'
import { PageLayout } from '@/components/others/scaffold/scaffold'
import { IAvdelingDashboardStats } from '@/constants/dashboard/dashboardConstants'
import { InformationSquareIcon } from '@navikt/aksel-icons'
import { Heading, InfoCard, Link, LinkCard, LocalAlert, Tabs, Tag } from '@navikt/ds-react'
import { useEffect, useState } from 'react'
import { CenteredLoader } from '../common/centeredLoader/centeredLoader'

const DashboardPage = () => {
  const [stats, setStats] = useState<IAvdelingDashboardStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const result = await getDashboardStats()
        setStats(result)
      } catch {
        setError('Kunne ikke hente dashboard-data. Prøv igjen senere.')
      } finally {
        setIsLoading(false)
      }
    })()
  }, [])

  return (
    <PageLayout pageTitle='Dashboard' currentPage='Dashboard' breadcrumbPaths={[]}>
      <div className='flex justify-between items-center mt-4'>
        <Heading size='large' level='1'>
          Status i organisasjon
        </Heading>
      </div>

      {error && (
        <LocalAlert status='error' className='mt-4'>
          <LocalAlert.Header>
            <LocalAlert.Title as='h2'>Feil</LocalAlert.Title>
          </LocalAlert.Header>
          <LocalAlert.Content>{error}</LocalAlert.Content>
        </LocalAlert>
      )}

      {isLoading && <CenteredLoader />}

      {!isLoading && !error && (
        <>
          <div className='rounded-lg p-6 mt-8' style={{ backgroundColor: '#e3eff7' }}>
            <Heading size='medium' level='2'>
              Oversikt i Nav
            </Heading>

            <Tabs className='mt-4' defaultValue='figurer-overview'>
              <Tabs.List>
                <Tabs.Tab value='figurer-overview' label='Vis figurer' />
                <Tabs.Tab value='nokkeltall-overview' label='Vis nøkkeltall' />
              </Tabs.List>

              <Tabs.Panel value='figurer-overview'>
                <div className='mt-6'>
                  <DashboardOverviewCard stats={stats} view='figurer' />
                </div>
              </Tabs.Panel>
              <Tabs.Panel value='nokkeltall-overview'>
                <div className='mt-6'>
                  <DashboardOverviewCard stats={stats} view='nokkeltall' />
                </div>
              </Tabs.Panel>
            </Tabs>

            <LinkCard
              className='mt-8 max-w-md'
              data-color='accent'
              style={{ color: 'var(--ax-text-subtle)' }}
            >
              <LinkCard.Title>
                <LinkCard.Anchor href='/dashboard/tema'>
                  Se etterlevelse inndelt etter tema
                </LinkCard.Anchor>
              </LinkCard.Title>
            </LinkCard>
          </div>

          <div className='rounded-lg p-6 mt-8' style={{ backgroundColor: '#e3eff7' }}>
            <Heading size='medium' level='2'>
              Avdelinger i Nav
            </Heading>

            <ul className='flex flex-col gap-4 mt-4 list-none p-0'>
              {stats.map((avdelingStats) => (
                <li key={avdelingStats.avdelingId}>
                  <LinkCard data-color='accent' style={{ color: 'var(--ax-text-subtle)' }}>
                    <LinkCard.Title>
                      <LinkCard.Anchor href={`/dashboard/${avdelingStats.avdelingId}`}>
                        {avdelingStats.avdelingNavn}
                      </LinkCard.Anchor>
                    </LinkCard.Title>
                    <LinkCard.Footer>
                      <div className='flex gap-2'>
                        <Tag
                          size='small'
                          variant='neutral'
                          style={{ backgroundColor: '#d5f6db', color: '#000' }}
                        >
                          {avdelingStats.dokumenter.total} etterlevelsesdokumenter
                        </Tag>
                        <Tag size='small' variant='info-filled'>
                          {avdelingStats.pvk.total} Personvernkonsekvensvurderinger
                        </Tag>
                      </div>
                    </LinkCard.Footer>
                  </LinkCard>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      <InfoCard data-color='info' className='mt-8'>
        <InfoCard.Header icon={<InformationSquareIcon aria-hidden />}>
          <InfoCard.Title as='h2'>
            Savner du noe, eller har du tilbakemelding til oss?
          </InfoCard.Title>
        </InfoCard.Header>
        <InfoCard.Content>
          Hvis du savner et visst etterlevelsesdokument i listen, sjekk hvilke filtre som er valgt i
          søkefeltet, eller se{' '}
          <Link href='/dashboard/ingen-avdeling' target='_blank'>
            listen over etterlevelsesdokumenter der avdeling/seksjon ikke er valgt (åpner i en ny
            fane)
          </Link>
          . Hvis du har andre tilbakemeldinger om dashboards, bli med på #etterlevelse på Slack,
          eller send mail til teamdatajegerne@nav.no.
        </InfoCard.Content>
      </InfoCard>
    </PageLayout>
  )
}

export default DashboardPage
