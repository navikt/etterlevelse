'use client'

import { useBehandlingensArtOgOmfang } from '@/api/behandlingensArtOgOmfang/behandlingensArtOgOmfangApi'
import { useEtterlevelseDokumentasjon } from '@/api/etterlevelseDokumentasjon/etterlevelseDokumentasjonApi'
import { getPvkDokumentByEtterlevelseDokumentId } from '@/api/pvkDokument/pvkDokumentApi'
import { IExternalCode } from '@/constants/behandlingskatalogen/behandlingskatalogConstants'
import { IBreadCrumbPath } from '@/constants/commonConstants'
import {
  EPvkVurdering,
  IPvkDokument,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { UserContext } from '@/provider/user/userProvider'
import { etterlevelseDokumentasjonIdUrl } from '@/routes/etterlevelseDokumentasjon/etterlevelseDokumentasjonRoutes'
import { pvkDokumentasjonPvkTypeStepUrl } from '@/routes/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensvurderingRoutes'
import { dokumentasjonerBreadCrumbPath } from '@/util/breadCrumbPath/breadCrumbPath'
import { isReadOnlyPvkStatus } from '@/util/etterlevelseDokumentasjon/pvkDokument/pvkDokumentUtils'
import { ChevronLeftIcon, ChevronRightIcon } from '@navikt/aksel-icons'
import { Button, Loader } from '@navikt/ds-react'
import _, { uniqBy } from 'lodash'
import { useParams, useRouter } from 'next/navigation'
import { RefObject, useContext, useEffect, useMemo, useRef, useState } from 'react'
import ArtOgOmfangReadOnlyContent from '../PVK/pvkDokumentPage/stepperViews/readOnlyViews/artOgOmfangReadOnlyContent'
import BehandlingensLivsLopSidePanel from '../behandlingensLivslop/sidePanel/BehandlingensLivsLopSidePanel'
import ForbiddenAlert from '../common/forbiddenAlert'
import UnsavedModalAlert from '../common/unsavedModalAlert/unsavedModalAlert'
import {
  ContentLayout,
  MainPanelLayout,
  SidePanelLayout,
  StickyFooterButtonLayout,
} from '../others/layout/content/content'
import { PageLayout } from '../others/scaffold/scaffold'
import AlertPvoUnderArbeidModal from '../pvoTilbakemelding/common/alertPvoUnderArbeidModal'
import BehandlingensArtOgOmfangForm from './form/behandlingensArtOgOmfangForm'

export const BehandlingensArtOgOmfangPage = () => {
  const params: Readonly<
    Partial<{
      etterlevelseDokumentasjonId?: string
      behandlingensArtOgOmfangId?: string
    }>
  > = useParams<{ etterlevelseDokumentasjonId?: string; behandlingensArtOgOmfangId?: string }>()
  const [etterlevelseDokumentasjon, , isEtterlevelseDokumentasjonLoading] =
    useEtterlevelseDokumentasjon(params.etterlevelseDokumentasjonId)
  const [artOgOmfang, setArtOgOmfang, artOgOmfangLoading] = useBehandlingensArtOgOmfang(
    params.etterlevelseDokumentasjonId
  )
  const [pvkDokument, setPvkDokument] = useState<IPvkDokument>()
  const [submitClick] = useState<boolean>(false)
  const [isPvoAlertModalOpen, setIsPvoAlertModalOpen] = useState<boolean>(false)
  const [isUnsavedModalOpen, setIsUnsavedModalOpen] = useState<boolean>(false)
  const [urlToNavigate, setUrlToNavigate] = useState<string>('')
  const [savedSuccessful, setSavedSuccessful] = useState<boolean>(false)
  const errorSummaryRef = useRef<HTMLDivElement>(null)
  const formRef: RefObject<any> = useRef(undefined)

  const readOnlyData: { personkategorier: string[] } = useMemo(() => {
    if (
      etterlevelseDokumentasjon &&
      etterlevelseDokumentasjon.behandlinger &&
      etterlevelseDokumentasjon.behandlinger.length > 0
    ) {
      const allePersonKategorier: IExternalCode[] = []

      etterlevelseDokumentasjon.behandlinger.map((behandling) => {
        if (behandling.dataBehandlerList) {
          behandling.policies.map((policy) => {
            allePersonKategorier.push(...policy.personKategorier)
          })
        }
      })

      const uniqPersonkategorier: string[] = uniqBy(allePersonKategorier, 'code')
        .map((personkategori) => personkategori.shortName)
        .sort((a, b) => {
          if (a === 'Annet') {
            return 1
          }
          if (b === 'Annet') {
            return 1
          } else {
            return 0
          }
        })

      return {
        personkategorier: uniqPersonkategorier,
      }
    } else {
      return {
        databehandlere: [],
        personkategorier: [],
      }
    }
  }, [etterlevelseDokumentasjon])

  const router = useRouter()
  const user = useContext(UserContext)
  const breadcrumbPaths: IBreadCrumbPath[] = [
    dokumentasjonerBreadCrumbPath,
    {
      href: etterlevelseDokumentasjonIdUrl(etterlevelseDokumentasjon?.id),
      pathName:
        'E' +
        etterlevelseDokumentasjon?.etterlevelseNummer.toString() +
        ' ' +
        etterlevelseDokumentasjon?.title,
    },
  ]

  useEffect(() => {
    if (etterlevelseDokumentasjon) {
      getPvkDokumentByEtterlevelseDokumentId(etterlevelseDokumentasjon.id)
        .then((response) => {
          if (response) {
            setPvkDokument(response)
          }
        })
        .catch(() => undefined)
    }
  }, [etterlevelseDokumentasjon])

  useEffect(() => {
    if (!_.isEmpty(formRef?.current?.errors) && errorSummaryRef.current) {
      errorSummaryRef.current.focus()
    }
  }, [submitClick])

  const getPvkLink = (etterlevelseDokumentasjonId: string) => {
    const pvkDokumentLink: 'pvkdokument' | 'pvkbehov' =
      pvkDokument && pvkDokument.pvkVurdering === EPvkVurdering.SKAL_UTFORE
        ? 'pvkdokument'
        : 'pvkbehov'

    return pvkDokumentasjonPvkTypeStepUrl(
      etterlevelseDokumentasjonId,
      pvkDokumentLink,
      pvkDokument ? pvkDokument.id : 'ny',
      pvkDokument && pvkDokument.pvkVurdering === EPvkVurdering.SKAL_UTFORE ? '1' : ''
    )
  }

  return (
    <PageLayout
      pageTitle='Behandlingens art og omfang'
      currentPage='Behandlingens art og omfang'
      breadcrumbPaths={breadcrumbPaths}
    >
      {isEtterlevelseDokumentasjonLoading && artOgOmfangLoading && (
        <div className='flex w-full justify-center'>
          <Loader size='large' />
        </div>
      )}

      {!isEtterlevelseDokumentasjonLoading &&
        !artOgOmfangLoading &&
        etterlevelseDokumentasjon &&
        artOgOmfang &&
        !etterlevelseDokumentasjon.hasCurrentUserAccess &&
        !user.isAdmin() && <ForbiddenAlert />}

      {!isEtterlevelseDokumentasjonLoading &&
        !artOgOmfangLoading &&
        etterlevelseDokumentasjon &&
        artOgOmfang &&
        (etterlevelseDokumentasjon.hasCurrentUserAccess || user.isAdmin()) && (
          <ContentLayout>
            <MainPanelLayout hasSidePanel>
              {((pvkDokument && !isReadOnlyPvkStatus(pvkDokument.status)) || !pvkDokument) && (
                <div>
                  <BehandlingensArtOgOmfangForm
                    etterlevelseDokumentasjon={etterlevelseDokumentasjon}
                    personkategorier={readOnlyData.personkategorier}
                    artOgOmfang={artOgOmfang}
                    setArtOgOmfang={setArtOgOmfang}
                    pvkDokument={pvkDokument}
                    savedSuccessful={savedSuccessful}
                    setSavedSuccessful={setSavedSuccessful}
                    setIsPvoAlertModalOpen={setIsPvoAlertModalOpen}
                    formRef={formRef}
                  />
                  {pvkDokument && (
                    <AlertPvoUnderArbeidModal
                      isOpen={isPvoAlertModalOpen}
                      onClose={() => {
                        setIsPvoAlertModalOpen(false)
                      }}
                      pvkDokumentId={pvkDokument.id}
                    />
                  )}
                  <StickyFooterButtonLayout>
                    <Button
                      icon={<ChevronLeftIcon aria-hidden />}
                      iconPosition='left'
                      type='button'
                      variant='tertiary'
                      onClick={() => {
                        if (formRef.current.dirty) {
                          setIsUnsavedModalOpen(true)
                          setUrlToNavigate(
                            etterlevelseDokumentasjonIdUrl(etterlevelseDokumentasjon.id)
                          )
                        } else {
                          router.push(etterlevelseDokumentasjonIdUrl(etterlevelseDokumentasjon.id))
                        }
                      }}
                    >
                      Gå til Temaoversikt
                    </Button>
                    <Button
                      icon={<ChevronRightIcon aria-hidden />}
                      iconPosition='right'
                      type='button'
                      variant={'tertiary'}
                      onClick={() => {
                        if (formRef.current.dirty) {
                          setIsUnsavedModalOpen(true)
                          setUrlToNavigate(getPvkLink(etterlevelseDokumentasjon.id))
                        } else {
                          router.push(getPvkLink(etterlevelseDokumentasjon.id))
                        }
                      }}
                    >
                      {pvkDokument ? 'PVK-Oversikt' : 'Vurder behov for PVK'}
                    </Button>
                  </StickyFooterButtonLayout>
                </div>
              )}

              <UnsavedModalAlert
                isOpen={isUnsavedModalOpen}
                setIsOpen={setIsUnsavedModalOpen}
                urlToNavigate={urlToNavigate}
                formRef={formRef}
              />

              {pvkDokument && isReadOnlyPvkStatus(pvkDokument.status) && (
                <ArtOgOmfangReadOnlyContent
                  artOgOmfang={artOgOmfang}
                  personkategorier={readOnlyData.personkategorier}
                />
              )}
            </MainPanelLayout>

            {/* right side */}
            {etterlevelseDokumentasjon && (
              <SidePanelLayout>
                <BehandlingensLivsLopSidePanel
                  etterlevelseDokumentasjon={etterlevelseDokumentasjon}
                />
              </SidePanelLayout>
            )}
          </ContentLayout>
        )}
    </PageLayout>
  )
}

export default BehandlingensArtOgOmfangPage
