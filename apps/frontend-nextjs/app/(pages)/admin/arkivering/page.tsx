import ArkiveringAdminPage from '@/components/admin/arkivering/arkiveringAdminPage'
import AuthCheckComponent from '@/components/common/authCheckComponent'

const Page = () => (
  <AuthCheckComponent adminPage>
    <ArkiveringAdminPage />
  </AuthCheckComponent>
)

export default Page
