import {
  Alert,
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

export const BehandlingensArtOgOmfangView = (props: IProps) => {
  const { personkategorier } = props
  return (
    <div>
      <Heading level="1" size="medium" className="mb-5">
        Behandlingens art og omfang
      </Heading>

      <List title="I Behandlingskatalogen står det at dere behandler personopplysninger om:">
        {personkategorier.length === 0 && <List.Item>Ingen</List.Item>}
        {personkategorier.length > 0 &&
          personkategorier.map((personkategori) => (
            <List.Item key={personkategori}>{personkategori}</List.Item>
          ))}
      </List>

      <RadioGroup legend="Stemmer denne lista over personkategorier?" onChange={() => {}}>
        <Stack gap="0 6" direction={{ xs: 'column', sm: 'row' }} wrap={false}>
          <Radio value="yes">ja</Radio>
          <Radio value="no">nei</Radio>
        </Stack>
      </RadioGroup>

      <Alert inline variant="warning" className="mt-3">
        Dere må oppdatere personkategori(er) i Behandlingskatalogen.
      </Alert>

      <ReadMore className="mt-3" header="Hvordan kan vi komme med gode estimater?">
        Det blir ofte vanskelig å tallfeste noen personkategorier, for eksempel når det er snakk om
        antall brukere eller saksbehandlere. Det er tilstrekkelig å oppgi ca. antall. Hvis du er
        usikker på hvor du faktisk finner tall på hvor mange som kan ha tilgang, kan du … [good
        advice goes here]
      </ReadMore>

      <Textarea
        className="mt-3"
        label="For hver av personkategoriene over, beskriv hvor mange personer dere behandler personopplysninger om."
      />

      <Textarea
        className="mt-3"
        label="Beskriv hvilke roller som skal ha tilgang til personopplysningene. For hver av rollene, beskriv hvor mange som har tilgang."
      />

      <Textarea
        className="mt-3"
        label="Beskriv hvordan og hvor lenge personopplysningene skal lagres."
      />
    </div>
  )
}
export default BehandlingensArtOgOmfangView
