import { useQuery } from '@apollo/client'
import { ExclamationmarkTriangleFillIcon } from '@navikt/aksel-icons'
import { BodyShort, Button, ExpansionCard, Heading, Label, Loader, Tag } from '@navikt/ds-react'
import { useEffect, useState } from 'react'
import { hotjar } from 'react-hotjar'
import { useParams } from 'react-router-dom'
import { useArkiveringByEtterlevelseDokumentasjonId } from '../api/ArkiveringApi'
import { useEtterlevelseDokumentasjon } from '../api/EtterlevelseDokumentasjonApi'
import { getAllKravPriority } from '../api/KravPriorityApi'
import { IBreadcrumbPaths } from '../components/common/CustomizedBreadcrumbs'
import { LoadingSkeleton } from '../components/common/LoadingSkeleton'
import { ExternalLink } from '../components/common/RouteLink'
import { Teams } from '../components/common/TeamName'
import { ArkiveringModal } from '../components/etterlevelseDokumentasjon/ArkiveringModal'
import { KravAccordionList } from '../components/etterlevelseDokumentasjon/KravAccordionList'
import { getNewestKravVersjon } from '../components/etterlevelseDokumentasjon/common/utils'
import EditEtterlevelseDokumentasjonModal from '../components/etterlevelseDokumentasjon/edit/EditEtterlevelseDokumentasjonModal'
import ExportEtterlevelseModal from '../components/export/ExportEtterlevelseModal'
import { PageLayout } from '../components/scaffold/Page'
import {
  IEtterlevelseDokumentasjonStats,
  IKravPrioritering,
  IPageResponse,
  TKravQL,
} from '../constants'
import { getEtterlevelseDokumentasjonStatsQuery } from '../query/EtterlevelseDokumentasjonQuery'
import { ampli, userRoleEventProp } from '../services/Amplitude'
import { EListName, ICode, codelist } from '../services/Codelist'
import { user } from '../services/User'
import { env } from '../util/env'
import { isFerdigUtfylt } from './EtterlevelseDokumentasjonTemaPage'

