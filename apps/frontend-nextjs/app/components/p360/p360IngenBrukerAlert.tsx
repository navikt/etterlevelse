'use client'

import { LocalAlert } from '@navikt/ds-react'

const P360IngenBrukerAlert = () => (
  <LocalAlert status='warning' className='max-w-[75ch] my-5'>
    <LocalAlert.Header>
      <LocalAlert.Title>Mangler bruker i public 360</LocalAlert.Title>
    </LocalAlert.Header>
    <LocalAlert.Content>
      For å kunne gå videre i prosessen krever vi at dere har bruker i public 360. Årsaken til dette
      er at vi arkiverer automatisk for dere i bakgrunn, dette vil da kreve et aktiv bruker i public
      360
      <br />
      <br />
      Vennligst kontakt din leder for å få tilgang til public 360
    </LocalAlert.Content>
  </LocalAlert>
)
export default P360IngenBrukerAlert
