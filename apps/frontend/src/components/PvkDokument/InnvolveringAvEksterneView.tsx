import {
  Alert,
  BodyShort,
  Heading,
  List,
  Radio,
  RadioGroup,
  ReadMore,
  Stack,
  Textarea,
} from '@navikt/ds-react'

interface IProps {
  personkategorier: string[]
}

export const InnvolveringAvEksterneView = (props: IProps) => {
  const { personkategorier } = props
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

      <RadioGroup
        className="mt-3"
        legend="Har dere involvert en representant for de registrerte?"
        onChange={() => {}}
      >
        <Stack gap="0 6" direction={{ xs: 'column', sm: 'row' }} wrap={false}>
          <Radio value="yes">Ja</Radio>
          <Radio value="no">Nei</Radio>
        </Stack>
      </RadioGroup>

      <Textarea
        className="mt-3"
        label="Utdyp hvordan dere har involvert representant(er) for de registrerte"
      />

      <List className="mt-3" title="Representanter for databehandlere">
        <BodyShort>I Behandlingskatalogen står det at følgende databehandlere benyttes:</BodyShort>
        {personkategorier.length === 0 && <List.Item>Ingen</List.Item>}
        {personkategorier.length > 0 &&
          personkategorier.map((personkategori) => (
            <List.Item key={personkategori}>{personkategori}</List.Item>
          ))}
      </List>

      <BodyShort>
        Hvis dere er usikker på om behandlingene benytter flere eller færre databehandlere, kan det
        være til hjelp å se på behandlingens livsløp.
      </BodyShort>

      <RadioGroup
        className="mt-5"
        legend="Stemmer denne lista over databehandlere? "
        onChange={() => {}}
      >
        <Stack gap="0 6" direction={{ xs: 'column', sm: 'row' }} wrap={false}>
          <Radio value="yes">Ja</Radio>
          <Radio value="no">Nei</Radio>
        </Stack>
      </RadioGroup>

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

      <RadioGroup
        className="mt-5"
        legend="Har dere involvert en representant for databehandlere?"
        onChange={() => {}}
      >
        <Stack gap="0 6" direction={{ xs: 'column', sm: 'row' }} wrap={false}>
          <Radio value="yes">Ja</Radio>
          <Radio value="no">Nei</Radio>
        </Stack>
      </RadioGroup>

      <Textarea
        className="mt-3"
        label="Utdyp hvordan dere har involvert representant(er) for databehandler(e)"
      />
    </div>
  )
}
export default InnvolveringAvEksterneView
