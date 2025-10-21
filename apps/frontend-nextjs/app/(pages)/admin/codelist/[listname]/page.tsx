import ListnameAdminViewPage from '@/components/admin/kodeverk/listnameView/ListnameAdminViewPage'
import AuthCheckComponent from '@/components/common/authCheckComponent'

const Page = () => (
  <AuthCheckComponent adminPage>
    <ListnameAdminViewPage />
  </AuthCheckComponent>
)

export default Page
