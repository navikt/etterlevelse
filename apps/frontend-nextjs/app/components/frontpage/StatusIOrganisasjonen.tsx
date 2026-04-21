'use client'

import { LinkPanel } from '@navikt/ds-react'

export const StatusIOrganisasjonen = () => {
  return (
    <div className='w-full ml-2.5'>
      <LinkPanel href='/dashboard'>
        <LinkPanel.Title>Status i organisasjonen</LinkPanel.Title>
        <LinkPanel.Description>
          Følg med på status og se hvor godt Nav sine områder dokumenterer på kravene
        </LinkPanel.Description>
      </LinkPanel>
    </div>
  )
}
export default StatusIOrganisasjonen
