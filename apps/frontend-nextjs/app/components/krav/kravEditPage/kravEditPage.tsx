'use client'

import { GetKravData, IKravDataProps, TKravById } from '@/api/krav/kravEdit/kravEditApi'
import { PageLayout } from '@/components/others/scaffold/scaffold'
import { TKravQL } from '@/constants/krav/kravConstants'
import { kravBreadCrumbPath } from '@/util/breadCrumbPath/breadCrumbPath'
import { Box } from '@navikt/ds-react'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export const KravEditPage = () => {
  const params = useParams()
  const [krav, setKrav] = useState<TKravQL | undefined>()

  const kravData: IKravDataProps | undefined = GetKravData(params)
  const kravQuery: TKravById | undefined = kravData?.kravQuery

  useEffect(() => {
    if (kravQuery?.kravById) {
      setKrav(kravQuery.kravById)

      //  setIsEditingUtgaattKrav(kravQuery.kravById.status === EKravStatus.UTGAATT ? true : false)
    }
  }, [kravQuery])

  return (
    <>
      <PageLayout
        pageTitle='Rediger krav'
        currentPage='Rediger krav'
        breadcrumbPaths={[kravBreadCrumbPath]}
        key={'K' + krav?.kravNummer + '/' + krav?.kravVersjon}
      >
        <Box padding='4' background='surface-warning-subtle'>
          Det er ikke lov å redigere på et utgått krav.
        </Box>
      </PageLayout>
    </>
  )
}
