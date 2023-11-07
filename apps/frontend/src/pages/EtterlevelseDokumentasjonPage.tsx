import { useEffect, useState } from 'react'
import { Block } from 'baseui/block'
import { useParams } from 'react-router-dom'
import { ettlevColors } from '../util/theme'
import { codelist, ListName, TemaCode } from '../services/Codelist'
import { Layout2 } from '../components/scaffold/Page'
import { KravId } from '../api/KravApi'
import { breadcrumbPaths } from '../components/common/CustomizedBreadcrumbs'
import { Helmet } from 'react-helmet'
import { ampli } from '../services/Amplitude'
import { KRAV_FILTER_TYPE } from '../constants'
import { useEtterlevelseDokumentasjon } from '../api/EtterlevelseDokumentasjonApi'
import { getMainHeader } from '../components/etterlevelseDokumentasjon/common/utils'
import { KravView } from '../components/etterlevelseDokumentasjonTema/KravView'

export type Section = 'dokumentasjon' | 'etterlevelser' | 'tilbakemeldinger'

export const getFilterType = (id: string | number | undefined): KRAV_FILTER_TYPE => {
  if (id === KRAV_FILTER_TYPE.RELEVANTE_KRAV) {
    return KRAV_FILTER_TYPE.RELEVANTE_KRAV
  } else if (id === KRAV_FILTER_TYPE.BORTFILTTERTE_KRAV) {
    return KRAV_FILTER_TYPE.BORTFILTTERTE_KRAV
  } else {
    return KRAV_FILTER_TYPE.UTGAATE_KRAV
  }
}

export const EtterlevelseDokumentasjonPage = () => {
  const params = useParams<{ id: string; tema: string; kravNummer: string; kravVersjon: string; filter: string }>()
  const temaData: TemaCode | undefined = codelist.getCode(ListName.TEMA, params.tema?.replace('i', ''))
  const [etterlevelseDokumentasjon] = useEtterlevelseDokumentasjon(params.id)

  const [kravId, setKravId] = useState<KravId | undefined>()

  const [navigatePath, setNavigatePath] = useState<string>('')

  const [tab, setTab] = useState<Section>('dokumentasjon')

  useEffect(() => {
    if (params.kravNummer && params.kravVersjon) {
      setKravId({ kravNummer: Number(params.kravNummer), kravVersjon: Number(params.kravVersjon) })
    }
  }, [params])

  useEffect(() => {
    if (etterlevelseDokumentasjon && temaData && kravId) {
      ampli.logEvent('sidevisning', {
        side: 'Dokumentasjon side for etterlevelse',
        sidetittel: `E${etterlevelseDokumentasjon.etterlevelseNummer.toString()} ${etterlevelseDokumentasjon.title.toString()}`,
        section: `K${kravId.kravNummer}.${kravId.kravVersjon}`,
        temaKey: temaData.shortName.toString(),
      })
    }
  }, [etterlevelseDokumentasjon])

  const breadcrumbPaths: breadcrumbPaths[] = [
    {
      pathName: 'Dokumenter etterlevelse',
      href: '/dokumentasjoner',
    },
    {
      pathName: 'Tema for dokumentasjon',
      href: '/dokumentasjon/' + etterlevelseDokumentasjon?.id,
    },
  ]

  return (
    <>
      {etterlevelseDokumentasjon && (
        <Layout2
          headerBackgroundColor="#F8F8F8"
          headerOverlap="31px"
          mainHeader={getMainHeader(
            etterlevelseDokumentasjon,
            undefined,
            <Helmet>
              <meta charSet="utf-8" />
              <title>
                {`K${kravId?.kravNummer?.toString()}.${kravId?.kravVersjon?.toString()} ${temaData?.shortName} E${etterlevelseDokumentasjon.etterlevelseNummer.toString()} ${etterlevelseDokumentasjon.title.toString()}`}
              </title>
            </Helmet>,
          )}
          childrenBackgroundColor={ettlevColors.grey25}
          currentPage={'K' + kravId?.kravNummer + '.' + kravId?.kravVersjon}
          breadcrumbPaths={breadcrumbPaths}
        >
          <Block display="flex" width="100%" justifyContent="space-between" flexWrap marginBottom="64px">
            {kravId && etterlevelseDokumentasjon && (
              <KravView
                temaName={temaData?.shortName}
                etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
                etterlevelseDokumentasjonTitle={etterlevelseDokumentasjon.title}
                etterlevelseNummer={etterlevelseDokumentasjon.etterlevelseNummer}
                kravId={kravId}
                navigatePath={navigatePath}
                setNavigatePath={setNavigatePath}
                tab={tab}
                setTab={setTab}
                kravFilter={getFilterType(params.filter)}
              />
            )}
          </Block>
        </Layout2>
      )}
    </>
  )
}
