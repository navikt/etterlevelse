import AuditViewPage from '@/components/admin/versjonering/auditView/AuditViewPage'
import AuthCheckComponent from '@/components/common/authCheckComponent'

const Page = () => (
  <AuthCheckComponent adminPage>
    <AuditViewPage />
  </AuthCheckComponent>
)

export default Page
