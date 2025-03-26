import { Heading, Loader } from '@navikt/ds-react'
import { uniqBy } from 'lodash'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getBehandlingensLivslopByEtterlevelseDokumentId } from '../api/BehandlingensLivslopApi'
import { useEtterlevelseDokumentasjon } from '../api/EtterlevelseDokumentasjonApi'
import { usePvkDokument } from '../api/PvkDokumentApi'
import PvkBehovInfoContent from '../components/PvkDokument/common/PvkBehovInfoContent'
import PvkBehovMetadata from '../components/PvkDokument/common/PvkBehovMetadata'
import PvkBehovForm from '../components/PvkDokument/edit/PvkBehovForm'
import { PageLayout } from '../components/scaffold/Page'
import { IBehandlingensLivslop, IBreadCrumbPath, IExternalCode, IPolicy } from '../constants'
import { user } from '../services/User'
import { dokumentasjonerBreadCrumbPath } from './util/BreadCrumbPath'

export const PvkBehovPage = () => {
  const params: Readonly<
    Partial<{
      id?: string
      pvkdokumentId?: string
    }>
  > = useParams<{ id?: string; pvkdokumentId?: string }>()
  const [etterlevelseDokumentasjon, , isEtterlevelseDokumentasjonLoading] =
    useEtterlevelseDokumentasjon(params.id)
  const [pvkdokument, setPvkDokument] = usePvkDokument(params.pvkdokumentId)
  const [profilering, setProfilering] = useState<boolean | null>(false)
  const [automatiskBehandling, setAutomatiskBehandling] = useState<boolean | null>(false)
  const [saerligKategorier, setSaerligKategorier] = useState<boolean>(false)
  const [opplysningstyperMangler, setOpplysningstyperMangler] = useState<boolean>(false)
  const [checkedYtterligereEgenskaper, setCheckedYtterligereEgenskaper] = useState<string[]>([])

  const [behandlingensLivslop, setBehandlingensLivslop] = useState<IBehandlingensLivslop>()
  const breadcrumbPaths: IBreadCrumbPath[] = [
    dokumentasjonerBreadCrumbPath,
    {
      href: '/dokumentasjon/' + etterlevelseDokumentasjon?.id,
      pathName:
        'E' +
        etterlevelseDokumentasjon?.etterlevelseNummer.toString() +
        ' ' +
        etterlevelseDokumentasjon?.title,
    },
  ]

  useEffect(() => {
    ;(async () => {
      if (etterlevelseDokumentasjon) {
        await getBehandlingensLivslopByEtterlevelseDokumentId(etterlevelseDokumentasjon?.id).then(
          (response) => {
            if (response) {
              setBehandlingensLivslop(response)
            }
          }
        )
      }
    })()
  }, [etterlevelseDokumentasjon])

  useEffect(() => {
    if (etterlevelseDokumentasjon && etterlevelseDokumentasjon.behandlinger) {
      const alleOpplysningstyper: IPolicy[] = []
      const alleProfilering: any[] = []
      const alleAutomatiskBehandling: any[] = []
      etterlevelseDokumentasjon.behandlinger.forEach((behandling) => {
        if (behandling.policies) {
          if (behandling.policies.length === 0) {
            setOpplysningstyperMangler(true)
          }
          alleOpplysningstyper.push(...behandling.policies)
        }
        alleProfilering.push(behandling.profilering)
        alleAutomatiskBehandling.push(behandling.automatiskBehandling)
      })

      if (alleProfilering.includes(true)) {
        setProfilering(true)
      } else if (alleProfilering.every((v) => v === false)) {
        setProfilering(false)
      } else if (alleProfilering.includes(null)) {
        setProfilering(null)
      }

      if (alleAutomatiskBehandling.includes(true)) {
        setAutomatiskBehandling(true)
      } else if (alleAutomatiskBehandling.every((v) => v === false)) {
        setAutomatiskBehandling(false)
      } else if (alleAutomatiskBehandling.includes(null)) {
        setAutomatiskBehandling(null)
      }

      const saerligKategorierOppsumert: IExternalCode[] = uniqBy(
        alleOpplysningstyper.flatMap((opplysningstyper) => opplysningstyper.sensitivity),
        'code'
      ).filter((kategori) => kategori.code === 'SAERLIGE')

      if (saerligKategorierOppsumert.length > 0) {
        setSaerligKategorier(true)
      }
    }
  }, [etterlevelseDokumentasjon])

  useEffect(() => {
    if (pvkdokument && pvkdokument.ytterligereEgenskaper.length > 0) {
      setCheckedYtterligereEgenskaper(
        pvkdokument.ytterligereEgenskaper.map((egenskap) => egenskap.code)
      )
    }
  }, [pvkdokument])

  return (
    <PageLayout
      pageTitle="Bør vi gjøre en Personvernkonsekvensvurdering (PVK) ?"
      currentPage="Bør vi gjøre en Personvernkonsekvensvurdering (PVK) ?"
      breadcrumbPaths={breadcrumbPaths}
    >
      <Heading level="1" size="medium" className="mb-5">
        Bør vi gjøre en Personvernkonsekvensvurdering (PVK) ?
      </Heading>
      {isEtterlevelseDokumentasjonLoading && (
        <div className="flex w-full justify-center">
          <Loader size="large" />
        </div>
      )}

      {!isEtterlevelseDokumentasjonLoading && etterlevelseDokumentasjon && pvkdokument && (
        <div className="flex w-full">
          <div className="pt-6 pr-4 flex flex-1 flex-col gap-4 col-span-8">
            <PvkBehovInfoContent
              etterlevelseDokumentasjon={etterlevelseDokumentasjon}
              profilering={profilering}
              automatiskBehandling={automatiskBehandling}
              opplysningstyperMangler={opplysningstyperMangler}
              saerligKategorier={saerligKategorier}
              behandlingensLivslop={behandlingensLivslop}
            />
            {(etterlevelseDokumentasjon.hasCurrentUserAccess || user.isAdmin()) && (
              <PvkBehovForm
                pvkDokument={pvkdokument}
                setPvkDokument={setPvkDokument}
                etterlevelseDokumentasjon={etterlevelseDokumentasjon}
                profilering={profilering}
                automatiskBehandling={automatiskBehandling}
                saerligKategorier={saerligKategorier}
                checkedYtterligereEgenskaper={checkedYtterligereEgenskaper}
                setCheckedYtterligereEgenskaper={setCheckedYtterligereEgenskaper}
              />
            )}

            {!etterlevelseDokumentasjon.hasCurrentUserAccess && !user.isAdmin() && (
              <div>READ ONLY</div>
            )}
          </div>

          {etterlevelseDokumentasjon && (
            <div className="pl-4 border-l border-[#071a3636] w-full max-w-md">
              <PvkBehovMetadata etterlevelseDokumentasjon={etterlevelseDokumentasjon} />
            </div>
          )}
        </div>
      )}
    </PageLayout>
  )
}

export default PvkBehovPage
