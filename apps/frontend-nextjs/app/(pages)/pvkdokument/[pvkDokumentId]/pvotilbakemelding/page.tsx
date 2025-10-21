import AuthCheckComponent from '@/components/common/authCheckComponent'
import PvoTilbakemeldingPage from '@/components/pvoTilbakemelding/pvoTilbakemeldingPage/pvoTilbakemeldingPage'

const Page = () => (
  <AuthCheckComponent pvoPage>
    <PvoTilbakemeldingPage />
  </AuthCheckComponent>
)

export default Page
