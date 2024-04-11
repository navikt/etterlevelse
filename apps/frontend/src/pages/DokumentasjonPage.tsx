import { useQuery } from '@apollo/client'
import { BodyShort, Button, Heading, Loader } from '@navikt/ds-react'
import { useEffect, useState } from 'react'
import { hotjar } from 'react-hotjar'
import { useParams } from 'react-router-dom'
import { useArkiveringByEtterlevelseDokumentasjonId } from '../api/ArkiveringApi'
import { useEtterlevelseDokumentasjon } from '../api/EtterlevelseDokumentasjonApi'
import { LoadingSkeleton } from '../components/common/LoadingSkeleton'
import { ArkiveringModal } from '../components/etterlevelseDokumentasjon/ArkiveringModal'
import { EtterlevelseDokumentasjonExpansionCard } from '../components/etterlevelseDokumentasjon/EtterlevelseDokumentasjonExpansionCard'
import { KravAccordionList } from '../components/etterlevelseDokumentasjon/KravAccordionList'
import { getNewestKravVersjon } from '../components/etterlevelseDokumentasjon/common/utils'
import EditEtterlevelseDokumentasjonModal from '../components/etterlevelseDokumentasjon/edit/EditEtterlevelseDokumentasjonModal'
import ExportEtterlevelseModal from '../components/export/ExportEtterlevelseModal'
import { PageLayout } from '../components/scaffold/Page'
import {
  IBreadCrumbPath,
  IEtterlevelseDokumentasjonStats,
  IPageResponse,
  TKravQL,
} from '../constants'
import { getEtterlevelseDokumentasjonStatsQuery } from '../query/EtterlevelseDokumentasjonQuery'
import { ampli, userRoleEventProp } from '../services/Amplitude'
import { EListName, codelist } from '../services/Codelist'
import { user } from '../services/User'
import { isFerdigUtfylt } from './EtterlevelseDokumentasjonTemaPage'
import { dokumentasjonerBreadCrumbPath } from './util/BreadCrumbPath'

export const DokumentasjonPage = () => {
  const params = useParams<{ id?: string }>()
  const temaListe = codelist.getCodes(EListName.TEMA)
  const [openAccordions, setOpenAccordions] = useState<boolean[]>(temaListe.map(() => false))
  const variables = { etterlevelseDokumentasjonId: params.id }
  const [etterlevelseDokumentasjon, setEtterlevelseDokumentasjon] = useEtterlevelseDokumentasjon(
    params.id
  )
  const [etterlevelseArkiv, setEtterlevelseArkiv] = useArkiveringByEtterlevelseDokumentasjonId(
    params.id
  )

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
    }
  }, [etterlevelseDokumentasjon])

  let antallFylttKrav = 0

  getNewestKravVersjon(relevanteStats).forEach((k: TKravQL) => {
    if (k.etterlevelser.length && isFerdigUtfylt(k.etterlevelser[0].status)) {
      antallFylttKrav += 1
    }
  })

  if (!etterlevelseDokumentasjon) return <LoadingSkeleton header="Dokumentasjon" />

  const breadcrumbPaths: IBreadCrumbPath[] = [dokumentasjonerBreadCrumbPath]

  const { etterlevelseNummer, title } = etterlevelseDokumentasjon

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
            <EtterlevelseDokumentasjonExpansionCard
              etterlevelseDokumentasjon={etterlevelseDokumentasjon}
            />
            {etterlevelseDokumentasjon && (
              <EditEtterlevelseDokumentasjonModal
                etterlevelseDokumentasjon={etterlevelseDokumentasjon}
                setEtterlevelseDokumentasjon={setEtterlevelseDokumentasjon}
                isEditButton
              />
            )}
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

        {loading && (
          <div className="flex w-full justify-center mt-3.5">
            <Loader size={'large'} />
          </div>
        )}

        {!loading && (
          <KravAccordionList
            etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
            relevanteStats={relevanteStats}
            utgaattStats={utgaattStats}
            temaListe={temaListe}
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
