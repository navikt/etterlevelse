import { getBehandlingensLivslopByEtterlevelseDokumentId } from '@/api/behandlingensLivslop/behandlingensLivslopApi'
import { useEtterlevelseDokumentasjon } from '@/api/etterlevelseDokumentasjon/etterlevelseDokumentasjonApi'
import { usePvkDokument } from '@/api/pvkDokument/pvkDokumentApi'
import { CenteredLoader } from '@/components/common/centeredLoader/centeredLoader'
import { ContentLayout } from '@/components/others/layout/content/content'
import { PageLayout } from '@/components/others/scaffold/scaffold'
import {
  IBehandling,
  IExternalCode,
  IPolicy,
} from '@/constants/behandlingskatalogen/behandlingskatalogConstants'
import { IBreadCrumbPath } from '@/constants/commonConstants'
import { IBehandlingensLivslop } from '@/constants/etterlevelseDokumentasjon/behandlingensLivslop/behandlingensLivslopConstants'
import { EPvkVurdering } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { EListName, ICode } from '@/constants/kodeverk/kodeverkConstants'
import { CodelistContext } from '@/provider/kodeverk/kodeverkProvider'
import { UserContext } from '@/provider/user/userProvider'
import { etterlevelseDokumentasjonIdUrl } from '@/routes/etterlevelseDokumentasjon/etterlevelseDokumentasjonRoutes'
import { dokumentasjonerBreadCrumbPath } from '@/util/breadCrumbPath/breadCrumbPath'
import { isReadOnlyPvkStatus } from '@/util/etterlevelseDokumentasjon/pvkDokument/pvkDokumentUtils'
import { Heading } from '@navikt/ds-react'
import { uniqBy } from 'lodash'
import { useParams } from 'next/navigation'
import { useContext, useEffect, useMemo, useState } from 'react'
import PvkBehovForm from '../form/pvkBehovForm'
import PvkBehovInfoContent from './pvkBehovInfoContent'
import PvkBehovMetadata from './pvkBehovMetadata'
import PvkBehovReadOnly from './pvkBehovReadOnly'

