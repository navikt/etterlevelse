import React, { useEffect, useState } from 'react'
import { Block } from 'baseui/block'
import { useParams } from 'react-router-dom'
import { LoadingSkeleton } from '../components/common/LoadingSkeleton'
import { theme } from '../util/theme'
import { EtterlevelseDokumentasjonStats, EtterlevelseStatus, KRAV_FILTER_TYPE, KravPrioritering, KravQL, KravStatus, PageResponse } from '../constants'
import { gql, useQuery } from '@apollo/client'
import { Code, codelist, ListName, TemaCode } from '../services/Codelist'
import CustomizedBreadcrumbs, { breadcrumbPaths } from '../components/common/CustomizedBreadcrumbs'

import { ampli } from '../services/Amplitude'
import { getNewestKravVersjon } from '../components/etterlevelseDokumentasjon/common/utils'
import { user } from '../services/User'
import { useArkiveringByEtterlevelseDokumentasjonId } from '../api/ArkiveringApi'
import { useEtterlevelseDokumentasjon } from '../api/EtterlevelseDokumentasjonApi'
import { ArkiveringModal } from '../components/etterlevelseDokumentasjon/ArkiveringModal'
import { isFerdigUtfylt } from './EtterlevelseDokumentasjonTemaPage'
import { ExclamationmarkTriangleFillIcon } from '@navikt/aksel-icons'
import { BodyShort, Label, Loader, Accordion, Link, Tag, Heading, Detail, Button } from '@navikt/ds-react'
import ExportEtterlevelseModal from '../components/export/ExportEtterlevelseModal'
import { KravCard } from '../components/etterlevelseDokumentasjonTema/KravCard'
import { getAllKravPriority } from '../api/KravPriorityApi'
import { filterKrav } from '../components/etterlevelseDokumentasjonTema/common/utils'
import { getNumberOfDaysBetween } from '../util/checkAge'
import moment from 'moment'
import EditEtterlevelseDokumentasjonModal from '../components/etterlevelseDokumentasjon/edit/EditEtterlevelseDokumentasjonModal'
import { ExternalLink } from '../components/common/RouteLink'
import { env } from '../util/env'
import { Teams } from '../components/common/TeamName'
import { Helmet } from 'react-helmet'

