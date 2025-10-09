import { Alert, BodyShort, List, ReadMore } from '@navikt/ds-react'
import Image from 'next/image'
import { behandlingensLivslopImage } from '../images/image'

export const BehandlingensLivslopTextContent = () => (
  <>
    <BodyShort>
      “Behandlingens livsløp” beskriver hvor og hvordan personopplysninger flyter når de behandles i
      deres kontekst. Hensikten med å tegne behandlingens livsløp er at dere blant annet må tenke
      på:
    </BodyShort>
    <List>
      <List.Item>Hvor opplysningene innhentes fra.</List.Item>
      <List.Item>Hvor opplysningene flyter underveis i behandling.</List.Item>
      <List.Item>Om og hvor opplysningene sendes videre i Nav eller til eksterne.</List.Item>
    </List>
    <Alert inline variant='info' className='mt-3'>
      Det er kun påkrevd å tegne behandlingens livsløp hvis dere gjennomfører en PVK, men vi
      anbefaler at alle tegner flyten. Dette vil være til hjelp når dere svarer ut etterlevelseskrav
      innen Personvern og Arkiv og dokumentasjon.
    </Alert>

    <ReadMore header='Slik lager dere en god tegning av behandlingens livsløp' className='mt-3'>
      Du kan bruke verktøy som PowerPoint, Mural, eller Figma til å lage tegningen din som
      flytdiagram. Vi anbefaler ikke at du bruker Word.
      <br />
      <br />
      <BodyShort className='mt-3'>
        Illustrasjonen under viser hvordan dere kunne tegne behandlingens livsløp.
      </BodyShort>
      <Image
        className='mr-2.5'
        src={behandlingensLivslopImage}
        alt='Illustrasjon på hvordan man kunne tegne behandlingens livsløp. Tegningen bruker et flytdiagram til å visualisere at visse opplysninger flyter mellom løsninger internt i Nav og utleveres eventuelt videre til omverden, for eksempel til andre offentlige etater. Illustrasjonen viser et eksempel der hvis X gjelder, flyter opplysninger en vei gjennom systemene, mens hvis Y gjelder, så tar opplysninger en annen rute. Illustrasjonen nevner også at P personer har tilgang til et visst saksystem, mens Q personer har tilgang til et annet.'
        aria-hidden
        aria-label=''
      />
      <br />
      Noen tips til hvordan lage gode tegninger:
      <List>
        <List.Item>
          Husk god kontrast mellom tekst og bakgrunn. Les mer om kontrast (åpner i en ny fane).
        </List.Item>
        <List.Item>Du må ikke forklare alt i selve tegninga.</List.Item>
        <List.Item>
          Pass på at tegningens tekst blir lesbar også etter at du lagret fila og før den laster den
          opp.
        </List.Item>
      </List>
    </ReadMore>
  </>
)

export default BehandlingensLivslopTextContent
