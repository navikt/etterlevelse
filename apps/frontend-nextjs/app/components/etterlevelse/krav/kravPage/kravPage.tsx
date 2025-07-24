'use client'

import { KravMainContent } from '@/components/etterlevelse/krav/kravPage/kravMainContent/kravMainContent'
import { KravOverview } from '@/components/etterlevelse/krav/kravPage/kravOverview/kravOverview'
import { PageLayout } from '@/components/others/scaffold/page'

export const KravPage = () => (
  <PageLayout>
    <KravOverview />
    <KravMainContent />
  </PageLayout>
)

export default KravPage
