'use client'

import { PageLayout } from '@/components/others/scaffold/scaffold'
import { Heading } from '@navikt/ds-react'
import { Suspense } from 'react'
import { AuditRecentTable } from './AuditRecentTable'

export const VersjoneringAdminPage = () => {
  return (
    <PageLayout pageTitle='Versjonering' currentPage='Versjonering'>
      <Heading size='medium' level='1'>
        Versjonering
      </Heading>
      <Suspense fallback={<div>Loading...</div>}>
        <AuditRecentTable show={true} />
      </Suspense>
    </PageLayout>
  )
}

export default VersjoneringAdminPage
