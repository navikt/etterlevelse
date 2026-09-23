'use client'

import { PageLayout } from '@/components/others/scaffold/scaffold'
import { Heading } from '@navikt/ds-react'
import { AuditRecentTable } from './AuditRecentTable'

const VersjoneringAdminPage = () => (
  <PageLayout pageTitle='Versjonering' currentPage='Versjonering'>
    <Heading size='medium' level='1'>
      Versjonering
    </Heading>

    <AuditRecentTable show={true} />
  </PageLayout>
)

export default VersjoneringAdminPage
