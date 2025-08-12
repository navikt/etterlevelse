import EtterlevelseDokumentasjonAdminPage from '@/components/admin/etterlevelseDokumentasjon/EtterlevelseDokumentasjonAdminPage'
import { Suspense } from 'react'

const Page = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <EtterlevelseDokumentasjonAdminPage />
  </Suspense>
)

export default Page