export const DokumentasjonPage = () => {
  const params = useParams<{ id?: string }>()
  const options = codelist.getParsedOptions(EListName.RELEVANS)
  const temaListe = codelist
    .getCodes(EListName.TEMA)
    .sort((a, b) => a.shortName.localeCompare(b.shortName, 'nb'))
  const [openAccordions, setOpenAccordions] = useState<boolean[]>(temaListe.map(() => false))
  const variables = { etterlevelseDokumentasjonId: params.id }
  const [etterlevelseDokumentasjon, setEtterlevelseDokumentasjon] = useEtterlevelseDokumentasjon(
    params.id
  )
  const [etterlevelseArkiv, setEtterlevelseArkiv] = useArkiveringByEtterlevelseDokumentasjonId(
    params.id
  )
  const [kravPriority, setKravPriority] = useState<IKravPrioritering[]>([])

  useEffect(() => {
    getAllKravPriority().then((priority) => setKravPriority(priority))
  }, [])

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
  const [arkivModal, setArkivModal] = useState<boolean>(false)

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
    hotjar.initialize(148751, 6)
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
    }
  }, [etterlevelseDokumentasjon])

  let antallFylttKrav = 0

  getNewestKravVersjon(relevanteStats).forEach((k: TKravQL) => {
    if (k.etterlevelser.length && isFerdigUtfylt(k.etterlevelser[0].status)) {
      antallFylttKrav += 1
    }
  })

  const getRelevans = (irrelevans?: ICode[]) => {
    const fargeForFemAlternativ = ['alt1', 'alt2', 'alt3', 'alt1', 'alt2'] as const

    if (irrelevans?.length === options.length) {
      return (
        <BodyShort size="small">
          For å filtrere bort krav som ikke er relevante, må dere oppgi egenskaper ved
          dokumentasjonen.
        </BodyShort>
      )
    }

    if (irrelevans) {
      const relevans = options.filter(
        (n) => !irrelevans.map((ir: ICode) => ir.code).includes(n.value)
      )

      return (
        <div className="flex flex-wrap gap-2">
          {relevans.map((r, index) => (
            <div key={r.value} className="flex items-center gap-1">
              <Tag variant={fargeForFemAlternativ[index]} size="small">
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
            <Tag variant={fargeForFemAlternativ[index]} size="small">
              <BodyShort size="small">{o.label}</BodyShort>
            </Tag>
          </div>
        ))}
      </div>
    )
  }

  if (!etterlevelseDokumentasjon) return <LoadingSkeleton header="Dokumentasjon" />

  const breadcrumbPaths: IBreadcrumbPaths[] = [
    {
      pathName: 'Dokumenter etterlevelse',
      href: '/dokumentasjoner',
    },
  ]

  const {
    etterlevelseNummer,
    title,
    behandlerPersonopplysninger,
    behandlingIds,
    behandlinger,
    teams,
    irrelevansFor,
  } = etterlevelseDokumentasjon

  return (
    <PageLayout
      pageTitle={'E' + etterlevelseNummer.toString() + ' ' + title}
      currentPage="Temaoversikt"
      breadcrumbPaths={breadcrumbPaths}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Heading level="1" size="medium">
            Temaoversikt
          </Heading>
          <div className="flex items-center my-5">
            <ExpansionCard aria-label="tittel på etterlevelsesdokument" className="w-full">
              <ExpansionCard.Header className="border-b border-solid border-gray-500">
                <ExpansionCard.Title as="h4" size="small">
                  E{etterlevelseNummer.toString()} {title}
                </ExpansionCard.Title>
              </ExpansionCard.Header>
              <ExpansionCard.Content>
                {behandlerPersonopplysninger && (
                  <div className="flex gap-2 flex-wrap items-center mb-2.5">
                    <BodyShort size="small">Behandling:</BodyShort>
                    {behandlingIds?.length >= 1 && behandlerPersonopplysninger ? (
                      behandlingIds.map((behandlingId, index) => (
                        <div key={'behandling_link_' + index}>
                          {behandlinger && behandlinger[index].navn ? (
                            <ExternalLink
                              className="text-medium"
                              href={`${env.pollyBaseUrl}process/${behandlingId}`}
                            >
                              {behandlinger?.length > 0
                                ? `${behandlinger[index].navn}`
                                : 'Ingen data'}
                            </ExternalLink>
                          ) : (
                            <BodyShort size="small">
                              {behandlinger ? behandlinger[index].navn : 'Ingen data'}
                            </BodyShort>
                          )}
                        </div>
                      ))
                    ) : (
                      <BodyShort size="small">
                        Husk å legge til behandling fra behandlingskatalogen
                      </BodyShort>
                    )}
                  </div>
                )}
                <div className="mb-2.5">
                  {teams.length > 0 ? (
                    <Teams teams={teams} link />
                  ) : (
                    <BodyShort size="small">Team er ikke angitt</BodyShort>
                  )}
                </div>
                <div className="flex items-start gap-2">
                  <BodyShort size="small">Egenskaper:</BodyShort>
                  {irrelevansFor.length === options.length && (
                    <div className="flex items-center gap-1">
                      <ExclamationmarkTriangleFillIcon
                        area-label=""
                        aria-hidden
                        className="text-2xl text-icon-warning"
                      />
                      <Label size="small">Ingen egenskaper er oppgitt</Label>
                    </div>
                  )}
                  {!irrelevansFor.length ? getRelevans() : getRelevans(irrelevansFor)}
                </div>
              </ExpansionCard.Content>
            </ExpansionCard>
            <EditEtterlevelseDokumentasjonModal
              etterlevelseDokumentasjon={etterlevelseDokumentasjon}
              setEtterlevelseDokumentasjon={setEtterlevelseDokumentasjon}
              isEditButton
            />
          </div>
        </div>
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
            <Button
              variant="tertiary"
              size="xsmall"
              onClick={() => setOpenAccordions(temaListe.map(() => true))}
            >
              Åpne alle tema
            </Button>
            <Button
              variant="tertiary"
              size="xsmall"
              onClick={() => setOpenAccordions(temaListe.map(() => false))}
            >
              Lukk alle tema
            </Button>
          </div>

          <div className="flex justify-end w-full items-center">
            <BodyShort size="medium">
              Totalt {getNewestKravVersjon(relevanteStats).length} krav, {antallFylttKrav} ferdig
              utfylt
            </BodyShort>
          </div>
        </div>

        {loading ? (
          <div className="flex w-full justify-center mt-3.5">
            <Loader size={'large'} />
          </div>
        ) : (
          <KravAccordionList
            etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
            relevanteStats={relevanteStats}
            utgaattStats={utgaattStats}
            temaListe={temaListe}
            kravPriority={kravPriority}
            openAccordions={openAccordions}
            setOpenAccordions={setOpenAccordions}
          />
        )}
        {/*
        DISABLED TEMPORARY
        {irrelevanteStats.length > 0 && (
          <>
            <div>
              <H3>Tema dere har filtrert bort</H3>
              <ParagraphMedium maxWidth={'574px'}>Dere har filtrert bort tema med krav som dere må kjenne til og selv vurdere om dere skal etterleve.</ParagraphMedium>
            </div>
            <div display="flex" width="100%" justifyContent="space-between" flexWrap marginTop={theme.sizing.scale550}>
              {temaListe.map((tema) => (
                <TemaCardBehandling tema={tema} stats={irrelevanteStats} behandling={behandling} key={`${tema.shortName}_panel`} irrelevant={true}/>
              ))}
            </div>
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
    </PageLayout>
  )
}
