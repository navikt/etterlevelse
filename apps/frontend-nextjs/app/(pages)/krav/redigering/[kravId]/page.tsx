import AuthCheckComponent from '@/components/common/authCheckComponent'
import { KravEditPage } from '@/components/krav/edit/kravEditPage/kravEditPage'

const Page = () => (
  <AuthCheckComponent kraveierPage>
    <KravEditPage />
  </AuthCheckComponent>
)

export default Page
