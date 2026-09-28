import { BodyLong, Heading, Link, List, Radio, RadioGroup } from '@navikt/ds-react'

enum EOverskrifterPersonvernerklaering {
  STEPPER_HEADING = 'Personvernerklæring for Støtte til etterlevelse',
  BEHANDLING_PERSONOPPLYSNINGER_HVORDAN = 'Hvordan behandler vi ansattes personopplysninger?',
  BEHANDLING_PERSONOPPLYSNINGER_HVILKE = 'Hvilke personopplysninger behandler vi?',
  BEHANDLING_PERSONOPPLYSNINGER_HVOR_HENTES = 'Hvor henter vi dine personopplysninger?',
  BEHANDLING_PERSONOPPLYSNINGER_HVOR_LAGRES = 'Hvor behandler og lagrer vi personopplysningene?',
  INNBLIKK_ETTERLEVELSE = 'Innblikk i Støtte til etterlevelse',
  SAMTYKKE_MAALING = 'Samtykke om måling',
  SAMTYKKE_BRUKER = 'Samtykke til Innblikk',
  MANGLER = 'Feil, mangler og tilbakemeldinger',
}

enum EPersonvernerklaeringId {
  STEP_ONE = 'stepper-heading',
  STEP_TWO = 'behandling-personopplysninger-hvordan',
  STEP_THREE = 'behandling-personopplysninger-hvilke',
  STEP_FOUR = 'behandling-personopplysninger-hvor-hentes',
  STEP_FIVE = 'behandling-personopplysninger-hvor-lagres',
  STEP_SIX = 'innblikk-etterlevelse',
  STEP_SEVEN = 'samtykke-maaling',
  STEP_EIGHT = 'samtykke-bruker',
  STEP_NINE = 'mangler',
}

export const stepperPersonvernerklaering = [
  {
    id: EPersonvernerklaeringId.STEP_ONE,
    step: EOverskrifterPersonvernerklaering.STEPPER_HEADING,
  },
  {
    id: EPersonvernerklaeringId.STEP_TWO,
    step: EOverskrifterPersonvernerklaering.BEHANDLING_PERSONOPPLYSNINGER_HVORDAN,
  },
  {
    id: 'behandling-personopplysninger-hvilke',
    step: EOverskrifterPersonvernerklaering.BEHANDLING_PERSONOPPLYSNINGER_HVILKE,
  },
  {
    id: 'behandling-personopplysninger-hvor-hentes',
    step: EOverskrifterPersonvernerklaering.BEHANDLING_PERSONOPPLYSNINGER_HVOR_HENTES,
  },
  {
    id: 'behandling-personopplysninger-hvor-lagres',
    step: EOverskrifterPersonvernerklaering.BEHANDLING_PERSONOPPLYSNINGER_HVOR_LAGRES,
  },
  { id: 'innblikk-etterlevelse', step: EOverskrifterPersonvernerklaering.INNBLIKK_ETTERLEVELSE },
  { id: 'samtykke-maaling', step: EOverskrifterPersonvernerklaering.SAMTYKKE_MAALING },
  { id: 'samtykke-bruker', step: EOverskrifterPersonvernerklaering.SAMTYKKE_BRUKER },
  { id: 'mangler', step: EOverskrifterPersonvernerklaering.MANGLER },
]

