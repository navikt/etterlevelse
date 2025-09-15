'use client'

import { ampli } from '@/services/amplitude/amplitudeService'
import { LinkPanel } from '@navikt/ds-react'
import { useEffect, useState } from 'react'

export const StatusIOrganisasjonen = () => {
  const [linkClicked, setLinkClicked] = useState<boolean>(true)

  useEffect(() => {
    ampli().logEvent('navigere', {
      kilde: 'forside-panel',
      app: 'etterlevelse',
      til: 'https://metabase.ansatt.nav.no/dashboard/117-dashboard-for-etterlevelse',
      fra: '/',
    })
  }, [linkClicked])

  return (
    <div className='w-full ml-2.5'>
      <LinkPanel
        href='https://metabase.ansatt.nav.no/dashboard/116-dashboard-for-etterlevelse'
        onClick={() => setLinkClicked(!linkClicked)}
      >
        <LinkPanel.Title>Status i organisasjonen</LinkPanel.Title>
        <LinkPanel.Description>
          Følg med på status og se hvor godt Nav sine områder dokumenterer på kravene
        </LinkPanel.Description>
      </LinkPanel>
    </div>
  )
}
export default StatusIOrganisasjonen
