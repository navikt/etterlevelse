import EtterlevelseDokumentasjonAdminPage from '@/components/admin/etterlevelseDokumentasjon/EtterlevelseDokumentasjonAdminPage'
import AuthCheckComponent from '@/components/common/authCheckComponent'

const Page = () => (
  <AuthCheckComponent adminPage>
    <EtterlevelseDokumentasjonAdminPage />
  </AuthCheckComponent>
)

export default Page
