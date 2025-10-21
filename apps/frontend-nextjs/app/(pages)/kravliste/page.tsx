'use client'

import AuthCheckComponent from '@/components/common/authCheckComponent'
import { KravlistePage } from '@/components/krav/kravlistePage/kravlistePage'

const Page = () => (
  <AuthCheckComponent kraveierPage>
    <KravlistePage />
  </AuthCheckComponent>
)

export default Page
