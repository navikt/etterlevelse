import { useQuery } from '@apollo/client'
import { Alert, BodyShort, Button, Heading, Link, List, ReadMore } from '@navikt/ds-react'
import { useEffect, useState } from 'react'
import { hotjar } from 'react-hotjar'
import { NavigateFunction, useNavigate, useParams } from 'react-router-dom'
import { getBehandlingensLivslopByEtterlevelseDokumentId } from '../api/BehandlingensLivslopApi'
import { getDocumentRelationByToIdAndRelationTypeWithData } from '../api/DocumentRelationApi'
import { useEtterlevelseDokumentasjon } from '../api/EtterlevelseDokumentasjonApi'
import { getPvkDokumentByEtterlevelseDokumentId } from '../api/PvkDokumentApi'
import { LoadingSkeleton } from '../components/common/LoadingSkeleton'
import { EtterlevelseDokumentasjonExpansionCard } from '../components/etterlevelseDokumentasjon/EtterlevelseDokumentasjonExpansionCard'
import TillatGjenbrukModal from '../components/etterlevelseDokumentasjon/edit/TillatGjenbrukModal'
import DokumentasjonPageTabs from '../components/etterlevelseDokumentasjon/tabs/DokumentasjonPageTabs'
import { PageLayout } from '../components/scaffold/Page'
import {
  EPvkDokumentStatus,
  ERelationType,
  IBehandlingensLivslop,
  IBreadCrumbPath,
  IDocumentRelationWithEtterlevelseDokumetajson,
  IEtterlevelseDokumentasjonStats,
  IPageResponse,
  IPvkDokument,
  TKravQL,
} from '../constants'
import { getEtterlevelseDokumentasjonStatsQuery } from '../query/EtterlevelseDokumentasjonQuery'
import { ampli, userRoleEventProp } from '../services/Amplitude'
import { CodelistService, EListName, TTemaCode } from '../services/Codelist'
import { user } from '../services/User'
import { isInLimitedAccess } from '../util/config'
import { dokumentasjonerBreadCrumbPath } from './util/BreadCrumbPath'

const getVariantForBLLButton = (
  behandlingsLivslop: IBehandlingensLivslop | undefined
): 'primary' | 'secondary' => {
  return (behandlingsLivslop && behandlingsLivslop?.filer.length > 0) ||
    behandlingsLivslop?.beskrivelse
    ? 'secondary'
    : 'primary'
}

const getVariantForPVKBehovButton = (
  pvkDokument: IPvkDokument | undefined,
  behandlingsLivslop: IBehandlingensLivslop | undefined
) => {
  if (pvkDokument) {
    return 'tertiary'
  } else if (
    (behandlingsLivslop && behandlingsLivslop.filer.length > 0) ||
    behandlingsLivslop?.beskrivelse
  ) {
    return 'primary'
  } else {
    return 'secondary'
  }
}

const getVariantForPVKButton = (
  pvkDokument: IPvkDokument | undefined,
  behandlingsLivslop: IBehandlingensLivslop | undefined
) => {
  if (pvkDokument?.skalUtforePvk === false) return 'tertiary'
  if (
    (behandlingsLivslop && behandlingsLivslop?.filer.length > 0) ||
    behandlingsLivslop?.beskrivelse
  )
    return 'primary'
  return 'secondary'
}

