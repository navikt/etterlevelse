'use client'

import { PageLayout } from '@/components/others/scaffold/page'
import { useDebouncedState } from '@/util/hooks/customHooks/customHooks'
import { Heading, TextField } from '@navikt/ds-react'
import _ from 'lodash'
import { AuditLabel } from './AuditLabel'
import { AuditRecentTable } from './AuditRecentTable'

const format = (id: string) => _.trim(id, '"')

export const VersjoneringAdminPage = () => {
  const [, setIdInput, idInput] = useDebouncedState('', 400)

  return (
    <PageLayout pageTitle='Versjonering' currentPage='Versjonering'>
      <Heading size='medium' level='1'>
        Versjonering
      </Heading>
      <div className='my-4'>
        <AuditLabel label='Søk etter id'>
          <TextField
            label='Søk etter id'
            hideLabel
            value={idInput}
            placeholder='Id'
            onChange={(e) => setIdInput(format((e.target as HTMLInputElement).value))}
            className='w-72'
          />
        </AuditLabel>
      </div>

      <AuditRecentTable show={!idInput} />
    </PageLayout>
  )
}

export default VersjoneringAdminPage
