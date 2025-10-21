import { AuthCheckComponent } from '@/components/common/authCheckComponent'
import PvoOversiktPage from '@/components/pvoTilbakemelding/pvoOversiktPage/pvoOversiktPage'

const Page = () => (
  <AuthCheckComponent pvoPage>
    <PvoOversiktPage />
  </AuthCheckComponent>
)

export default Page
