import EtterlevelseAdminPage from '@/components/admin/etterlevelse/EtterlevelseAdminPage'
import AuthCheckComponent from '@/components/common/authCheckComponent'

const Page = () => (
  <AuthCheckComponent adminPage>
    <EtterlevelseAdminPage />
  </AuthCheckComponent>
)

export default Page
