'use client'

import { getDashboardStats } from '@/api/dashboard/dashboardApi'
import { DashboardOverviewCard } from '@/components/dashboard/DashboardOverviewCard'
import { PageLayout } from '@/components/others/scaffold/scaffold'
import { IAvdelingDashboardStats } from '@/constants/dashboard/dashboardConstants'
import { InformationSquareIcon } from '@navikt/aksel-icons'
import {
  Heading,
  InfoCard,
  Link,
  LinkCard,
  List,
  LocalAlert,
  ReadMore,
  Tabs,
  Tag,
} from '@navikt/ds-react'
import { useEffect, useState } from 'react'
import { CenteredLoader } from '../common/centeredLoader/centeredLoader'

const DashboardReadMore = () => (
  <div style={{ maxWidth: '75ch' }}>
    <ReadMore header='Hjelp til å tolke figurer og nøkkeltall om etterlevelse' className='mt-6'>
      <List>
        <List.Item>
          <strong>Hvorfor er så mange etterlevelsesdokumenter under arbeid?</strong>
          <br />
          Det at et etterlevelsesdokument er under arbeid er ikke nødvendigvis et dårlig tegn. I
          noen kontekster er det behov for å oppdatere etterlevelsesdokumentasjon oftere. Et
          eksempel er smidig produktutvikling, hvor nytt utviklingsarbeid kan tvinge en revurdering
          av hvordan man etterlever enkelte krav.
        </List.Item>
        <List.Item>
          <strong>Hvorfor er så få etterlevelsesdokumenter godkjent?</strong>
          <br />
          Det å kunne sende et etterlevelsesdokument til godkjenning hos risikoeieren utgjør nyere
          funksjonalitet i løsningen. Det forventes at andel godkjente etterlevelsesdokumenter vil
          øke etter hvert som flere sender til godkjenning. Når endringer gjøres etter godkjenning,
          vil etterlevelsesdokumentet igjen stå som under arbeid. Informasjon om når et
          etterlevelsesdokument sist ble godkjent finner du i tabellene under.
        </List.Item>
        <List.Item>
          <strong>Hva er forskjellen mellom etterlevelseskrav og suksesskriterier?</strong>
          <br />
          Hvert etterlevelseskrav består av ett eller flere suksesskriterier. Suksesskriterier er
          aktive handlinger som viser hva etterleveren konkret må gjøre for å etterleve kravet.
          Hvorvidt man etterlever kravet beskrives på suksesskriteriumsnivået.{' '}
          <Link
            href='/omstottetiletterlevelse#dette-inneholder-et-etterlevelseskrav'
            target='_blank'
          >
            Les mer om etterlevelseskrav og suksesskriterier (åpner i en ny fane)
          </Link>
          .
        </List.Item>
        <List.Item>
          <strong>Hvorfor er så mange suksesskriterier ikke relevant?</strong>
          <br />
          Det er begrenset med hvor mange irrelevante etterlevelseskrav man kan filtrert bort før en
          begynner å dokumentere etterlevelse. Dette gjør at etterleveren selv kan være nødt til å
          markere noen krav og suksesskriterier som &quot;ikke relevant&quot;
          <br />
          <br />
          <Link href='/omstottetiletterlevelse#hvordan-dokumentere-etterlevelse' target='_blank'>
            Les mer om dokumentering av etterlevelse (åpner i en ny fane)
          </Link>
        </List.Item>
      </List>
      <div className='mb-8' />
    </ReadMore>
    <ReadMore
      header='Hjelp til å tolke figurer og tall om personvernkonsekvensvurdering (PVK)'
      className='mt-2'
    >
      <List>
        <List.Item>
          <strong>Hva vil det si å vurdere behov for PVK?</strong>
          <br />I Støtte til etterlevelse er det mulig å gå inn og registrere at man har vurdert
          behov for PVK, og hva som ble konklusjonen. Muligheten vises for alle etterlevere som har
          valgt &quot;Behandler personopplysninger&quot; som egenskap i etterlevelsesdokumentet
          sitt. Det er viktig at vurderingen om behov for PVK registreres, uansett konklusjon, slik
          at Nav har oversikt.{' '}
          <Link href='/om-pvk#beslutningsstotte' target='_blank'>
            Les mer om beslutningsstøtte ved vurdering av behov for PVK (åpner i en ny fane)
          </Link>
          .
        </List.Item>
        <List.Item>
          <strong>Har vi statistikk om PVK i Word?</strong>
          <br />
          Vi har ikke statistikk om PVK i Word annet enn hva man registrerer under vurdering av
          behov for PVK. Her er det mulig å velge &quot;Vi har en tidligere godkjent PVK i
          Word&quot;. Etter hvert som PVK-en skal oppdateres og sendes til personvernombudet på
          nytt, skal etterleveren gå over til å bruke Digital PVK. Antall PVK i Word vil dermed
          senke med tiden, og statistikk om PVK bli mer detaljert når flere PVK-er ligger i ny
          løsning.
        </List.Item>
      </List>
    </ReadMore>
  </div>
)

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

      <ReadMore header='Hvordan bruker jeg denne siden?' className='mt-4 max-w-[75ch]'>
        <p>På denne siden kan du:</p>
        <List>
          <List.Item>
            Få oversikt over etterlevelse i hele Nav ved å se figurer og lese nøkkeltall om
            etterlevelse og personvernkonsekvensvurderinger (PVK)
          </List.Item>
          <List.Item>
            Navigere videre til etterlevelsesoversikt i Nav inndelt etter tema, eksempelvis arkiv og
            dokumentasjon, personvern og økonomi.
          </List.Item>
          <List.Item>
            Navigere til avdelingssider for å utforske nærmere hvordan status for etterlevelse og
            PVK er for den enkelte avdeling, seksjon og enhet.
          </List.Item>
        </List>
        <p>
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
                <div className='border border-gray-300 rounded-lg p-6 bg-white mt-6'>
                  <DashboardOverviewCard stats={stats} view='figurer' />
                  <DashboardReadMore />
                </div>
              </Tabs.Panel>
              <Tabs.Panel value='nokkeltall-overview'>
                <div className='border border-gray-300 rounded-lg p-6 bg-white mt-6'>
                  <DashboardOverviewCard stats={stats} view='nokkeltall' />
                  <DashboardReadMore />
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
                          style={{
                            backgroundColor: '#d5f6db',
                            color: '#000',
                            fontSize: '18px',
                            lineHeight: '24px',
                          }}
                        >
                          {avdelingStats.dokumenter.total.toLocaleString('nb-NO')}{' '}
                          etterlevelsesdokumenter
                        </Tag>
                        <Tag
                          size='small'
                          variant='neutral'
                          style={{
                            backgroundColor: '#7300FF14',
                            color: '#360072',
                            fontSize: '18px',
                            lineHeight: '24px',
                          }}
                        >
                          {avdelingStats.pvk.total.toLocaleString('nb-NO')}{' '}
                          Personvernkonsekvensvurderinger
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

      {!isLoading && !error && (
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

export default DashboardPage
