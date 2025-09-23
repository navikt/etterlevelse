import { Heading, Label } from '@navikt/ds-react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useEtterlevelse } from '../api/EtterlevelseApi'
import { getKravByKravNumberAndVersion } from '../api/KravApi'
import { LoadingSkeleton } from '../components/common/LoadingSkeleton'
import { temaUrl } from '../components/common/RouteLinkEtterlevelsesdokumentasjon'
import { kravUrl } from '../components/common/RouteLinkKrav'
import { ViewEtterlevelse } from '../components/etterlevelse/ViewEtterlevelse'
import { PageLayout } from '../components/scaffold/Page'
import { IBreadCrumbPath, IEtterlevelse, IKrav } from '../constants'
import { CodelistService, EListName, TLovCode, TTemaCode } from '../services/Codelist'
import { kravNumView } from './KravPage'
import { temaBreadCrumbPath } from './util/BreadCrumbPath'

export const etterlevelseName = (etterlevelse: IEtterlevelse): string =>
  `${kravNumView(etterlevelse)}`

export const EtterlevelsePage = () => {
  const params: Readonly<
    Partial<{
      id?: string
    }>
  > = useParams<{ id?: string }>()
  const [codelistUtils] = CodelistService()
  const [etterlevelse] = useEtterlevelse(params.id)
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
            const lovData: TLovCode | undefined = codelistUtils.getCode(
              EListName.LOV,
              response.regelverk[0]?.lov?.code
            ) as TLovCode
            if (lovData?.data) {
              setKravTema(
                codelistUtils.getCode(EListName.TEMA, lovData.data.tema) as TTemaCode | undefined
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
