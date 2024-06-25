import { useQuery } from '@apollo/client'
import { BodyShort, Button, Heading, Label, Link, ReadMore } from '@navikt/ds-react'
import { useEffect, useState } from 'react'
import { hotjar } from 'react-hotjar'
import { useNavigate, useParams } from 'react-router-dom'
import { getDocumentRelationByToIdAndRelationTypeWithData } from '../api/DocumentRelationApi'
import { useEtterlevelseDokumentasjon } from '../api/EtterlevelseDokumentasjonApi'
import { LoadingSkeleton } from '../components/common/LoadingSkeleton'
import { Markdown } from '../components/common/Markdown'
import { EtterlevelseDokumentasjonExpansionCard } from '../components/etterlevelseDokumentasjon/EtterlevelseDokumentasjonExpansionCard'
import TillatGjenbrukModal from '../components/etterlevelseDokumentasjon/edit/TillatGjenbrukModal'
import DokumentasjonPageTabs from '../components/etterlevelseDokumentasjon/tabs/DokumentasjonPageTabs'
import { PageLayout } from '../components/scaffold/Page'
import {
  ERelationType,
  IBreadCrumbPath,
  IDocumentRelationWithEtterlevelseDokumetajson,
  IEtterlevelseDokumentasjonStats,
  IPageResponse,
  TKravQL,
} from '../constants'
import { getEtterlevelseDokumentasjonStatsQuery } from '../query/EtterlevelseDokumentasjonQuery'
import { ampli, userRoleEventProp } from '../services/Amplitude'
import { EListName, codelist } from '../services/Codelist'
import { user } from '../services/User'
import { dokumentasjonerBreadCrumbPath } from './util/BreadCrumbPath'

