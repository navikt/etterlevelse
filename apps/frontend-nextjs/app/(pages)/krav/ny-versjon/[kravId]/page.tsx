import AuthCheckComponent from '@/components/common/authCheckComponent'
import { KravNyVersjonPage } from '@/components/krav/edit/nyVersjon/kravNyVersjonPage'

const Page = () => (
  <AuthCheckComponent kraveierPage>
    <KravNyVersjonPage />
  </AuthCheckComponent>
)

export default Page
