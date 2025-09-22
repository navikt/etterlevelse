import { useQuery } from '@apollo/client'
import { Alert, BodyShort, Button, Heading, Link, List, ReadMore } from '@navikt/ds-react'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { NavigateFunction, useNavigate, useParams } from 'react-router-dom'
import { getBehandlingensLivslopByEtterlevelseDokumentId } from '../api/BehandlingensLivslopApi'
import { getDocumentRelationByToIdAndRelationTypeWithData } from '../api/DocumentRelationApi'
import { useEtterlevelseDokumentasjon } from '../api/EtterlevelseDokumentasjonApi'
import { getPvkDokumentByEtterlevelseDokumentId } from '../api/PvkDokumentApi'
import { getRisikoscenarioByPvkDokumentId } from '../api/RisikoscenarioApi'
import { isReadOnlyPvkStatus } from '../components/PvkDokument/common/util'
import { LoadingSkeleton } from '../components/common/LoadingSkeleton'
import {
  etterlevelseDokumentasjonIdUrl,
  etterlevelsesDokumentasjonEditUrl,
} from '../components/common/RouteLinkEtterlevelsesdokumentasjon'
import {
  pvkDokumentasjonBehandlingsenLivslopUrl,
  pvkDokumentasjonPvkBehovUrl,
  pvkDokumentasjonStepUrl,
} from '../components/common/RouteLinkPvk'
import { EtterlevelseDokumentasjonExpansionCard } from '../components/etterlevelseDokumentasjon/EtterlevelseDokumentasjonExpansionCard'
import TillatGjenbrukModal from '../components/etterlevelseDokumentasjon/edit/TillatGjenbrukModal'
import DokumentasjonPageTabs from '../components/etterlevelseDokumentasjon/tabs/DokumentasjonPageTabs'
import { ContentLayout } from '../components/layout/layout'
import { PageLayout } from '../components/scaffold/Page'
import {
  EPvkDokumentStatus,
  ERelationType,
  ERisikoscenarioType,
  IBehandlingensLivslop,
  IBreadCrumbPath,
  IDocumentRelationWithEtterlevelseDokumetajson,
  IEtterlevelseDokumentasjonStats,
  IPageResponse,
  IPvkDokument,
  IRisikoscenario,
  TKravQL,
} from '../constants'
import { getEtterlevelseDokumentasjonStatsQuery } from '../query/EtterlevelseDokumentasjonQuery'
import { ampli, userRoleEventProp } from '../services/Amplitude'
import { CodelistService, EListName, TTemaCode } from '../services/Codelist'
import { user } from '../services/User'
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
  const [risikoscenarioList, setRisikoscenarioList] = useState<IRisikoscenario[]>([])
  const [kravRisikoscenarioList, setKravRisikoscenarioList] = useState<IRisikoscenario[]>([])
  const [isRisikoscenarioLoading, setIsRisikoscenarioLoading] = useState<boolean>(false)

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
          .then((pvkDokument: IPvkDokument) => {
            if (pvkDokument) {
              setPvkDokument(pvkDokument)
              setIsRisikoscenarioLoading(true)
              getRisikoscenarioByPvkDokumentId(pvkDokument.id, ERisikoscenarioType.ALL)
                .then((riskoscenario) => {
                  setRisikoscenarioList(riskoscenario.content)
                  setKravRisikoscenarioList(
                    riskoscenario.content.filter(
                      (r: IRisikoscenario) => r.generelScenario === false
                    )
                  )
                })
                .finally(() => setIsRisikoscenarioLoading(false))
            }
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
    pvkDokument.harDatabehandlerRepresentantInvolvering === null &&
    risikoscenarioList.length === 0

  const pvkDokumentVurdertCheck =
    pvkDokument &&
    (pvkDokument.ytterligereEgenskaper.length !== 0 || pvkDokument.skalUtforePvk !== null)

  const getPvkButtonText = (pvkDokument: IPvkDokument) => {
    const updatedAfterApprovedOfRisikoeier =
      pvkDokument.godkjentAvRisikoeierDato !== '' &&
      moment(pvkDokument.changeStamp.lastModifiedDate)
        .seconds(0)
        .milliseconds(0)
        .isAfter(moment(pvkDokument.godkjentAvRisikoeierDato).seconds(0).milliseconds(0))

    if (pvkDokumentNotStarted) {
      return 'Påbegynn PVK'
    } else if (!pvkDokumentNotStarted && pvkDokument.status === EPvkDokumentStatus.UNDERARBEID) {
      return 'Fullfør PVK'
    } else if (!pvkDokumentNotStarted && isReadOnlyPvkStatus(pvkDokument.status)) {
      return 'Les PVK'
    } else if (
      !pvkDokumentNotStarted &&
      [
        EPvkDokumentStatus.VURDERT_AV_PVO,
        EPvkDokumentStatus.VURDERT_AV_PVO_TRENGER_MER_ARBEID,
        EPvkDokumentStatus.TRENGER_GODKJENNING,
      ].includes(pvkDokument.status)
    ) {
      return 'Les tilbakemelding fra PVO'
    } else if (
      !pvkDokumentNotStarted &&
      pvkDokument.status === EPvkDokumentStatus.GODKJENT_AV_RISIKOEIER &&
      !updatedAfterApprovedOfRisikoeier
    ) {
      return 'Les godkjent PVK'
    } else if (
      !pvkDokumentNotStarted &&
      pvkDokument.status === EPvkDokumentStatus.GODKJENT_AV_RISIKOEIER &&
      updatedAfterApprovedOfRisikoeier
    ) {
      return 'Oppdatér PVK'
    }
  }

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
              <Link
                href={etterlevelseDokumentasjonIdUrl(morDokumentRelasjon.fromDocumentWithData.id)}
              >
                E{morDokumentRelasjon.fromDocumentWithData.etterlevelseNummer}{' '}
                {morDokumentRelasjon.fromDocumentWithData.title}
              </Link>
              .
            </BodyShort>
          )}

          <ContentLayout>
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
                          navigate(etterlevelsesDokumentasjonEditUrl(etterlevelseDokumentasjon.id))
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
                      {(etterlevelseDokumentasjon.hasCurrentUserAccess || user.isAdmin()) && (
                        <Button
                          onClick={() => {
                            navigate(
                              pvkDokumentasjonBehandlingsenLivslopUrl(
                                etterlevelseDokumentasjon.id,
                                behandlingsLivslop ? behandlingsLivslop.id : 'ny'
                              )
                            )
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
                        (etterlevelseDokumentasjon.hasCurrentUserAccess || user.isAdmin()) && (
                          <Button
                            onClick={() => {
                              navigate(
                                pvkDokumentasjonStepUrl(
                                  etterlevelseDokumentasjon.id,
                                  pvkDokument.id,
                                  1
                                )
                              )
                            }}
                            size='small'
                            variant={getVariantForPVKButton(pvkDokument, behandlingsLivslop)}
                            className='whitespace-nowrap'
                          >
                            {getPvkButtonText(pvkDokument)}
                          </Button>
                        )}

                      {/*WIP ikke klar til å vises i prod*/}
                      {(etterlevelseDokumentasjon.hasCurrentUserAccess || user.isAdmin()) && (
                        <Button
                          onClick={() => {
                            navigate(
                              pvkDokumentasjonPvkBehovUrl(
                                etterlevelseDokumentasjon.id,
                                pvkDokument ? pvkDokument.id : 'ny'
                              )
                            )
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
          </ContentLayout>
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
        risikoscenarioList={kravRisikoscenarioList}
        isRisikoscenarioLoading={isRisikoscenarioLoading}
      />
    </PageLayout>
  )
}
