import { Alert, Heading, List } from '@navikt/ds-react'

export const GjenbrukAlert = () => (
  <div className='max-w-5xl mb-5'>
    <Alert contentMaxWidth={false} variant='success'>
      <Heading spacing size='small' level='3'>
        Nå har dere låst opp mulighet for å skrive veiledning til de som skal gjenbruke dette
        dokumentet.
      </Heading>
      <Heading spacing size='small' level='3'>
        Slik gjør dere nå:
      </Heading>
      <List>
        <List.Item>
          Gjennomgå alle krav og legg inn veiledning eller endre på status der dette gir mening i
          deres kontekst.
        </List.Item>
        <List.Item>
          Bruk Prioritert kravliste til å samle alle krav som skal framheves ved gjenbruk.
        </List.Item>
        <List.Item>
          Når dere er ferdige med å forberede til gjenbruk, velger dere “Slå på gjenbruk”.
        </List.Item>
      </List>
    </Alert>
  </div>
)

export default GjenbrukAlert
