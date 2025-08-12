import { EtterlevelseDokumentRelasjonAdminPage } from '@/components/admin/dokumentRelasjon/EtterlevelseDokumentRelasjonAdminPage'
import { Suspense } from 'react'

const Page = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <EtterlevelseDokumentRelasjonAdminPage />
  </Suspense>
)

export default Page
