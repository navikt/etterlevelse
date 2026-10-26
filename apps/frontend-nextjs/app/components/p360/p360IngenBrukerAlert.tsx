'use client'

import { Link, LocalAlert } from '@navikt/ds-react'
import { FunctionComponent } from 'react'

type TProps = {
  forPvk?: boolean
}

const P360IngenBrukerAlert: FunctionComponent<TProps> = ({ forPvk }) => (
  <LocalAlert status='warning' className='max-w-[75ch] my-5'>
    <LocalAlert.Header>
      <LocalAlert.Title>
        Du må ha tilgang til Public 360 for å kunne sende inn {forPvk ? 'PVK' : 'Etterlevelse'}
      </LocalAlert.Title>
    </LocalAlert.Header>
    <LocalAlert.Content>
      For å kunne sende inn, må du ha en gyldig bruker i Public 360. Det er din nærmeste leder som
      må bestille tilgang for deg. Dette kan de gjøre på{' '}
      <Link
        className='inline whitespace-normal'
        rel='noopener noreferrer'
        target='_blank'
        href='https://jira.adeo.no/plugins/servlet/desk/portal/581/create/5794'
      >
        denne siden i Porten (åpner i en ny fane)
      </Link>
      . Etter hvert som du har fått tilgang, vil du kunne sende inn PVK-en.
    </LocalAlert.Content>
  </LocalAlert>
)
export default P360IngenBrukerAlert
