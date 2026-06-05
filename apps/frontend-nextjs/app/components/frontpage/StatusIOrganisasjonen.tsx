'use client'

import { LinkPanel } from '@navikt/ds-react'

export const StatusIOrganisasjonen = () => {
  return (
    <div className='w-full ml-2.5'>
      <LinkPanel
        href='/dashboard'
        onClick={() => {
          // const ampliInstance = ampli()
          // if (ampliInstance) {
          //   ampliInstance.logEvent('navigere', {
          //     kilde: 'forside-panel',
          //     app: 'etterlevelse',
          //     til: 'https://metabase.ansatt.nav.no/dashboard/117-dashboard-for-etterlevelse',
          //     fra: '/',
          //   })
          // }
        }}
      >
        <LinkPanel.Title>Status i organisasjonen</LinkPanel.Title>
        <LinkPanel.Description>
          Hvor godt etterlever vi i Nav? Følg med på dashboards som viser status for Nav sine
          områder og for ulike tema.
        </LinkPanel.Description>
      </LinkPanel>
    </div>
  )
}
export default StatusIOrganisasjonen
