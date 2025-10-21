import MailLogAdminPage from '@/components/admin/sentEpostLog/MailLogAdminPage'
import AuthCheckComponent from '@/components/common/authCheckComponent'

const Page = () => (
  <AuthCheckComponent adminPage>
    <MailLogAdminPage />
  </AuthCheckComponent>
)

export default Page
