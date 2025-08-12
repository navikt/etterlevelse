import EtterlevelseAdminPage from '@/components/admin/etterlevelse/EtterlevelseAdminPage'
import { Suspense } from 'react'

const Page = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <EtterlevelseAdminPage />
  </Suspense>
)

export default Page
