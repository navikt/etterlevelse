'use client'

import AuthCheckComponent from '@/components/common/authCheckComponent'
import { KravCreatePage } from '@/components/krav/edit/kravCreatePage/kravCreatePage'

const Page = () => (
  <AuthCheckComponent kraveierPage>
    <KravCreatePage />
  </AuthCheckComponent>
)

export default Page