const HovedinnholdPersonerklaering = () => (
  <div>
    <div id={EPersonvernerklaeringId.STEP_ONE}>
      <Heading spacing size='large' level='1'>
        {EOverskrifterPersonvernerklaering.STEPPER_HEADING}
      </Heading>
      <BodyLong spacing>
        Denne personvernerklæringen beskriver hvordan Arbeids- og velferdsetaten ved Team
        datajegerne behandler dine personopplysninger som ansatt ved bruk av Støtte til
        etterlevelse.
      </BodyLong>
    </div>

    <div id={stepperId[1].id}>
      <Heading size='medium' level='2' spacing>
        {stepperId[1].step}
      </Heading>
      <BodyLong spacing>
        Nav er pålagt å dokumentere etterlevelse av generelt regelverk. Ansatte i Nav skal
        dokumentere dette i Støtte til etterlevelse. Denne rettslige forpliktelsen er grunnlaget for
        behandlingen av de ansattes personopplysninger, jf. personvernforordningens artikkel 6(1)c.
      </BodyLong>
      <BodyLong className='mb-6'>
        I Støtte til etterlevelse skal ansatte i Nav dokumentere hvordan de etterlever krav som
        følger av generelt regelverk for sine områder, og vurdere behov for
        personvernkonsekvensvurdering (PVK). Dersom det er behov for å gjennomføre en PVK, opprettes
        en Digital PVK knyttet til etterlevelsesdokumentet. Her dokumenteres risikoscenarier og det
        settes tiltak som kan redusere personvernrisikoen.
      </BodyLong>
    </div>

    <div id={stepperId[2].id}>
      <Heading size='medium' level='2' spacing>
        {stepperId[2].step}
      </Heading>
      <BodyLong className='mb-3'>
        Opplysninger som behandles er navn, Nav-ident og e-postadresse til deg som:
      </BodyLong>
      <List className='mb-6'>
        <List.Item>
          fyller ut og dokumenterer etterlevelse og digitale personvernkonsekvensvurderinger, såkalt
          etterlever
        </List.Item>
        <List.Item>
          har lovtolkningsansvaret for de generelle regelverkene og som publiserer og forvalter
          etterlevelseskravene, såkalte kraveier
        </List.Item>
        <List.Item>
          har ansvaret for å akseptere eller ikke akseptere risiko ved etterlevelse og
          personvernkonsekvensvurderinger, såkalte risikoeier
        </List.Item>
        <List.Item>
          gir råd og anbefalinger knyttet til personvernkonsekvensvurderinger som personvernombud
          eller rådgiver for personvernombudet
        </List.Item>
        <List.Item>
          benytter seg av «spørsmål og svar» for å stille spørsmål direkte til kraveier
        </List.Item>
      </List>
    </div>

    <div id={stepperId[3].id}>
      <Heading size='medium' level='2' spacing>
        {stepperId[3].step}
      </Heading>
      <BodyLong className='mb-6'>
        Vi henter opplysninger om deg som ansatt fra Navs organisasjonsmaster (NOM).
      </BodyLong>
    </div>

    <div id={stepperId[4].id}>
      <Heading size='medium' level='2' spacing>
        {stepperId[4].step}
      </Heading>
      <BodyLong spacing>
        Vi behandler og lagrer personopplysninger om deg i Støtte til etterlevelse, Google Cloud
        Platform og Azure. Etterlevelsesdokumentasjon og personvernkonsekvensvurderinger arkiveres
        også i Public 360.
      </BodyLong>
      <BodyLong className='mb-6'>
        For utfyllende informasjon om hvordan vi behandler personopplysninger kan du lese mer i{' '}
        <Link href='https://behandlingskatalog.ansatt.nav.no/process/purpose/ETTERLEVELSE/608fdba9-ba47-4c86-878b-f229591ae1ba?'>
          Behandlingskatalogen
        </Link>{' '}
        og i{' '}
        <Link href='https://navno.sharepoint.com/sites/intranett-hr/SitePages/Personvernerkl%C3%A6ring.aspx?web=1'>
          Personvernerklæring for ansatte i Arbeids- og velferdsetaten
        </Link>
        .
      </BodyLong>
    </div>

    <div id={stepperId[5].id}>
      <Heading size='medium' level='2' spacing>
        {stepperId[5].step}
      </Heading>
      <BodyLong spacing>
        Vi bruker statistikk- og analyseverktøyet Innblikk i for å forstå hvordan du bruker Støtte
        til etterlevelse. Formålet er å forbedre brukeropplevelsen i Støtte til etterlevelse.
        Innblikk bruker ikke informasjonskapsler, men henter inn opplysninger om nettleseren din for
        å lage en unik ID («finger printing»). Denne ID-en brukes for å skille deg fra andre
        brukere. For å hindre identifisering, fjernes deler av IP-adressen din før dataene sendes
        til Innblikk.
      </BodyLong>
      <BodyLong className='mb-3'>Med Innblikk måler vi:</BodyLong>
      <List className='mb-6'>
        <List.Item>antall besøk på ulike sider</List.Item>
        <List.Item>varigheten på besøkene</List.Item>
        <List.Item>hvordan ansatte navigerer mellom de ulike sidene</List.Item>
        <List.Item>hvilke knapper som trykkes på og når</List.Item>
      </List>
      <BodyLong className='mb-3'>Med Innblikk måler vi ikke:</BodyLong>
      <List className='mb-6'>
        <List.Item>inndata i fritekstboks og søkefelt</List.Item>
        <List.Item>
          andre felter som kan inneholde personopplysninger eller pseudonymiserte personopplysninger
        </List.Item>
      </List>
      <BodyLong className='mb-6'>
        For mer generell informasjon, se{' '}
        <Link href='https://navno.sharepoint.com/sites/intranett-utvikling/SitePages/Rutine-for-bruk-av-Umami.aspx'>
          Rutine for bruk av Innblikk
        </Link>
        .
      </BodyLong>
    </div>

    <div id={stepperId[6].id}>
      <Heading size='medium' level='2' spacing>
        {stepperId[6].step}
      </Heading>
      <BodyLong spacing>
        Vi bruker statistikk- og analyseverktøyet Innblikk i for å forstå hvordan du bruker Støtte
        til etterlevelse. Formålet er å forbedre brukeropplevelsen i Støtte til etterlevelse.
        Innblikk bruker ikke informasjonskapsler, men henter inn opplysninger om nettleseren din for
        å lage en unik ID («finger printing»). Denne ID-en brukes for å skille deg fra andre
        brukere. For å hindre identifisering, fjernes deler av IP-adressen din før dataene sendes
        til Innblikk.
      </BodyLong>
      <BodyLong className='mb-3'>Med Innblikk måler vi:</BodyLong>
      <List className='mb-6'>
        <List.Item>antall besøk på ulike sider</List.Item>
        <List.Item>varigheten på besøkene</List.Item>
        <List.Item>hvordan ansatte navigerer mellom de ulike sidene</List.Item>
        <List.Item>hvilke knapper som trykkes på og når</List.Item>
      </List>
      <BodyLong className='mb-3'>Med Innblikk måler vi ikke:</BodyLong>
      <List className='mb-6'>
        <List.Item>inndata i fritekstboks og søkefelt</List.Item>
        <List.Item>
          andre felter som kan inneholde personopplysninger eller pseudonymiserte personopplysninger
        </List.Item>
      </List>
      <BodyLong className='mb-6'>
        For mer generell informasjon, se{' '}
        <Link href='https://navno.sharepoint.com/sites/intranett-utvikling/SitePages/Rutine-for-bruk-av-Umami.aspx'>
          Rutine for bruk av Innblikk
        </Link>
        .
      </BodyLong>
    </div>

    <div id={stepperId[7].id}>
      <Heading size='medium' level='2' spacing>
        {EOverskrifterPersonvernerklaering.SAMTYKKE_BRUKER}
      </Heading>
      <RadioGroup
        className='mb-6'
        id=''
        value=''
        legend='Oppgi status på suksesskriteriet'
        onChange={() => {}}
        name={`samtykkeTilInnblikk{id}`}
      >
        <Radio value=''>Godkjenn bruk av Innblikk</Radio>
        <Radio value=''>Ikke godkjenn bruk av Innblikk</Radio>
      </RadioGroup>
    </div>

    <div id={stepperId[8].id}>
      <Heading size='medium' level='2' spacing>
        {EOverskrifterPersonvernerklaering.MANGLER}
      </Heading>
      <BodyLong className='mb-3'>
        Har du tilbakemeldinger til Støtte til etterlevelse, oppfordrer vi deg til å ta kontakt med
        Team Datajegerne:
      </BodyLong>
      <List className='mb-6'>
        <List.Item>Bli med på #etterlevelse på Slack</List.Item>
        <List.Item>Send mail til: teamdatajegerne@nav.no</List.Item>
      </List>
    </div>
  </div>
)

export default HovedinnholdPersonerklaering
