import { Link, List, ReadMore } from '@navikt/ds-react'

export const DashboardReadMore = () => (
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
    <ReadMore
      header='Hjelp til å tolke figurer og tall om personvernkonsekvensvurderinger (PVK)'
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
          nytt, skal etterleveren gå over til å bruke Digital PVK. Antall PVK-er i Word vil dermed
          reduseres med tiden, og statistikk om PVK vil bli mer detaljert når flere PVK-er ligger i
          ny løsning.
        </List.Item>
      </List>
    </ReadMore>
  </div>
)