export const DokumentasjonPage = () => {
  const params = useParams<{ id?: string; tema?: string }>()
  const temaListe = codelist.getCodes(EListName.TEMA)
  const variables = { etterlevelseDokumentasjonId: params.id }
  const navigate = useNavigate()
  const [etterlevelseDokumentasjon, setEtterlevelseDokumentasjon] = useEtterlevelseDokumentasjon(
    params.id
  )

  const [dokumentRelasjon, setDokumentRelasjon] =
    useState<IDocumentRelationWithEtterlevelseDokumetajson>()

  const {
    data: relevanteData,
    refetch: refetchRelevanteData,
    loading,
  } = useQuery<{
    etterlevelseDokumentasjon: IPageResponse<{ stats: IEtterlevelseDokumentasjonStats }>
  }>(getEtterlevelseDokumentasjonStatsQuery, {
    variables,
    skip: !params.id,
  })

  const [relevanteStats, setRelevanteStats] = useState<TKravQL[]>([])
  const [utgaattStats, setUtgaattStats] = useState<TKravQL[]>([])

  const filterData = (
    unfilteredData:
      | {
          etterlevelseDokumentasjon: IPageResponse<{
            stats: IEtterlevelseDokumentasjonStats
          }>
        }
      | undefined
  ) => {
    const relevanteStatusListe: TKravQL[] = []
    const utgaattStatusListe: TKravQL[] = []

    unfilteredData?.etterlevelseDokumentasjon.content.forEach(({ stats }) => {
      relevanteStatusListe.push(...stats.relevantKrav)
      utgaattStatusListe.push(...stats.utgaattKrav)
    })

    relevanteStatusListe.sort((a, b) => {
      return a.kravNummer - b.kravNummer
    })

    utgaattStatusListe.sort((a, b) => {
      if (a.kravNummer === b.kravNummer) {
        return a.kravVersjon - b.kravVersjon
      }
      return a.kravNummer - b.kravNummer
    })

    return [relevanteStatusListe, utgaattStatusListe]
  }

  useEffect(() => {
    hotjar.initialize({ id: 148751, sv: 6 })
  }, [])

  useEffect(() => {
    const [relevanteStatusListe, utgaattStatusListe] = filterData(relevanteData)
    setRelevanteStats(relevanteStatusListe)
    setUtgaattStats(utgaattStatusListe)
  }, [relevanteData])

  useEffect(() => {
    setTimeout(() => refetchRelevanteData(), 200)
    if (etterlevelseDokumentasjon) {
      ampli.logEvent('sidevisning', {
        side: 'Etterlevelse Dokumentasjon Page',
        sidetittel: `E${etterlevelseDokumentasjon.etterlevelseNummer.toString()} ${
          etterlevelseDokumentasjon.title
        }`,
        ...userRoleEventProp,
      })
      ;(async () => {
        await getDocumentRelationByToIdAndRelationTypeWithData(
          etterlevelseDokumentasjon?.id,
          ERelationType.ARVER
        ).then((resp: IDocumentRelationWithEtterlevelseDokumetajson[]) => {
          if (resp.length > 0) setDokumentRelasjon(resp[0])
        })
      })()
    }
  }, [etterlevelseDokumentasjon])

  if (!etterlevelseDokumentasjon) return <LoadingSkeleton header="Dokumentasjon" />

  const breadcrumbPaths: IBreadCrumbPath[] = [dokumentasjonerBreadCrumbPath]

  const { etterlevelseNummer, title } = etterlevelseDokumentasjon

  return (
    <PageLayout
      pageTitle={'E' + etterlevelseNummer.toString() + ' ' + title}
      currentPage={'E' + etterlevelseNummer.toString() + ' ' + title}
      breadcrumbPaths={breadcrumbPaths}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Heading level="1" size="medium">
            E{etterlevelseNummer.toString()} {title}
          </Heading>

          {dokumentRelasjon && (
            <BodyShort className="my-5">
              Dette dokumentet er et arv fra{' '}
              <Link href={`/dokumentasjon/${dokumentRelasjon.fromDocumentWithData.id}`}>
                E{dokumentRelasjon.fromDocumentWithData.etterlevelseNummer}{' '}
                {dokumentRelasjon.fromDocumentWithData.title} av{' '}
                {dokumentRelasjon.fromDocumentWithData.changeStamp.lastModifiedBy.split(' - ')[1]}
              </Link>
              .
            </BodyShort>
          )}

          {etterlevelseDokumentasjon.beskrivelse && (
            <div>
              <Label>Beskrivelse</Label>
              <Markdown sources={[etterlevelseDokumentasjon.beskrivelse]} />
            </div>
          )}

          <div className="flex items-center my-5">
            <EtterlevelseDokumentasjonExpansionCard
              etterlevelseDokumentasjon={etterlevelseDokumentasjon}
            />
            {etterlevelseDokumentasjon && (
              <div className="gap-4 ml-5">
                <Button
                  onClick={() => {
                    navigate('/dokumentasjon/edit/' + etterlevelseDokumentasjon.id)
                  }}
                  size="small"
                  variant="secondary"
                  className="whitespace-nowrap"
                >
                  Endre dokumentegenskaper
                </Button>

                {!dokumentRelasjon && user.isAdmin() && (
                  <TillatGjenbrukModal
                    etterlevelseDokumentasjon={etterlevelseDokumentasjon}
                    setEtterlevelseDokumentasjon={setEtterlevelseDokumentasjon}
                  />
                )}

                {etterlevelseDokumentasjon.tilgjengeligForGjenbruk && user.isAdmin() && (
                  <Button
                    onClick={() => {
                      navigate('/dokumentasjon/gjenbruk/' + etterlevelseDokumentasjon.id)
                    }}
                    size="small"
                    variant="tertiary"
                    className="whitespace-nowrap mt-3"
                    type="button"
                  >
                    Gjenbruk dokumentet
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <Heading level="2" size="medium" spacing className="mt-3">
        Temaoversikt
      </Heading>

      {dokumentRelasjon && (
        <ReadMore header="Slik bruker du disse vurderingene" className="my-5">
          Dokumenteieren har allerede besvart flere av suksesskriteriene for deg. Disse
          suksesskriteriene er merket med &#34;ikke relevant&#34; eller &#34;oppfylt&#34;, og du kan
          gjenbruke vurderingene. De øvrige suksesskriteriene må du ta stilling til. Noen av disse
          inneholder veiledning til hvordan du skal svare ut spørsmålene.
        </ReadMore>
      )}
      <DokumentasjonPageTabs
        etterlevelseDokumentasjon={etterlevelseDokumentasjon}
        setEtterlevelseDokumentasjon={setEtterlevelseDokumentasjon}
        temaListe={temaListe}
        relevanteStats={relevanteStats}
        utgaattStats={utgaattStats}
        loading={loading}
        documentRelation={dokumentRelasjon}
      />
    </PageLayout>
  )
}
