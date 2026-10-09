'use client'

import { BarChartIcon, LightBulbIcon, ParagraphIcon } from '@navikt/aksel-icons'
import { Heading, LinkCard } from '@navikt/ds-react'
import { ReactNode } from 'react'
import { temaUrl } from '@/routes/kodeverk/tema/kodeverkTemaRoutes'

type TCard = {
  href: string
  icon: ReactNode
  title: string
  description: string
}

const cards: TCard[] = [
  {
    href: temaUrl,
    icon: <ParagraphIcon aria-hidden fontSize='1.5rem' />,
    title: 'Forstå kravene',
    description:
      'Hvilke krav må vi etterleve i Nav? Få oversikt over overordnede temaer og alle etterlevelseskrav.',
  },
  {
    href: '/omstottetiletterlevelse',
    icon: <LightBulbIcon aria-hidden fontSize='1.5rem' />,
    title: 'Slik dokumenterer du',
    description:
      'Lær hvordan du bruker Støtte til etterlevelse, Digital PVK og Behandlingskatalogen.',
  },
  {
    href: '/dashboard',
    icon: <BarChartIcon aria-hidden fontSize='1.5rem' />,
    title: 'Status i organisasjonen',
    description:
      'Hvor godt etterlever vi i Nav? Følg med på dashboards som viser status for Nav sine områder og for ulike tema.',
  },
]

const UtforskEtterlevelse = () => (
  <section
    aria-labelledby='utforsk-etterlevelse-heading'
    className='bg-blue-50 rounded-lg p-6 h-full'
  >
    <Heading id='utforsk-etterlevelse-heading' size='medium' level='2'>
      Utforsk etterlevelse i Nav
    </Heading>
    <ul className='mt-6 flex flex-col gap-4 list-none p-0'>
      {cards.map((card: TCard) => (
        <li key={card.title}>
          <LinkCard className='min-h-28' arrowPosition='center'>
            <LinkCard.Icon>{card.icon}</LinkCard.Icon>
            <LinkCard.Title as='h3'>
              <LinkCard.Anchor href={card.href}>{card.title}</LinkCard.Anchor>
            </LinkCard.Title>
            <LinkCard.Description>{card.description}</LinkCard.Description>
          </LinkCard>
        </li>
      ))}
    </ul>
  </section>
)

export default UtforskEtterlevelse
