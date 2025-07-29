'use client'

import { getBreadcrumbPaths } from '@/components/common/breadcrumbs/breadcrumbs'
import { KravMainContent } from '@/components/etterlevelse/krav/kravPage/kravMainContent/kravMainContent'
import { KravOverview } from '@/components/etterlevelse/krav/kravPage/kravOverview/kravOverview'
import { PageLayout } from '@/components/others/scaffold/page'
import { TKravId, TKravIdParams, TKravQL } from '@/constants/krav/kravConstants'
import { TTemaCode } from '@/constants/teamkatalogen/teamkatalogConstants'
import { getKravWithEtterlevelseQuery } from '@/query/krav/kravQuery'
import { useQuery } from '@apollo/client'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

type TProps = { kravVersjon: number; kravNummer: number }

export const kravNumView = (props: TProps): string => {
  const { kravNummer, kravVersjon } = props

  return `K${kravNummer}.${kravVersjon}`
}

const getQueryVariableFromParams = (params: Readonly<Partial<TKravIdParams>>) => {
  if (params.id) {
    return { id: params.id }
  } else if (params.kravNummer && params.kravVersjon) {
    return {
      kravNummer: parseInt(params.kravNummer),
      kravVersjon: parseInt(params.kravVersjon),
    }
  } else {
    return undefined
  }
}

export const KravPage = () => {
  const params: Readonly<Partial<TKravIdParams>> = useParams<TKravIdParams>()
  const [krav, setKrav] = useState<TKravQL | undefined>()
  const [kravTema, setKravTema] = useState<TTemaCode>()

  const { loading: kravLoading, data: kravQuery } = useQuery<{ kravById: TKravQL }, TKravId>(
    getKravWithEtterlevelseQuery,
    {
      variables: getQueryVariableFromParams(params),
      skip: (!params.id || params.id === 'ny') && !params.kravNummer,
      fetchPolicy: 'no-cache',
    }
  )

  useEffect(() => {
    if (kravQuery?.kravById) setKrav(kravQuery.kravById)
  }, [kravQuery])

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
      <KravOverview kravLoading={kravLoading} />
      <KravMainContent />
    </PageLayout>
  )
}

export default KravPage
