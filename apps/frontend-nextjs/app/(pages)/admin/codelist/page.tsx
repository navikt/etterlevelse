import CodeListAdminPage from '@/components/admin/kodeverk/CodelistAdminPage'
import AuthCheckComponent from '@/components/common/authCheckComponent'

const Page = () => (
  <AuthCheckComponent adminPage>
    <CodeListAdminPage />
  </AuthCheckComponent>
)

export default Page
