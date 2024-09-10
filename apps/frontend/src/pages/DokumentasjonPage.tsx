import { useQuery } from '@apollo/client'
import { Alert, BodyShort, Button, Heading, Label, Link, List, ReadMore } from '@navikt/ds-react'
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

  const [morDokumentRelasjon, setMorDokumentRelasjon] =
    useState<IDocumentRelationWithEtterlevelseDokumetajson>()
  const [relasjonLoading, setRelasjonLoading] = useState(false)

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
        setRelasjonLoading(true)
        await getDocumentRelationByToIdAndRelationTypeWithData(
          etterlevelseDokumentasjon?.id,
          ERelationType.ARVER
        ).then((resp: IDocumentRelationWithEtterlevelseDokumetajson[]) => {
          if (resp.length > 0) setMorDokumentRelasjon(resp[0])
          setRelasjonLoading(false)
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

          {morDokumentRelasjon && (
            <BodyShort className="my-5">
              Dette dokumentet er et arv fra{' '}
              <Link href={`/dokumentasjon/${morDokumentRelasjon.fromDocumentWithData.id}`}>
                E{morDokumentRelasjon.fromDocumentWithData.etterlevelseNummer}{' '}
                {morDokumentRelasjon.fromDocumentWithData.title}
              </Link>
              .
            </BodyShort>
          )}

          <div className="flex w-full">
            <div className="max-w-5xl flex-1">
              {etterlevelseDokumentasjon.forGjenbruk &&
                !etterlevelseDokumentasjon.tilgjengeligForGjenbruk && (
                  <div className="max-w-5xl mb-5">
                    <Alert variant="success">
                      <Heading spacing size="small" level="3">
                        Nå har du låst opp mulighet for å skrive veiledning til de som skal
                        gjenbruke dette dokumentet.
                      </Heading>
                      <Heading spacing size="small" level="3">
                        Slik gjør du nå:
                      </Heading>
                      <List>
                        <List.Item>
                          Gjennomgå alle krav og legg inn veiledning eller endre på status der dette
                          gir mening i din kontekst.
                        </List.Item>
                        <List.Item>
                          Bruk Prioritert kravliste til å samle alle krav som skal framheves ved
                          gjenbruk.
                        </List.Item>
                        <List.Item>
                          Når du er ferdig med å forberede til gjenbruk, velger du “Slå på
                          gjenbruk”, over.
                        </List.Item>
                      </List>
                    </Alert>
                  </div>
                )}
              {etterlevelseDokumentasjon.beskrivelse && (
                <div className="mb-5">
                  <Label>Beskrivelse</Label>
                  <Markdown source={etterlevelseDokumentasjon.beskrivelse} />
                </div>
              )}

              <div className="flex mb-5">
                <EtterlevelseDokumentasjonExpansionCard
                  etterlevelseDokumentasjon={etterlevelseDokumentasjon}
                  relasjonLoading={relasjonLoading}
                />
              </div>
            </div>

            <div className="flex justify-end">
              {etterlevelseDokumentasjon && (
                <div className="gap-4 ml-5">
                  {(etterlevelseDokumentasjon.hasCurrentUserAccess || user.isAdmin()) && (
                    <>
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

                      {etterlevelseDokumentasjon.forGjenbruk && (
                        <TillatGjenbrukModal
                          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
                          setEtterlevelseDokumentasjon={setEtterlevelseDokumentasjon}
                        />
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Heading level="2" size="medium" spacing className="mt-3">
        Temaoversikt
      </Heading>

      {etterlevelseDokumentasjon.forGjenbruk &&
        !etterlevelseDokumentasjon.tilgjengeligForGjenbruk && (
          <div className="max-w-5xl">
            <Alert variant="success" className="max-w-5xl">
              <Heading spacing size="small" level="3">
                Nå har du låst opp mulighet for å skrive veiledning til de som skal gjenbruke dette
                dokumentet.
              </Heading>
              <Heading spacing size="small" level="3">
                Slik gjør du nå:
              </Heading>
              <List>
                <List.Item>
                  Gjennomgå alle krav og legg inn veiledning eller endre på status der dette gir
                  mening i din kontekst.
                </List.Item>
                <List.Item>
                  Bruk Prioritert kravliste til å samle alle krav som skal framheves ved gjenbruk.
                </List.Item>
                <List.Item>
                  Når du er ferdig med å forberede til gjenbruk, velger du “Slå på gjenbruk”, over.
                </List.Item>
              </List>
            </Alert>
          </div>
        )}

      {morDokumentRelasjon && (
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
        morDocumentRelation={morDokumentRelasjon}
      />
    </PageLayout>
  )
}
