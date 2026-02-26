'use client'

import {
  getBehandlingensArtOgOmfangByEtterlevelseDokumentId,
  useBehandlingensArtOgOmfang,
} from '@/api/behandlingensArtOgOmfang/behandlingensArtOgOmfangApi'
import { getBehandlingensLivslopByEtterlevelseDokumentId } from '@/api/behandlingensLivslop/behandlingensLivslopApi'
import { getDocumentRelationByToIdAndRelationTypeWithData } from '@/api/dokumentRelasjon/dokumentRelasjonApi'
import { useEtterlevelseDokumentasjon } from '@/api/etterlevelseDokumentasjon/etterlevelseDokumentasjonApi'
import { getPvkDokumentByEtterlevelseDokumentId } from '@/api/pvkDokument/pvkDokumentApi'
import { getRisikoscenarioByPvkDokumentId } from '@/api/risikoscenario/risikoscenarioApi'
import { IBehandlingensArtOgOmfang } from '@/constants/behandlingensArtOgOmfang/behandlingensArtOgOmfangConstants'
import { IBreadCrumbPath, IPageResponse } from '@/constants/commonConstants'
import { IBehandlingensLivslop } from '@/constants/etterlevelseDokumentasjon/behandlingensLivslop/behandlingensLivslopConstants'
import {
  ERelationType,
  IDocumentRelationWithEtterlevelseDokumetajson,
} from '@/constants/etterlevelseDokumentasjon/dokumentRelasjon/dokumentRelasjonConstants'
import {
  EEtterlevelseDokumentasjonStatus,
  IEtterlevelseDokumentasjonStats,
} from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import {
  ERisikoscenarioType,
  IRisikoscenario,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import { EListName, TTemaCode } from '@/constants/kodeverk/kodeverkConstants'
import { CodelistContext } from '@/provider/kodeverk/kodeverkProvider'
import { UserContext } from '@/provider/user/userProvider'
import { getEtterlevelseDokumentasjonStatsQuery } from '@/query/etterlevelseDokumentasjon/etterlevelseDokumentasjonQuery'
import { etterlevelseDokumentasjonIdUrl } from '@/routes/etterlevelseDokumentasjon/etterlevelseDokumentasjonRoutes'
import { dokumentasjonerBreadCrumbPath } from '@/util/breadCrumbPath/breadCrumbPath'
import { filterEtterlevelseDokumentasjonStatsData } from '@/util/etterlevelseDokumentasjon/etterlevelseDokumentasjonUtil'
import { useQuery } from '@apollo/client/react'
import { ExclamationmarkTriangleIcon } from '@navikt/aksel-icons'
import { BodyShort, Heading, InfoCard, Link, ReadMore } from '@navikt/ds-react'
import { useParams } from 'next/navigation'
import { useContext, useEffect, useState } from 'react'
import { LoadingSkeleton } from '../../common/loadingSkeleton/loadingSkeletonComponent'
import { ContentLayout } from '../../others/layout/content/content'
import { PageLayout } from '../../others/scaffold/scaffold'
import { GjenbrukAlert } from './alert/GjenbrukAlert'
import EtterlevelseDokumentasjonButtonGroup from './buttonGroup/etterlevelseDokumentasjonButtonGroup'
import EtterlevelseDokumentasjonExpansionCard from './expantionCard/etterlevelseDokumentasjonExpansionCard'
import EtterlevelseDokumentasjonPageTabs from './tabs/etterlevelseDokumentasjonPageTabs'

export const EtterlevelseDokumentasjonPage = () => {
  const user = useContext(UserContext)
  const codelist = useContext(CodelistContext)
  const temaListe: TTemaCode[] = codelist.utils.getCodes(EListName.TEMA) as TTemaCode[]
  const params: Readonly<{
    etterlevelseDokumentasjonId?: string
  }> = useParams<{ etterlevelseDokumentasjonId?: string }>()
  const [etterlevelseNummer, setEtterlevelseNummer] = useState<string>('')
  const [title, setTitle] = useState<string>('')
  const [morDokumentRelasjon, setMorDokumentRelasjon] =
    useState<IDocumentRelationWithEtterlevelseDokumetajson>()
  const [relasjonLoading, setRelasjonLoading] = useState(false)
  const [etterlevelseDokumentasjon, setEtterlevelseDokumentasjon] = useEtterlevelseDokumentasjon(
    params.etterlevelseDokumentasjonId
  )
  const variables: {
    etterlevelseDokumentasjonId: string | undefined
  } = { etterlevelseDokumentasjonId: params.etterlevelseDokumentasjonId }

  const {
    data: relevanteData,
    refetch: refetchRelevanteData,
    loading,
  } = useQuery<{
    etterlevelseDokumentasjon: IPageResponse<{ stats: IEtterlevelseDokumentasjonStats }>
  }>(getEtterlevelseDokumentasjonStatsQuery, {
    variables,
    skip: !params.etterlevelseDokumentasjonId,
  })

  const [relevanteStats, utgaattStats] = filterEtterlevelseDokumentasjonStatsData(relevanteData)
  const [pvkDokument, setPvkDokument] = useState<IPvkDokument>()
  const [artOgOmfang] = useBehandlingensArtOgOmfang(params.etterlevelseDokumentasjonId)
  const [behandlingsLivslop, setBehandlingsLivslop] = useState<IBehandlingensLivslop>()
  const [behandlingensArtOgOmfang, setBehandlingensArtOgOmfang] =
    useState<IBehandlingensArtOgOmfang>()
  const [risikoscenarioList, setRisikoscenarioList] = useState<IRisikoscenario[]>([])
  const [kravRisikoscenarioList, setKravRisikoscenarioList] = useState<IRisikoscenario[]>([])
  const [isRisikoscenarioLoading, setIsRisikoscenarioLoading] = useState<boolean>(false)

  const breadcrumbPaths: IBreadCrumbPath[] = [dokumentasjonerBreadCrumbPath]

  useEffect(() => {
    setTimeout(() => refetchRelevanteData(), 200)
    if (etterlevelseDokumentasjon) {
      setEtterlevelseNummer(etterlevelseDokumentasjon.etterlevelseNummer.toString())
      setTitle(etterlevelseDokumentasjon.title)
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
                .then((risikoscenario) => {
                  setRisikoscenarioList(risikoscenario.content)
                  setKravRisikoscenarioList(
                    risikoscenario.content.filter(
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
            if (response) {
              setBehandlingsLivslop(response)
            }
          })
          .catch(() => undefined)

        await getBehandlingensArtOgOmfangByEtterlevelseDokumentId(etterlevelseDokumentasjon.id)
          .then((response: IBehandlingensArtOgOmfang) => {
            if (response) {
              setBehandlingensArtOgOmfang(response)
            }
          })
          .catch(() => undefined)
      })()
    }
  }, [etterlevelseDokumentasjon])

  return (
    <>
      {!etterlevelseDokumentasjon && <LoadingSkeleton header='Dokumentasjon' />}
      {etterlevelseDokumentasjon && (
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
                    href={etterlevelseDokumentasjonIdUrl(
                      morDokumentRelasjon.fromDocumentWithData.id
                    )}
                  >
                    E{morDokumentRelasjon.fromDocumentWithData.etterlevelseNummer}{' '}
                    {morDokumentRelasjon.fromDocumentWithData.title}
                  </Link>
                </BodyShort>
              )}

              <ContentLayout>
                <div className='max-w-5xl flex-1'>
                  {etterlevelseDokumentasjon.status !==
                    EEtterlevelseDokumentasjonStatus.UNDER_ARBEID && (
                    <InfoCard data-color='warning' className='my-5 max-w-[75ch]'>
                      <InfoCard.Header icon={<ExclamationmarkTriangleIcon aria-hidden />}>
                        <InfoCard.Title>
                          Fordi dette etterlevelsesdokumentet ligger til godkjenning hos risikoeier,
                          vil det ikke være mulig å redigere kravdokumentasjon fram til at
                          dokumentet er godkjent.
                        </InfoCard.Title>
                      </InfoCard.Header>
                    </InfoCard>
                  )}

                  {etterlevelseDokumentasjon.forGjenbruk &&
                    !etterlevelseDokumentasjon.tilgjengeligForGjenbruk && <GjenbrukAlert />}

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
                      {(etterlevelseDokumentasjon.hasCurrentUserAccess ||
                        user.isAdmin() ||
                        user.isPersonvernombud() ||
                        etterlevelseDokumentasjon.risikoeiere.includes(user.getIdent())) && (
                        <EtterlevelseDokumentasjonButtonGroup
                          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
                          setEtterlevelseDokumentasjon={setEtterlevelseDokumentasjon}
                          artOgOmfang={artOgOmfang}
                          pvkDokument={pvkDokument}
                          behandlingsLivslop={behandlingsLivslop}
                          behandlingensArtOgOmfang={behandlingensArtOgOmfang}
                          risikoscenarioList={risikoscenarioList}
                        />
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
              suksesskriteriene er merket med &#34;ikke relevant&#34; eller &#34;oppfylt&#34;, og du
              kan gjenbruke vurderingene. De øvrige suksesskriteriene må du ta stilling til. Noen av
              disse inneholder veiledning til hvordan du skal svare ut spørsmålene.
            </ReadMore>
          )}
          <EtterlevelseDokumentasjonPageTabs
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
      )}
    </>
  )
}
