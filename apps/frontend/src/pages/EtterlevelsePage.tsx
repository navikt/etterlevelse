import { Heading, Label } from '@navikt/ds-react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useEtterlevelse } from '../api/EtterlevelseApi'
import { getKravByKravNumberAndVersion } from '../api/KravApi'
import { LoadingSkeleton } from '../components/common/LoadingSkeleton'
import { ViewEtterlevelse } from '../components/etterlevelse/ViewEtterlevelse'
import { PageLayout } from '../components/scaffold/Page'
import { IBreadCrumbPath, IEtterlevelse, IKrav } from '../constants'
import { ampli, userRoleEventProp } from '../services/Amplitude'
import { EListName, TTemaCode, codelist } from '../services/Codelist'
import { kravNumView } from './KravPage'
import { temaBreadCrumbPath } from './util/BreadCrumbPath'

export const etterlevelseName = (etterlevelse: IEtterlevelse) => `${kravNumView(etterlevelse)}`

export const EtterlevelsePage = () => {
  const params = useParams<{ id?: string }>()
  const [etterlevelse] = useEtterlevelse(params.id)
  const [edit] = useState(etterlevelse && !etterlevelse.id)
  const [krav, setKrav] = useState<IKrav>()
  const [kravTema, setKravTema] = useState<TTemaCode>()

  const loading = !edit && !etterlevelse

  const getPageTitle = (): string => {
    const kravNummerMedNavn = etterlevelse?.kravNummer
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
    etterlevelse &&
      getKravByKravNumberAndVersion(etterlevelse?.kravNummer, etterlevelse?.kravVersjon).then(
        (res) => {
          if (res) {
            setKrav(res)
            const lovData = codelist.getCode(EListName.LOV, res.regelverk[0]?.lov?.code)
            if (lovData?.data) {
              setKravTema(codelist.getCode(EListName.TEMA, lovData.data.tema))
            }
          }
        }
      )
    if (etterlevelse) {
      ampli.logEvent('sidevisning', {
        side: 'Etterlevelse side',
        sidetittel: getPageTitle(),
        ...userRoleEventProp,
      })
    }
  }, [etterlevelse])

  const getBreadcrumPaths = (): IBreadCrumbPath[] => {
    const breadcrumbPaths: IBreadCrumbPath[] = [temaBreadCrumbPath]

    if (kravTema && kravTema.shortName) {
      breadcrumbPaths.push({
        pathName: kravTema.shortName.toString(),
        href: '/tema/' + kravTema.code,
      })
    }

    breadcrumbPaths.push({
      pathName: `K${krav?.kravNummer}.${krav?.kravVersjon}`,
      href: '/krav/' + krav?.kravNummer + '/' + krav?.kravVersjon,
    })

    return breadcrumbPaths
  }

  return (
    <PageLayout
      pageTitle={getPageTitle()}
      currentPage="Etterlevelse"
      breadcrumbPaths={getBreadcrumPaths()}
    >
      {loading && <LoadingSkeleton header="Etterlevelse" />}

      {!loading && (
        <div>
          <Heading level="1" size="medium">
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
