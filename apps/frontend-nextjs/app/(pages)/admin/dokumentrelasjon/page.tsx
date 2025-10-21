import { EtterlevelseDokumentRelasjonAdminPage } from '@/components/admin/dokumentRelasjon/EtterlevelseDokumentRelasjonAdminPage'
import AuthCheckComponent from '@/components/common/authCheckComponent'

const Page = () => (
  <AuthCheckComponent adminPage>
    <EtterlevelseDokumentRelasjonAdminPage />
  </AuthCheckComponent>
)

export default Page
