import { Link, List, ReadMore } from '@navikt/ds-react'

export const TemaDashboardReadmore = () => (
  <div style={{ maxWidth: '75ch' }}>
    <ReadMore
      header='Hjelp til å tolke figurer og nøkkeltall om etterlevelse'
      className='mt-4 max-w-[75ch]'
    >
      <List>
        <List.Item>
          <b>Hvorfor er så mange etterlevelsesdokumenter under arbeid?</b>
          <br />
          Det at et etterlevelsesdokument er under arbeid er ikke nødvendigvis et dårlig tegn. I
          noen kontekster er det behov for å oppdatere etterlevelsesdokumentasjon oftere. Et
          eksempel er smidig produktutvikling, hvor nytt utviklingsarbeid kan tvinge en revurdering
          av hvordan man etterlever enkelte krav.
        </List.Item>
        <List.Item>
          <b>Hva er forskjellen mellom etterlevelseskrav og suksesskriterier?</b>
          <br />
          Hvert etterlevelseskrav består av ett eller flere suksesskriterier. Suksesskriterier er
          aktive handlinger som viser hva etterleveren konkret må gjøre for å etterleve kravet.
          Hvorvidt man etterlever kravet beskrives på suksesskriteriumsnivået.{' '}
          <Link
            href={'/omstottetiletterlevelse#dette-inneholder-et-etterlevelseskrav'}
            target='_blank'
          >
            Les mer om etterlevelseskrav og suksesskriterier (åpner i en ny fane).
          </Link>
        </List.Item>
        <List.Item>
          <b>Hvorfor er så mange suksesskriterier ikke relevant?</b>
          <br />
          Det er begrenset med hvor mange irrelevante etterlevelseskrav man får filtrert bort før en
          begynner å dokumentere etterlevelse. Dette gjør at etterleveren selv kan være nødt til å
          markere noen krav og suksesskriterier som “ikke relevant”
        </List.Item>
        <List.Item>
          <b>
            Hva er forskjellen mellom de figurene/nøkkeltallene som handler om suksesskriterier?
          </b>
          <br />
          Første figur/nøkkeltall gir et samlet bilde på dokumentering av alle suksesskriterier
          underordnet dette temaet. Den andre viser statistikk for krav hvor etterleveren har
          registrert at de ble ferdig med vurderingen sin. Den tredje viser statistikk for krav som
          ikke ennå er registrert som ferdig vurdert, selv om etterleveren kan ha vurdert hvorvidt
          enkelte suksesskriterier etterleves.
        </List.Item>
      </List>

      <Link
        className='mt-4'
        href={'/omstottetiletterlevelse#hvordan-dokumentere-etterlevelse'}
        target='_blank'
      >
        Les mer om dokumentering av etterlevelse (åpner i en ny fane)
      </Link>
    </ReadMore>
  </div>
)