export const PvkBehovPage = () => {
  const params: Readonly<
    Partial<{
      etterlevelseDokumentasjonId?: string
      pvkDokumentId?: string
    }>
  > = useParams<{ etterlevelseDokumentasjonId?: string; pvkDokumentId?: string }>()
  const [etterlevelseDokumentasjon, , isEtterlevelseDokumentasjonLoading] =
    useEtterlevelseDokumentasjon(params.etterlevelseDokumentasjonId)
  const [pvkDokument, setPvkDokument] = usePvkDokument(
    params.pvkDokumentId,
    params.etterlevelseDokumentasjonId
  )

  const [behandlingensLivslop, setBehandlingensLivslop] = useState<IBehandlingensLivslop>()
  const breadcrumbPaths: IBreadCrumbPath[] = [
    dokumentasjonerBreadCrumbPath,
    {
      href: etterlevelseDokumentasjonIdUrl(etterlevelseDokumentasjon?.id),
      pathName: `E${etterlevelseDokumentasjon?.etterlevelseNummer.toString()}.${etterlevelseDokumentasjon?.etterlevelseDokumentVersjon} ${etterlevelseDokumentasjon?.title}`,
    },
  ]

  const codelist = useContext(CodelistContext)
  const user = useContext(UserContext)

  const ytterligereEgenskaper: ICode[] = codelist.utils.getCodes(
    EListName.YTTERLIGERE_EGENSKAPER
  ) as ICode[]

  const { profilering, automatiskBehandling, saerligKategorier, opplysningstyperMangler } =
    useMemo(() => {
      if (!etterlevelseDokumentasjon?.behandlinger) {
        return {
          profilering: false as boolean | null,
          automatiskBehandling: false as boolean | null,
          saerligKategorier: false,
          opplysningstyperMangler: false,
        }
      }

      const alleOpplysningstyper: IPolicy[] = []
      const alleProfilering: any[] = []
      const alleAutomatiskBehandling: any[] = []
      let opplysningstyperMangler = false

      etterlevelseDokumentasjon.behandlinger.forEach((behandling: IBehandling) => {
        if (behandling.policies) {
          if (behandling.policies.length === 0) {
            opplysningstyperMangler = true
          }
          alleOpplysningstyper.push(...behandling.policies)
        }
        alleProfilering.push(behandling.profilering)
        alleAutomatiskBehandling.push(behandling.automatiskBehandling)
      })

      let profilering: boolean | null = false
      if (alleProfilering.includes(true)) {
        profilering = true
      } else if (alleProfilering.every((v) => v === false)) {
        profilering = false
      } else if (alleProfilering.includes(null)) {
        profilering = null
      }

      let automatiskBehandling: boolean | null = false
      if (alleAutomatiskBehandling.includes(true)) {
        automatiskBehandling = true
      } else if (alleAutomatiskBehandling.every((v) => v === false)) {
        automatiskBehandling = false
      } else if (alleAutomatiskBehandling.includes(null)) {
        automatiskBehandling = null
      }

      const saerligKategorierOppsumert: IExternalCode[] = uniqBy(
        alleOpplysningstyper.flatMap((opplysningstyper: IPolicy) => opplysningstyper.sensitivity),
        'code'
      ).filter((kategori: IExternalCode) => kategori.code === 'SAERLIGE')

      return {
        profilering,
        automatiskBehandling,
        saerligKategorier: saerligKategorierOppsumert.length > 0,
        opplysningstyperMangler,
      }
    }, [etterlevelseDokumentasjon])

  useEffect(() => {
    ;(async () => {
      if (etterlevelseDokumentasjon) {
        await getBehandlingensLivslopByEtterlevelseDokumentId(etterlevelseDokumentasjon?.id).then(
          (response: IBehandlingensLivslop) => {
            if (response) {
              setBehandlingensLivslop(response)
            }
          }
        )
      }
    })()
  }, [etterlevelseDokumentasjon])

  const isPvkBehovLock =
    pvkDokument &&
    pvkDokument.pvkVurdering === EPvkVurdering.SKAL_UTFORE &&
    pvkDokument.hasPvkDocumentationStarted === true

  return (
    <PageLayout
      pageTitle='Bør vi gjøre en Personvernkonsekvensvurdering (PVK) ?'
      currentPage='Bør vi gjøre en Personvernkonsekvensvurdering (PVK) ?'
      breadcrumbPaths={breadcrumbPaths}
    >
      <Heading level='1' size='medium' className='mb-5'>
        Bør vi gjøre en Personvernkonsekvensvurdering (PVK) ?
      </Heading>
      {isEtterlevelseDokumentasjonLoading && <CenteredLoader />}

      {!isEtterlevelseDokumentasjonLoading && etterlevelseDokumentasjon && pvkDokument && (
        <ContentLayout>
          <div className='pt-6 pr-4 flex flex-1 flex-col gap-4 col-span-8'>
            <PvkBehovInfoContent
              etterlevelseDokumentasjon={etterlevelseDokumentasjon}
              profilering={profilering}
              automatiskBehandling={automatiskBehandling}
              opplysningstyperMangler={opplysningstyperMangler}
              saerligKategorier={saerligKategorier}
              behandlingensLivslop={behandlingensLivslop}
            />
            {(etterlevelseDokumentasjon.hasCurrentUserAccess || user.isAdmin()) &&
              !isReadOnlyPvkStatus(pvkDokument.status) &&
              !isPvkBehovLock && (
                <PvkBehovForm
                  pvkDokument={pvkDokument}
                  setPvkDokument={setPvkDokument}
                  etterlevelseDokumentasjon={etterlevelseDokumentasjon}
                  profilering={profilering}
                  automatiskBehandling={automatiskBehandling}
                  saerligKategorier={saerligKategorier}
                  ytterligereEgenskaper={ytterligereEgenskaper}
                />
              )}

            {((!etterlevelseDokumentasjon.hasCurrentUserAccess && !user.isAdmin()) ||
              isReadOnlyPvkStatus(pvkDokument.status) ||
              isPvkBehovLock) && (
              <PvkBehovReadOnly
                pvkDokument={pvkDokument}
                ytterligereEgenskaper={ytterligereEgenskaper}
              />
            )}
          </div>

          {etterlevelseDokumentasjon && (
            <div className='pl-4 border-l border-[#071a3636] w-full max-w-md'>
              <PvkBehovMetadata etterlevelseDokumentasjon={etterlevelseDokumentasjon} />
            </div>
          )}
        </ContentLayout>
      )}
    </PageLayout>
  )
}

export default PvkBehovPage
