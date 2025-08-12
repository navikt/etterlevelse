import VersjoneringAdminPage from '@/components/admin/versjonering/VersjoneringAdminPage'
import { Suspense } from 'react'

const Page = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <VersjoneringAdminPage />
  </Suspense>
)

export default Page