export const DokumentasjonPage = () => {
  const navigate: NavigateFunction = useNavigate()
  const params: Readonly<
    Partial<{
      id?: string
      tema?: string
    }>
  > = useParams<{ id?: string; tema?: string }>()
  const [codelistUtils] = CodelistService()
  const temaListe: TTemaCode[] = codelistUtils.getCodes(EListName.TEMA) as TTemaCode[]
  const variables: {
    etterlevelseDokumentasjonId: string | undefined
  } = { etterlevelseDokumentasjonId: params.id }
  const [etterlevelseDokumentasjon, setEtterlevelseDokumentasjon] = useEtterlevelseDokumentasjon(
    params.id
  )

  const [morDokumentRelasjon, setMorDokumentRelasjon] =
    useState<IDocumentRelationWithEtterlevelseDokumetajson>()
  const [relasjonLoading, setRelasjonLoading] = useState(false)
  const [pvkDokument, setPvkDokument] = useState<IPvkDokument>()
  const [behandlingsLivslop, setBehandlingsLivslop] = useState<IBehandlingensLivslop>()

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
  ): TKravQL[][] => {
    const relevanteStatusListe: TKravQL[] = []
    const utgaattStatusListe: TKravQL[] = []

    unfilteredData?.etterlevelseDokumentasjon.content.forEach(({ stats }) => {
      relevanteStatusListe.push(...stats.relevantKrav)
      utgaattStatusListe.push(...stats.utgaattKrav)
    })

    relevanteStatusListe.sort((a: TKravQL, b: TKravQL) => {
      return a.kravNummer - b.kravNummer
    })

    utgaattStatusListe.sort((a: TKravQL, b: TKravQL) => {
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
        ).then((response: IDocumentRelationWithEtterlevelseDokumetajson[]) => {
          if (response.length > 0) setMorDokumentRelasjon(response[0])
          setRelasjonLoading(false)
        })

        await getPvkDokumentByEtterlevelseDokumentId(etterlevelseDokumentasjon.id)
          .then((response: IPvkDokument) => {
            if (response) setPvkDokument(response)
          })
          .catch(() => undefined)

        await getBehandlingensLivslopByEtterlevelseDokumentId(etterlevelseDokumentasjon.id)
          .then((response: IBehandlingensLivslop) => {
            if (response) setBehandlingsLivslop(response)
          })
          .catch(() => undefined)
      })()
    }
  }, [etterlevelseDokumentasjon])

  if (!etterlevelseDokumentasjon) return <LoadingSkeleton header='Dokumentasjon' />

  const breadcrumbPaths: IBreadCrumbPath[] = [dokumentasjonerBreadCrumbPath]

  const { etterlevelseNummer, title } = etterlevelseDokumentasjon

  const pvkDokumentNotStarted =
    pvkDokument &&
    pvkDokument.personkategoriAntallBeskrivelse === '' &&
    pvkDokument.tilgangsBeskrivelsePersonopplysningene === '' &&
    pvkDokument.lagringsBeskrivelsePersonopplysningene === '' &&
    pvkDokument.representantInvolveringsBeskrivelse === '' &&
    pvkDokument.dataBehandlerRepresentantInvolveringBeskrivelse === '' &&
    pvkDokument.stemmerPersonkategorier === null &&
    pvkDokument.harInvolvertRepresentant === null &&
    pvkDokument.harDatabehandlerRepresentantInvolvering === null

  const pvkDokumentVurdertCheck =
    pvkDokument &&
    (pvkDokument.ytterligereEgenskaper.length !== 0 || pvkDokument.skalUtforePvk !== null)

  return (
    <PageLayout
      pageTitle={'E' + etterlevelseNummer.toString() + ' ' + title}
      currentPage={'E' + etterlevelseNummer.toString() + ' ' + title}
      breadcrumbPaths={breadcrumbPaths}
    >
      <div className='flex flex-col gap-4'>
        <div className='flex flex-col gap-2'>
          <Heading level='1' size='medium' className='max-w-[75ch]'>
            E{etterlevelseNummer.toString()} {title}
          </Heading>

          {morDokumentRelasjon && (
            <BodyShort className='my-5'>
              Dette dokumentet er et arv fra{' '}
              <Link href={`/dokumentasjon/${morDokumentRelasjon.fromDocumentWithData.id}`}>
                E{morDokumentRelasjon.fromDocumentWithData.etterlevelseNummer}{' '}
                {morDokumentRelasjon.fromDocumentWithData.title}
              </Link>
              .
            </BodyShort>
          )}

          <div className='flex w-full'>
            <div className='max-w-5xl flex-1'>
              {etterlevelseDokumentasjon.forGjenbruk &&
                !etterlevelseDokumentasjon.tilgjengeligForGjenbruk && (
                  <div className='max-w-5xl mb-5'>
                    <Alert contentMaxWidth={false} variant='success'>
                      <Heading spacing size='small' level='3'>
                        Nå har dere låst opp mulighet for å skrive veiledning til de som skal
                        gjenbruke dette dokumentet.
                      </Heading>
                      <Heading spacing size='small' level='3'>
                        Slik gjør dere nå:
                      </Heading>
                      <List>
                        <List.Item>
                          Gjennomgå alle krav og legg inn veiledning eller endre på status der dette
                          gir mening i deres kontekst.
                        </List.Item>
                        <List.Item>
                          Bruk Prioritert kravliste til å samle alle krav som skal framheves ved
                          gjenbruk.
                        </List.Item>
                        <List.Item>
                          Når dere er ferdige med å forberede til gjenbruk, velger dere “Slå på
                          gjenbruk”.
                        </List.Item>
                      </List>
                    </Alert>
                  </div>
                )}

              <div className='flex mb-5'>
                <EtterlevelseDokumentasjonExpansionCard
                  etterlevelseDokumentasjon={etterlevelseDokumentasjon}
                  relasjonLoading={relasjonLoading}
                />
              </div>
            </div>

            <div className='flex justify-end'>
              {etterlevelseDokumentasjon && (
                <div className='gap-4 ml-5 flex flex-col '>
                  {(etterlevelseDokumentasjon.hasCurrentUserAccess || user.isAdmin()) && (
                    <>
                      <Button
                        onClick={() => {
                          navigate('/dokumentasjon/edit/' + etterlevelseDokumentasjon.id)
                        }}
                        size='small'
                        variant='tertiary'
                        className='whitespace-nowrap'
                      >
                        Redigér dokumentegenskaper
                      </Button>

                      {etterlevelseDokumentasjon.forGjenbruk && (
                        <TillatGjenbrukModal
                          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
                          setEtterlevelseDokumentasjon={setEtterlevelseDokumentasjon}
                        />
                      )}

                      {/*WIP ikke klar til å vises i prod*/}
                      {((isInLimitedAccess(user.getIdent()) &&
                        etterlevelseDokumentasjon.hasCurrentUserAccess) ||
                        user.isAdmin()) && (
                        <Button
                          onClick={() => {
                            let behandlingensLivlopUrl =
                              '/dokumentasjon/' +
                              etterlevelseDokumentasjon.id +
                              '/behandlingens-livslop/'

                            if (behandlingsLivslop) {
                              behandlingensLivlopUrl += behandlingsLivslop.id
                            } else {
                              behandlingensLivlopUrl += 'ny'
                            }
                            navigate(behandlingensLivlopUrl)
                          }}
                          size='small'
                          variant={getVariantForBLLButton(behandlingsLivslop)}
                          className='whitespace-nowrap'
                        >
                          {/* {behandligensLivslop ? 'Rediger behandlinges livsløp' : 'Tegn behandlingens livsløp'} */}
                          Tegn behandlingens livsløp
                        </Button>
                      )}
                      {/*WIP ikke klar til å vises i prod*/}
                      {pvkDokument &&
                        pvkDokument.skalUtforePvk &&
                        ((isInLimitedAccess(user.getIdent()) &&
                          etterlevelseDokumentasjon.hasCurrentUserAccess) ||
                          user.isAdmin()) && (
                          <Button
                            onClick={() => {
                              navigate(
                                '/dokumentasjon/' +
                                  etterlevelseDokumentasjon.id +
                                  '/pvkdokument/' +
                                  pvkDokument.id +
                                  '/1'
                              )
                            }}
                            size='small'
                            variant={getVariantForPVKButton(pvkDokument, behandlingsLivslop)}
                            className='whitespace-nowrap'
                          >
                            {pvkDokumentNotStarted && 'Påbegynn PVK'}
                            {!pvkDokumentNotStarted &&
                              pvkDokument.status === EPvkDokumentStatus.UNDERARBEID &&
                              'Fullfør PVK'}
                            {!pvkDokumentNotStarted &&
                              pvkDokument.status === EPvkDokumentStatus.SENDT_TIL_PVO &&
                              'Les PVK'}
                            {!pvkDokumentNotStarted &&
                              [
                                EPvkDokumentStatus.VURDERT_AV_PVO,
                                EPvkDokumentStatus.TRENGER_GODKJENNING,
                              ].includes(pvkDokument.status) &&
                              'Les PVO-tilbakemelding'}
                            {!pvkDokumentNotStarted &&
                              pvkDokument.status === EPvkDokumentStatus.GODKJENT_AV_RISIKOEIER &&
                              'Revurdér PVK'}
                          </Button>
                        )}

                      {/*WIP ikke klar til å vises i prod*/}
                      {((isInLimitedAccess(user.getIdent()) &&
                        etterlevelseDokumentasjon.hasCurrentUserAccess) ||
                        user.isAdmin()) && (
                        <Button
                          onClick={() => {
                            let pvkBehovUrl =
                              '/dokumentasjon/' + etterlevelseDokumentasjon.id + '/pvkbehov/'

                            if (pvkDokument) {
                              pvkBehovUrl += pvkDokument.id
                            } else {
                              pvkBehovUrl += 'ny'
                            }
                            navigate(pvkBehovUrl)
                          }}
                          size='small'
                          variant={getVariantForPVKBehovButton(pvkDokument, behandlingsLivslop)}
                          className='whitespace-nowrap'
                        >
                          {pvkDokumentVurdertCheck
                            ? 'Revurdér behov for PVK'
                            : 'Vurdér behov for PVK'}
                        </Button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Heading level='2' size='medium' spacing className='mt-3'>
        Temaoversikt
      </Heading>

      {morDokumentRelasjon && (
        <ReadMore header='Slik bruker du disse vurderingene' className='my-5'>
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
        pvkDokument={pvkDokument}
      />
    </PageLayout>
  )
}
