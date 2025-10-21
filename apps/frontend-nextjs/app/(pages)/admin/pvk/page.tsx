import PvkDokumentAdminPage from '@/components/admin/pvkDokument/PvkDokumentAdminPage'
import AuthCheckComponent from '@/components/common/authCheckComponent'

const Page = () => (
  <AuthCheckComponent adminPage>
    <PvkDokumentAdminPage />
  </AuthCheckComponent>
)

export default Page
