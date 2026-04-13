'use client'

import { List, ReadMore } from '@navikt/ds-react'

export const GjenbrukAlert = () => {
  return (
    <div className='max-w-5xl mb-5'>
      <ReadMore
        //TODO: oppdater aksel komponent til å få med de nye readmore komponenter
        // variant="moderate"
        header='Tilrettelegging for gjenbruk: slik gjør dere nå'
        size='large'
        defaultOpen={true}
      >
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
      </ReadMore>
    </div>
  )
}

export default GjenbrukAlert
