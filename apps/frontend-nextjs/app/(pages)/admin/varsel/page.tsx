import VarselAdminPage from '@/components/admin/varslinger/VarselAdminPage'
import { Suspense } from 'react'

const Page = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <VarselAdminPage />
  </Suspense>
)

export default Page
