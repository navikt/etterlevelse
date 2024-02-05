import { useQuery } from '@apollo/client'
import { Loader } from '@navikt/ds-react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { TKravQL } from '../../../constants'
import { kravNumView } from '../../../pages/KravPage'
import { getKravWithEtterlevelseQuery } from '../../../query/KravQuery'
import { EListName, TTemaCode, codelist } from '../../../services/Codelist'
import { IBreadcrumbPaths } from '../../common/CustomizedBreadcrumbs'
import { PageLayout } from '../../scaffold/Page'

export const KravEditPage = () => {
  const params = useParams()
  const [krav, setKrav] = useState<TKravQL>()
  const [kravTema, setKravTema] = useState<TTemaCode>()

  const { loading: kravLoading, data: kravQuery } = useQuery<{ kravById: TKravQL }>(
    getKravWithEtterlevelseQuery,
    {
      variables: { id: params.id },
      skip: (!params.id || params.id === 'ny') && !params.kravNummer,
      fetchPolicy: 'no-cache',
    }
  )

  const getBreadcrumPaths = () => {
    const breadcrumbPaths: IBreadcrumbPaths[] = [
      {
        pathName: 'Forstå kravene',
        href: '/tema',
      },
    ]

    if (kravTema?.shortName) {
      breadcrumbPaths.push({
        pathName: kravTema.shortName.toString(),
        href: '/tema/' + kravTema.code,
      })
    }
    return breadcrumbPaths
  }

  useEffect(() => {
    if (kravQuery?.kravById) setKrav(kravQuery.kravById)
  }, [kravQuery])

  useEffect(() => {
    if (krav) {
      const lovData = codelist.getCode(EListName.LOV, krav.regelverk[0]?.lov?.code)
      if (lovData?.data) {
        setKravTema(codelist.getCode(EListName.TEMA, lovData.data.tema))
      }
    }
  }, [krav])

  return (
    <PageLayout
      key={'K' + krav?.kravNummer + '/' + krav?.kravVersjon}
      pageTitle={
        kravNumView({ kravNummer: krav?.kravNummer || 0, kravVersjon: krav?.kravVersjon || 0 }) +
        ' ' +
        krav?.navn
      }
      currentPage={kravNumView({
        kravNummer: krav?.kravNummer || 0,
        kravVersjon: krav?.kravVersjon || 0,
      })}
      breadcrumbPaths={getBreadcrumPaths()}
    >
      {kravLoading && (
        <div className="w-full flex items-center flex-col">
          <Loader size="3xlarge" />
        </div>
      )}
      {!kravLoading && <div>Hello world</div>}
    </PageLayout>
  )
}
