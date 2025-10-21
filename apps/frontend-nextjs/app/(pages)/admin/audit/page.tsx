import VersjoneringAdminPage from '@/components/admin/versjonering/VersjoneringAdminPage'
import AuthCheckComponent from '@/components/common/authCheckComponent'

const Page = () => (
  <AuthCheckComponent adminPage>
    <VersjoneringAdminPage />
  </AuthCheckComponent>
)

export default Page
