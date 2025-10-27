'use client'

import { useEtterlevelse } from '@/api/etterlevelse/etterlevelseApi'
import { getKravByKravNumberAndVersion } from '@/api/krav/kravApi'
import { IBreadCrumbPath } from '@/constants/commonConstants'
import { EListName, TLovCode, TTemaCode } from '@/constants/kodeverk/kodeverkConstants'
import { IKrav } from '@/constants/krav/kravConstants'
import { CodelistContext } from '@/provider/kodeverk/kodeverkProvider'
import { temaUrl } from '@/routes/kodeverk/tema/kodeverkTemaRoutes'
import { kravUrl } from '@/routes/krav/kravRoutes'
import { temaBreadCrumbPath } from '@/util/breadCrumbPath/breadCrumbPath'
import { etterlevelseName } from '@/util/etterlevelseUtil/etterlevelseUtil'
import { Heading, Label } from '@navikt/ds-react'
import { useParams } from 'next/navigation'
import { useContext, useEffect, useState } from 'react'
import { LoadingSkeleton } from '../common/loadingSkeleton/loadingSkeletonComponent'
import { PageLayout } from '../others/scaffold/scaffold'
import { ViewEtterlevelse } from './etterlevelseView/etterlevelseView'

export const EtterlevelseViewPage = () => {
  const codelist = useContext(CodelistContext)
  const params = useParams<{ etterlevelseId: string }>()
  const [etterlevelse] = useEtterlevelse(params.etterlevelseId)
  const [edit] = useState(etterlevelse && !etterlevelse.id)
  const [krav, setKrav] = useState<IKrav>()
  const [kravTema, setKravTema] = useState<TTemaCode>()

  const loading: boolean = !edit && !etterlevelse

  const getPageTitle = (): string => {
    const kravNummerMedNavn: string = etterlevelse?.kravNummer
      ? 'K' +
        etterlevelse.kravNummer.toString() +
        '.' +
        etterlevelse.kravVersjon.toString() +
        ' ' +
        krav?.navn
      : ''

    return 'Etterlevelse: ' + kravNummerMedNavn
  }

  useEffect(() => {
    if (etterlevelse) {
      // ampli.logEvent('sidevisning', {
      //   side: 'Etterlevelse side',
      //   sidetittel: getPageTitle(),
      //   ...userRoleEventProp,
      // })

      getKravByKravNumberAndVersion(etterlevelse?.kravNummer, etterlevelse?.kravVersjon).then(
        (response: IKrav | undefined) => {
          if (response) {
            setKrav(response)
            const lovData: TLovCode | undefined = codelist.utils.getCode(
              EListName.LOV,
              response.regelverk[0]?.lov?.code
            ) as TLovCode
            if (lovData?.data) {
              setKravTema(
                codelist.utils.getCode(EListName.TEMA, lovData.data.tema) as TTemaCode | undefined
              )
            }
          }
        }
      )
    }
  }, [etterlevelse])

  const getBreadcrumPaths = (): IBreadCrumbPath[] => {
    const breadcrumbPaths: IBreadCrumbPath[] = [temaBreadCrumbPath]

    if (kravTema && kravTema.shortName) {
      breadcrumbPaths.push({
        pathName: kravTema.shortName.toString(),
        href: `${temaUrl}/${kravTema.code}`,
      })
    }

    breadcrumbPaths.push({
      pathName: `K${krav?.kravNummer}.${krav?.kravVersjon}`,
      href: `${kravUrl}/${krav?.kravNummer}/${krav?.kravVersjon}`,
    })

    return breadcrumbPaths
  }

  return (
    <PageLayout
      pageTitle={getPageTitle()}
      currentPage='Etterlevelse'
      breadcrumbPaths={getBreadcrumPaths()}
    >
      {loading && <LoadingSkeleton header='Etterlevelse' />}

      {!loading && (
        <div>
          <Heading level='1' size='medium'>
            Etterlevelse
          </Heading>
          {etterlevelse && etterlevelse?.kravNummer !== 0 && krav && (
            <Label>{etterlevelseName(etterlevelse) + ' ' + krav?.navn}</Label>
          )}

          {etterlevelse && !loading && krav && (
            <ViewEtterlevelse etterlevelse={etterlevelse} loading={loading} krav={krav} />
          )}
        </div>
      )}
    </PageLayout>
  )
}
