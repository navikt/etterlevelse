'use client'

import { getBreadcrumbPaths } from '@/components/common/breadcrumbs/breadcrumbs'
import { KravMainContent } from '@/components/etterlevelse/krav/kravPage/kravMainContent/kravMainContent'
import { KravOverview } from '@/components/etterlevelse/krav/kravPage/kravOverview/kravOverview'
import { PageLayout } from '@/components/others/scaffold/page'
import { TKravQL } from '@/constants/krav/kravConstants'
import { TTemaCode } from '@/constants/teamkatalogen/teamkatalogConstants'
import { useState } from 'react'

type TProps = { kravVersjon: number; kravNummer: number }

export const kravNumView = (props: TProps): string => {
  const { kravNummer, kravVersjon } = props

  return `K${kravNummer}.${kravVersjon}`
}

export const KravPage = () => {
  const [krav, setKrav] = useState<TKravQL | undefined>()
  const [kravTema, setKravTema] = useState<TTemaCode>()

  return (
    <PageLayout
      key={`K${krav?.kravNummer}/${krav?.kravVersjon}`}
      pageTitle={`${kravNumView({
        kravNummer: krav?.kravNummer ? krav.kravNummer : 0,
        kravVersjon: krav?.kravVersjon ? krav.kravVersjon : 0,
      })} ${krav?.navn}`}
      currentPage={kravNumView({
        kravNummer: krav?.kravNummer ? krav.kravNummer : 0,
        kravVersjon: krav?.kravVersjon ? krav.kravVersjon : 0,
      })}
      breadcrumbPaths={getBreadcrumbPaths(kravTema)}
    >
      ergphjsteld
      <KravOverview />
      <KravMainContent />
    </PageLayout>
  )
}

export default KravPage