export const DokumentasjonPage = () => {
  const params = useParams<{ id?: string }>()
  const options = codelist.getParsedOptions(ListName.RELEVANS)
  const temaListe = codelist.getCodes(ListName.TEMA).sort((a, b) => a.shortName.localeCompare(b.shortName, 'nb'))
  const [openAccordions, setOpenAccordions] = useState<boolean[]>(temaListe.map(() => false))
  const variables = { etterlevelseDokumentasjonId: params.id }
  const [etterlevelseDokumentasjon, setEtterlevelseDokumentasjon] = useEtterlevelseDokumentasjon(params.id)
  const [etterlevelseArkiv, setEtterlevelseArkiv] = useArkiveringByEtterlevelseDokumentasjonId(params.id)
  const [kravPriority, setKravPriority] = useState<KravPrioritering[]>([])

  useEffect(() => {
    getAllKravPriority().then((priority) => setKravPriority(priority))
  }, [])

  const {
    data: relevanteData,
    refetch: refetchRelevanteData,
    loading,
  } = useQuery<{ etterlevelseDokumentasjon: PageResponse<{ stats: EtterlevelseDokumentasjonStats }> }>(statsQuery, {
    variables,
    skip: !params.id 
  })

  const [relevanteStats, setRelevanteStats] = useState<KravQL[]>([])
  const [utgaattStats, setUtgaattStats] = useState<KravQL[]>([])
  const [arkivModal, setArkivModal] = useState<boolean>(false)

  const filterData = (
    unfilteredData:
      | {
        etterlevelseDokumentasjon: PageResponse<{
          stats: EtterlevelseDokumentasjonStats
        }>
      }
      | undefined,
  ) => {
    const relevanteStatusListe: KravQL[] = []
    const utgaattStatusListe: KravQL[] = []

    unfilteredData?.etterlevelseDokumentasjon.content.forEach(({ stats }) => {
      stats.fyltKrav.forEach((k) => {
        if (k.regelverk.length && k.status === KravStatus.AKTIV) {
          relevanteStatusListe.push({ ...k, etterlevelser: k.etterlevelser.filter((e) => e.etterlevelseDokumentasjonId === etterlevelseDokumentasjon?.id) })
        }
      })
      stats.ikkeFyltKrav.forEach((k) => {
        if (k.regelverk.length && k.status === KravStatus.AKTIV) {
          relevanteStatusListe.push({ ...k, etterlevelser: k.etterlevelser.filter((e) => e.etterlevelseDokumentasjonId === etterlevelseDokumentasjon?.id) })
        }
      })
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

  React.useEffect(() => {
    const [relevanteStatusListe, utgaattStatusListe] = filterData(relevanteData)
    setRelevanteStats(relevanteStatusListe)
    setUtgaattStats(utgaattStatusListe)
  }, [relevanteData])

  React.useEffect(() => {
    setTimeout(() => refetchRelevanteData(), 200)
    if (etterlevelseDokumentasjon) {
      ampli.logEvent('sidevisning', {
        side: 'Etterlevelse Dokumentasjon Page',
        sidetittel: `E${etterlevelseDokumentasjon.etterlevelseNummer.toString()} ${etterlevelseDokumentasjon.title}`,
      })
    }
  }, [etterlevelseDokumentasjon])

  let antallFylttKrav = 0

  getNewestKravVersjon(relevanteStats).forEach((k: KravQL) => {
    if (k.etterlevelser.length && isFerdigUtfylt(k.etterlevelser[0].status)) {
      antallFylttKrav += 1
    }
  })

  const getRelevans = (irrelevans?: Code[]) => {
    if (irrelevans?.length === options.length) {
      return <BodyShort size="small">For å filtrere bort krav som ikke er relevante, må dere oppgi egenskaper ved dokumentasjonen.</BodyShort>
    }

    if (irrelevans) {
      const relevans = options.filter((n) => !irrelevans.map((ir: Code) => ir.code).includes(n.value))

      return (
        <div className="flex flex-wrap gap-2">
          {relevans.map((r, index) => (
            <div key={r.value} className="flex items-center gap-1">
              <Tag variant="info" size="small">
                <BodyShort size="small">{r.label}</BodyShort>
              </Tag>
            </div>
          ))}
        </div>
      )
    }
    return (
      <div className="flex flex-wrap gap-2">
        {options.map((o, index) => (
          <div key={o.value} className="flex items-center gap-1">
            <Tag variant="info" size="small">
              <BodyShort size="small">{o.label}</BodyShort>
            </Tag>
          </div>
        ))}
      </div>
    )
  }

  const toggleAccordion = (index: number) => {
    const newState = [...openAccordions]
    newState[index] = !openAccordions[index]
    setOpenAccordions(newState)
  }

  if (!etterlevelseDokumentasjon) return <LoadingSkeleton header="Dokumentasjon" />

  const breadcrumbPaths: breadcrumbPaths[] = [
    {
      pathName: 'Dokumenter etterlevelse',
      href: '/dokumentasjoner',
    },
  ]

  const getKravForTema = (tema: TemaCode) => {
    const lover = codelist.getCodesForTema(tema.code)
    const lovCodes = lover.map((c) => c.code)
    const krav = relevanteStats.filter((k) => k.regelverk.map((r: any) => r.lov.code).some((r: any) => lovCodes.includes(r)))
    return filterKrav(kravPriority, krav, tema)
  }

  return (
    <div role="main" id="content">
      <Helmet>
        <meta charSet="utf-8" />
        <title>
          E{etterlevelseDokumentasjon.etterlevelseNummer.toString()} {etterlevelseDokumentasjon.title}
        </title>
      </Helmet>
      <CustomizedBreadcrumbs currentPage={'Temaoversikt'} paths={breadcrumbPaths} />
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Heading level="1" size="medium">
            Temaoversikt
          </Heading>
          <div className="flex gap-2 items-center">
            <Heading level="2" size="small">
              E{etterlevelseDokumentasjon.etterlevelseNummer.toString()} {etterlevelseDokumentasjon.title}
            </Heading>
          </div>
          {etterlevelseDokumentasjon.behandlerPersonopplysninger && (
            <div className="flex gap-2 flex-wrap items-center">
              <BodyShort size="small">Behandling:</BodyShort>
              {etterlevelseDokumentasjon.behandlingIds && etterlevelseDokumentasjon.behandlingIds.length >= 1 && etterlevelseDokumentasjon.behandlerPersonopplysninger ? (
                etterlevelseDokumentasjon.behandlingIds.map((behandlingId, index) => {
                  return (
                    <div key={'behandling_link_' + index}>
                      {etterlevelseDokumentasjon.behandlinger && etterlevelseDokumentasjon.behandlinger[index].navn ? (
                        <ExternalLink className="text-medium" href={`${env.pollyBaseUrl}process/${behandlingId}`}>
                          {etterlevelseDokumentasjon.behandlinger && etterlevelseDokumentasjon.behandlinger.length > 0
                            ? `${etterlevelseDokumentasjon.behandlinger[index].navn}`
                            : 'Ingen data'}
                        </ExternalLink>
                      ) : (
                        <BodyShort>{etterlevelseDokumentasjon.behandlinger ? etterlevelseDokumentasjon.behandlinger[index].navn : 'Ingen data'}</BodyShort>
                      )}
                    </div>
                  )
                })
              ) : (
                <BodyShort>Husk å legge til behandling fra behandlingskatalogen</BodyShort>
              )}
            </div>
          )}
          {etterlevelseDokumentasjon.teams.length > 0 ? <Teams teams={etterlevelseDokumentasjon.teams} link /> : <BodyShort size="small">Team er ikke angitt</BodyShort>}
          <div className="flex items-center gap-2">
            <BodyShort size="small">Egenskaper:</BodyShort>
            {etterlevelseDokumentasjon.irrelevansFor.length === options.length && (
              <div className="flex items-center gap-1">
                <ExclamationmarkTriangleFillIcon area-label="" aria-hidden className="text-2xl text-icon-warning" />
                <Label size="small">Ingen egenskaper er oppgitt</Label>
              </div>
            )}
            {!etterlevelseDokumentasjon.irrelevansFor.length ? getRelevans() : getRelevans(etterlevelseDokumentasjon.irrelevansFor)}
          </div>
        </div>
        <EditEtterlevelseDokumentasjonModal etterlevelseDokumentasjon={etterlevelseDokumentasjon} setEtterlevelseDokumentasjon={setEtterlevelseDokumentasjon} isEditButton />
      </div>
      <div className="pt-4 flex flex-col gap-4">
        {/* <div className="navds-alert navds-alert--info navds-alert--medium">
          <div className="flex flex-col gap-2">
            <p>Vi tester nytt oppsett med at tema og krav vises nå på samme side, slik at det forhåpentligvis blir lettere å navigere seg i.</p>
            <p>Kravene under hvert tema er vist i anbefalt rekkefølge hvis man leser de fra venstre til høyre.</p>
            <div>
              <p>
                Vi vil gjerne ha tilbakemeldinger på hvordan det fungerer.{' '}
                <Link target="_blank" href="https://nav-it.slack.com/archives/C01V697SSR2">
                  Skriv til oss i #etterlevelse på Slack (åpnes i ny fane)
                </Link>
                .
              </p>
              <p>
                For dere som ikke bruker Slack,{' '}
                <Link target="_blank" href="https://teamkatalog.nav.no/team/264cebfa-ad46-4af9-8867-592f99f491e6">
                  kontakt oss via Teamkatalogen
                </Link>
                .
              </p>
            </div>
          </div>
        </div> */}
        <div className="flex items-center w-full">
          <div className="flex items-center w-full gap-4">
            <Button variant="tertiary" size="xsmall" onClick={() => setOpenAccordions(temaListe.map(() => true))}>
              Åpne alle tema
            </Button>
            <Button variant="tertiary" size="xsmall" onClick={() => setOpenAccordions(temaListe.map(() => false))}>
              Lukk alle tema
            </Button>
          </div>

          <div className="flex justify-end w-full items-center">
            <BodyShort size="medium">
              Totalt {getNewestKravVersjon(relevanteStats).length} krav, {antallFylttKrav} ferdig utfylt
            </BodyShort>
          </div>
        </div>

        {loading ? (
          <Block display="flex" width="100%" justifyContent="center" marginTop={theme.sizing.scale550}>
            <Loader size={'large'} />
          </Block>
        ) : (
          <Accordion indent={false}>
            {temaListe
              .filter((tema) => getKravForTema(tema).length > 0)
              .map((tema, index) => {
                const kravliste = getKravForTema(tema)
                const utfylteKrav = kravliste.filter(
                  (krav) => krav.etterlevelseStatus === EtterlevelseStatus.FERDIG_DOKUMENTERT || krav.etterlevelseStatus === EtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT,
                )
                return (
                  <Accordion.Item key={`${tema.shortName}_panel`} className="flex flex-col gap-2" open={openAccordions[index]}>
                    <Accordion.Header id={tema.code} onClick={() => toggleAccordion(index)}>
                      <div className="flex gap-4">
                        <span>
                          {tema.shortName} ({utfylteKrav.length} av {kravliste.length} krav er ferdig utfylt)
                        </span>
                        {kravliste.find(
                          (krav) => krav.kravVersjon === 1 && krav.etterlevelseStatus === undefined && getNumberOfDaysBetween(moment(krav.aktivertDato).toDate(), new Date()) < 30,
                        ) && <Tag variant="warning">Nytt krav</Tag>}
                        {kravliste.find(
                          (krav) =>
                            krav.kravVersjon > 1 &&
                            krav.etterlevelseStatus === undefined &&
                            utgaattStats.filter((kl) => kl.kravNummer === krav.kravNummer && kl.etterlevelser.length > 0).length > 0 &&
                            getNumberOfDaysBetween(moment(krav.aktivertDato).toDate(), new Date()) < 30,
                        ) && <Tag variant="warning">Ny versjon</Tag>}
                      </div>
                    </Accordion.Header>
                    <Accordion.Content>
                      <div className="flex flex-col gap-6">
                        <div>
                          <Link href={`/tema/${tema.code}`} target="_blank">
                            Lær mer om {tema.shortName} (åpnes i ny fane)
                          </Link>
                        </div>
                        <div className="flex flex-col gap-2">
                          {kravliste.map((krav, idx) => (
                            <KravCard
                              key={`krav_${idx}`}
                              krav={krav}
                              kravFilter={KRAV_FILTER_TYPE.RELEVANTE_KRAV}
                              etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
                              temaCode={tema.code}
                            />
                          ))}
                        </div>
                      </div>
                    </Accordion.Content>
                  </Accordion.Item>
                )
              })}
          </Accordion>
        )}
        {/*
        DISABLED TEMPORARY
        {irrelevanteStats.length > 0 && (
          <>
            <Block>
              <H3>Tema dere har filtrert bort</H3>
              <ParagraphMedium maxWidth={'574px'}>Dere har filtrert bort tema med krav som dere må kjenne til og selv vurdere om dere skal etterleve.</ParagraphMedium>
            </Block>
            <Block display="flex" width="100%" justifyContent="space-between" flexWrap marginTop={theme.sizing.scale550}>
              {temaListe.map((tema) => (
                <TemaCardBehandling tema={tema} stats={irrelevanteStats} behandling={behandling} key={`${tema.shortName}_panel`} irrelevant={true}/>
              ))}
            </Block>
          </>
        )} */}
        <div className="w-full flex justify-end items-center">
          <ExportEtterlevelseModal etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id} />
          {user.isAdmin() && (
            <Button variant="tertiary" size="small" onClick={() => setArkivModal(true)}>
              Arkivér i WebSak
            </Button>
          )}
          <ArkiveringModal
            arkivModal={arkivModal}
            setArkivModal={setArkivModal}
            etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
            etterlevelseArkiv={etterlevelseArkiv}
            setEtterlevelseArkiv={setEtterlevelseArkiv}
          />
        </div>
      </div>
    </div>
  )
}

export const statsQuery = gql`
  query getEtterlevelseDokumentasjonStats($etterlevelseDokumentasjonId: ID) {
    etterlevelseDokumentasjon(filter: { id: $etterlevelseDokumentasjonId }) {
      content {
        stats {
          fyltKrav {
            kravNummer
            kravVersjon
            navn
            status
            aktivertDato
            etterlevelser(etterlevelseDokumentasjonId: $etterlevelseDokumentasjonId) {
              status
              etterlevelseDokumentasjonId
              fristForFerdigstillelse
              changeStamp {
                lastModifiedBy
                lastModifiedDate
                createdDate
              }
            }
            regelverk {
              lov {
                code
                shortName
              }
            }
            changeStamp {
              lastModifiedBy
              lastModifiedDate
              createdDate
            }
          }
          ikkeFyltKrav {
            kravNummer
            kravVersjon
            navn
            status
            aktivertDato
            etterlevelser(etterlevelseDokumentasjonId: $etterlevelseDokumentasjonId) {
              status
              etterlevelseDokumentasjonId
              fristForFerdigstillelse
              changeStamp {
                lastModifiedBy
                lastModifiedDate
                createdDate
              }
            }
            regelverk {
              lov {
                code
                shortName
              }
            }
            changeStamp {
              lastModifiedBy
              lastModifiedDate
              createdDate
            }
          }
          irrelevantKrav {
            kravNummer
            kravVersjon
            navn
            status
            aktivertDato
            etterlevelser(etterlevelseDokumentasjonId: $etterlevelseDokumentasjonId) {
              status
              etterlevelseDokumentasjonId
              fristForFerdigstillelse
              changeStamp {
                lastModifiedBy
                lastModifiedDate
                createdDate
              }
            }
            regelverk {
              lov {
                code
                shortName
              }
            }
            changeStamp {
              lastModifiedBy
              lastModifiedDate
              createdDate
            }
          }
          utgaattKrav {
            kravNummer
            kravVersjon
            navn
            status
            aktivertDato
            etterlevelser(etterlevelseDokumentasjonId: $etterlevelseDokumentasjonId) {
              behandlingId
              status
              etterlevelseDokumentasjonId
              changeStamp {
                lastModifiedBy
                lastModifiedDate
                createdDate
              }
            }
            regelverk {
              lov {
                code
                shortName
              }
            }
            changeStamp {
              lastModifiedBy
              lastModifiedDate
              createdDate
            }
          }
        }
      }
    }
  }
`
