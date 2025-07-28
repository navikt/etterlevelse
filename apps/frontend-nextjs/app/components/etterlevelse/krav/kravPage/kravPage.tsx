'use client'

import { getBreadcrumbPaths } from '@/components/common/breadcrumbs/breadcrumbs'
import { KravMainContent } from '@/components/etterlevelse/krav/kravPage/kravMainContent/kravMainContent'
import { KravOverview } from '@/components/etterlevelse/krav/kravPage/kravOverview/kravOverview'
import { PageLayout } from '@/components/others/scaffold/page'
import { TTemaCode } from '@/constants/teamkatalogen/teamkatalogConstants'
import { useState } from 'react'

export const KravPage = () => {
  const [kravTema, setKravTema] = useState<TTemaCode>()

  return (
    <PageLayout
      key='NEEDS KEY'
      pageTitle='NEEDS TITLE'
      currentPage='NEEDS CUURENT PAGE'
      breadcrumbPaths={getBreadcrumbPaths(kravTema)}
    >
      ergphjsteld
      <KravOverview />
      <KravMainContent />
    </PageLayout>
  )
}

export default KravPage
