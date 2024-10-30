import { BodyShort, Heading, List } from '@navikt/ds-react'

interface IProps {
  personkategorier: string[]
}

export const InnvolveringAvEksterneView = (props: IProps) => {
  const { personkategorier } = props
  return (
    <div>
      <Heading level="1" size="medium" className="mb-5">
        Innvolvering av eksterne
      </Heading>

      <Heading level="2" size="small" className="mb-3">
        Representanter for de registrerte
      </Heading>

      <List title="I Behandlingskatalogen står det at dere behandler personopplysninger om:">
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
        involvere en representant for de registrerte. Hvis dere er usikre på om behandlingene
        treffer flere eller færre personkategorier, kan det være til hjelp å se på behandlingens
        livsløp.
      </BodyShort>
    </div>
  )
}
export default InnvolveringAvEksterneView
