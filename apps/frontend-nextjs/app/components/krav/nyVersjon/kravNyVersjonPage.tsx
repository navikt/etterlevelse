'use client'

import { GetKravData } from '@/api/krav/edit/kravEditApi'
import { PageLayout } from '@/components/others/scaffold/scaffold'
import { IKravDataProps, TKravById } from '@/constants/krav/edit/kravEditConstant'
import { EKravStatus, TKravQL } from '@/constants/krav/kravConstants'
import { kravBreadCrumbPath } from '@/util/breadCrumbPath/breadCrumbPath'
import { Params } from 'next/dist/server/request/params'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export const KravNyVersjonPage = () => {
  const params: Params = useParams()
  const [krav, setKrav] = useState<TKravQL | undefined>()

  const kravData: IKravDataProps | undefined = GetKravData(params)
  const kravQuery: TKravById | undefined = kravData?.kravQuery

  useEffect(() => {
    if (kravQuery?.kravById)
      setKrav({
        ...kravQuery.kravById,
        id: '',
        kravVersjon: kravQuery.kravById.kravVersjon + 1,
        nyKravVersjon: true,
        status: EKravStatus.UTKAST,
      })
  }, [kravQuery])

  return (
    <>
      <PageLayout
        pageTitle='Rediger krav'
        currentPage='Rediger krav'
        breadcrumbPaths={[kravBreadCrumbPath]}
        key={`K${krav?.kravNummer}/${krav?.kravVersjon}`}
      >
        INNHOLD
      </PageLayout>
    </>
  )
}
