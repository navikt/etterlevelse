import { Link, List, ReadMore } from '@navikt/ds-react'

export const TemaDashboardHowToReadmore = () => (
  <div style={{ maxWidth: '75ch' }}>
    <ReadMore header='Hvordan bruker jeg denne siden?' className='max-w-[75ch] mt-4'>
      <p>På denne siden kan du:</p>
      <List className='mt-4'>
        <List.Item>Få oversikt over Navs etterlevelse, inndelt etter tema.</List.Item>
        <List.Item>
          Filtrere etter avdeling, seksjon og eventuelt enhet slik at du kan se hvordan enkelte
          organisasjonsdeler etterlever krav og suksesskriterier.
        </List.Item>
        <List.Item>
          Navigere videre til enkelte temasider hvor du kan utforske etterlevelse av enkelte krav,
          enten i hele Nav eller på avdeling, seksjon eller enhetsnivå.
        </List.Item>
      </List>
      <p className='mt-4'>
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
  </div>
)
