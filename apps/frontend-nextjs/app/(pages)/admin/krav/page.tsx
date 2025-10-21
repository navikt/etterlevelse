import KravAdminPage from '@/components/admin/krav/KravAdminPage'
import AuthCheckComponent from '@/components/common/authCheckComponent'

const Page = () => (
  <AuthCheckComponent adminPage>
    <KravAdminPage />
  </AuthCheckComponent>
)

export default Page
