import { Suspense } from 'react'
import TemaDashboardPage from '@/components/dashboard/TemaDashboardPage'

const Page = () => (
  <Suspense>
    <TemaDashboardPage />
  </Suspense>
)

export default Page
