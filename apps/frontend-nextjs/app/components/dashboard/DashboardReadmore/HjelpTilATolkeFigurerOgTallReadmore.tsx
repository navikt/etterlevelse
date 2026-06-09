import { Link, List, ReadMore } from '@navikt/ds-react'

export const HjelpTilATolkeFigurerOgNokkelTallReadmore = () => (
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
          vil etterlevelsesdokumentet igjen stå som under arbeid.
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
          Det er begrenset med hvor mange irrelevante etterlevelseskrav man kan filtrere bort før en
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
  </div>
)
