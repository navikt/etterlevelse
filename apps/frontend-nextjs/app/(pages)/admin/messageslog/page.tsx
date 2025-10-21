import QuestionAndAnswerAdminLogPage from '@/components/admin/sporsmalOgSvar/QuestionAndAnswerAdminLogPage'
import AuthCheckComponent from '@/components/common/authCheckComponent'

const Page = () => (
  <AuthCheckComponent adminPage>
    <QuestionAndAnswerAdminLogPage />
  </AuthCheckComponent>
)

export default Page
