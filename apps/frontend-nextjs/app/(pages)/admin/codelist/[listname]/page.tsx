import ListnameAdminViewPage from '@/components/admin/kodeverk/listnameView/ListnameAdminViewPage'
import { Suspense } from 'react'

const Page = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <ListnameAdminViewPage />
  </Suspense>
)

export default Page
