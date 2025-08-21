'use client'

import { getBreadcrumbPaths } from '@/components/common/breadcrumbs/breadcrumbs'
import { KravMainContent } from '@/components/etterlevelse/krav/kravPage/kravMainContent/kravMainContent'
import { KravOverview } from '@/components/etterlevelse/krav/kravPage/kravOverview/kravOverview'
import { PageLayout } from '@/components/others/scaffold/scaffold'
import { TKravId, TKravIdParams, TKravQL } from '@/constants/krav/kravConstants'
import { TTemaCode } from '@/constants/teamkatalogen/teamkatalogConstants'
import { getKravWithEtterlevelseQuery } from '@/query/krav/kravQuery'
import { kravNummerView } from '@/util/kravNummerView/kravNummerView'
import { useQuery } from '@apollo/client'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

const getQueryVariableFromParams = (params: Readonly<Partial<TKravIdParams>>) => {
  if (params.kravNummer && !params.kravVersjon) {
    return { id: params.kravNummer }
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
      skip: (!params.kravId || params.kravId === 'ny') && !params.kravNummer,
      fetchPolicy: 'no-cache',
    }
  )

  useEffect(() => {
    if (kravQuery?.kravById) setKrav(kravQuery.kravById)
  }, [kravQuery])

  return (
    <PageLayout
      key={`K${krav?.kravNummer}/${krav?.kravVersjon}`}
      pageTitle={`${kravNummerView({
        kravNummer: krav?.kravNummer ? krav.kravNummer : 0,
        kravVersjon: krav?.kravVersjon ? krav.kravVersjon : 0,
      })} ${krav?.navn}`}
      currentPage={kravNummerView({
        kravNummer: krav?.kravNummer ? krav.kravNummer : 0,
        kravVersjon: krav?.kravVersjon ? krav.kravVersjon : 0,
      })}
      breadcrumbPaths={getBreadcrumbPaths(kravTema)}
    >
      <KravOverview kravLoading={kravLoading} krav={krav} />
      {krav && !kravLoading && (
        <KravMainContent
          krav={krav}
          kravLoading={kravLoading}
          kravTema={kravTema}
          setKravTema={setKravTema}
        />
      )}
    </PageLayout>
  )
}

export default KravPage
