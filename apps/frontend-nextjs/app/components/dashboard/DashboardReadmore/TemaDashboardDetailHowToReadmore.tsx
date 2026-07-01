import { Link, List, ReadMore } from '@navikt/ds-react'

export const TemaDashboardDetailHowToReadmore = () => (
  <div style={{ maxWidth: '75ch' }}>
    <ReadMore header='Hvordan bruker jeg denne siden?' className='max-w-[75ch] mt-4'>
      <p>På denne siden kan du:</p>
      <List className='mt-4'>
        <List.Item>Få oversikt over Navs etterlevelse under dette temaet.</List.Item>
        <List.Item>
          Filtrere etter avdeling, seksjon og eventuelt enhet slik at du kan se hvordan enkelte
          deler i organisasjonen etterlever overordnet for dette temaet, eller pr. enkelte krav.
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
