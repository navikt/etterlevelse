import PvkDokumentAdminPage from '@/components/admin/pvkDokument/PvkDokumentAdminPage'
import { Suspense } from 'react'

const Page = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <PvkDokumentAdminPage />
  </Suspense>
)

export default Page
