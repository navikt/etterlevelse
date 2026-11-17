import ArdoqAdminPage from '@/components/admin/ardoq/ardoqAdminPage'
import AuthCheckComponent from '@/components/common/authCheckComponent'

const Page = () => (
  <AuthCheckComponent adminPage>
    <ArdoqAdminPage />
  </AuthCheckComponent>
)

export default Page
