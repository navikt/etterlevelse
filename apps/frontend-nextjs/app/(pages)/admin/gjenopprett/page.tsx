import GjenopprettDokumentasjonAdminPage from '@/components/admin/gjenopprett/GjenopprettDokumentasjonAdminPage'
import AuthCheckComponent from '@/components/common/authCheckComponent'

const Page = () => (
  <AuthCheckComponent adminPage>
    <GjenopprettDokumentasjonAdminPage />
  </AuthCheckComponent>
)

export default Page
