import AuditViewPage from '@/components/admin/versjonering/auditView/AuditViewPage'
import { Suspense } from 'react'

const Page = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <AuditViewPage />
  </Suspense>
)

export default Page
