'use client'

import VarselAdminPage from '@/components/admin/varslinger/VarselAdminPage'
import AuthCheckComponent from '@/components/common/authCheckComponent'

const Page = () => (
  <AuthCheckComponent adminPage>
    <VarselAdminPage />
  </AuthCheckComponent>
)

export default Page
