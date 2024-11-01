import { Alert, BodyShort, Heading, List, ReadMore } from '@navikt/ds-react'
import { BoolField, TextAreaField } from '../common/Inputs'

interface IProps {
  personkategorier: string[]
  databehandlere: string[]
}

export const InnvolveringAvEksterneView = (props: IProps) => {
  const { personkategorier, databehandlere } = props

  return (
    <div>
      <Heading level="1" size="medium" className="mb-5">
        Innvolvering av eksterne deltakere
      </Heading>

      <Heading level="2" size="small" className="mb-3">
        Representanter for de registrerte
      </Heading>

      <List
        className="mt-5"
        title="I Behandlingskatalogen står det at dere behandler personopplysninger om:"
      >
        {personkategorier.length === 0 && <List.Item>Ingen</List.Item>}
        {personkategorier.length > 0 &&
          personkategorier.map((personkategori) => (
            <List.Item key={personkategori}>{personkategori}</List.Item>
          ))}
      </List>

      <BodyShort>
        Representanter for disse gruppene vil kunne bidra til å belyse hvilke konsekvenser en
        behandling av personopplysninger kan ha for den enkelte. Når vi gjennomfører en
        personvernkonsekvensvurdering (PVK), må vi derfor alltid vurdere om det er behov for å
        involvere en representant for de registrerte.
      </BodyShort>

      <BodyShort className="mt-3">
        Hvis dere er usikre på om behandlingene treffer flere eller færre personkategorier, kan det
        være til hjelp å se på behandlingens livsløp.
      </BodyShort>

      <Alert inline variant="info" className="mt-3">
        Dersom disse typer personopplysninger ikke stemmer, må dere oppdatere Behandlingskatalogen.
      </Alert>

      <ReadMore className="mt-3" header="Slik kan dere involvere de forskjellige gruppene">
        Et eller annet fornuftig råd her om f. eks. høre med Sentral brukerutvalg … osv. [Lenke til
        brosjyre på Navet]
      </ReadMore>

      <div className="mt-3">
        <BoolField
          label="Har dere involvert en representant for de registrerte?"
          name="harInvolvertRepresentant"
          horizontal
        />
      </div>

      <div className="mt-3">
        <TextAreaField
          rows={3}
          noPlaceholder
          label="Utdyp hvordan dere har involvert representant(er) for de registrerte"
          name="representantInvolveringsBeskrivelse"
        />
      </div>

      <List className="mt-3" title="Representanter for databehandlere">
        <BodyShort>I Behandlingskatalogen står det at følgende databehandlere benyttes:</BodyShort>
        {databehandlere.length === 0 && <List.Item>Ingen</List.Item>}
        {databehandlere.length > 0 &&
          databehandlere.map((databehandler) => (
            <List.Item key={databehandler}>{databehandler}</List.Item>
          ))}
      </List>

      <BodyShort>
        Hvis dere er usikker på om behandlingene benytter flere eller færre databehandlere, kan det
        være til hjelp å se på behandlingens livsløp.
      </BodyShort>

      <div className="mt-5">
        <BoolField
          label="Stemmer denne lista over databehandlere?"
          name="stemmerDatabehandlere"
          horizontal
        />
      </div>

      <Alert variant="warning" className="mt-3">
        Dere må oppdatere databehandlere i Behandlingskatalogen
      </Alert>

      <BodyShort className="mt-5">
        Dersom det skal benyttes en databehandler i hele eller deler av behandlingen, skal dere som
        hovedregel inkludere en representant for databehandler i vurderingen av
        personvernkonsekvenser (PVK).
      </BodyShort>

      <ReadMore className="mt-3" header="Trenger vi å snakke direkte med databehandlere?">
        Noe her om hvor grensa går, særlig mtp avtaler som NAV kan ha med store aktører — IT og
        Anskaffelse har egne sider som vi ev. kunne lenke til.
      </ReadMore>

      <div className="mt-5">
        <BoolField
          label="Har dere involvert en representant for databehandlere?"
          name="harDatabehandlerRepresentantInvolvering"
          horizontal
        />
      </div>

      <div className="mt-3">
        <TextAreaField
          rows={3}
          noPlaceholder
          label="Utdyp hvordan dere har involvert representant(er) for databehandler(e"
          name="dataBehandlerRepresentantInvolveringBeskrivelse"
        />
      </div>
    </div>
  )
}
export default InnvolveringAvEksterneView
