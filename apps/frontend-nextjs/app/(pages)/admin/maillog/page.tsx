import MailLogAdminPage from '@/components/admin/sentEpostLog/MailLogAdminPage'
import { Suspense } from 'react'

const Page = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <MailLogAdminPage />
  </Suspense>
)

export default Page
