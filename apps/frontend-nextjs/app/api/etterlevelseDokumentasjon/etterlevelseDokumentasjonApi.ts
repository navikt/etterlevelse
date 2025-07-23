import { IPageResponse } from '@/constants/commonConstants'
import {
  IEtterlevelseDokumentasjon,
  TEtterlevelseDokumentasjonQL,
} from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { IVirkemiddel } from '@/constants/virkemiddel/virkemiddelConstants'
import { env } from '@/util/env/env'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { getVirkemiddel } from '../virkemiddelApi/virkemiddelApi'

export const searchEtterlevelsedokumentasjon = async (
  searchParam: string
): Promise<IEtterlevelseDokumentasjon[]> => {
  return (
    await axios.get<IPageResponse<IEtterlevelseDokumentasjon>>(
      `${env.backendBaseUrl}/etterlevelsedokumentasjon/search/${searchParam}`
    )
  ).data.content
}

export const getEtterlevelseDokumentasjon = async (id: string) => {
  return (
    await axios.get<IEtterlevelseDokumentasjon>(
      `${env.backendBaseUrl}/etterlevelsedokumentasjon/${id}`
    )
  ).data
}

export const useEtterlevelseDokumentasjon = (etterlevelseDokumentasjonId?: string) => {
  const isCreateNew = etterlevelseDokumentasjonId === 'ny'
  const [data, setData] = useState<TEtterlevelseDokumentasjonQL | undefined>(
    isCreateNew ? etterlevelseDokumentasjonMapToFormVal({}) : undefined
  )
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    let virkmiddel: any = {}

    setIsLoading(true)
    if (etterlevelseDokumentasjonId && !isCreateNew) {
      ;(async () => {
        await getEtterlevelseDokumentasjon(etterlevelseDokumentasjonId).then(
          async (etterlevelseDokumentasjon) => {
            if (etterlevelseDokumentasjon.virkemiddelId) {
              await getVirkemiddel(etterlevelseDokumentasjon.virkemiddelId).then(
                (virkemiddelResponse: IVirkemiddel) => (virkmiddel = virkemiddelResponse)
              )
            }
            setData(
              etterlevelseDokumentasjonMapToFormVal({
                ...etterlevelseDokumentasjon,
                virkemiddel: virkmiddel,
              })
            )
            setIsLoading(false)
          }
        )
      })()
    }
  }, [etterlevelseDokumentasjonId])

  return [data, setData, isLoading] as [
    TEtterlevelseDokumentasjonQL | undefined,
    (e: TEtterlevelseDokumentasjonQL) => void,
    boolean,
  ]
}

export const etterlevelseDokumentasjonMapToFormVal = (
  etterlevelseDokumentasjon: Partial<TEtterlevelseDokumentasjonQL>
): TEtterlevelseDokumentasjonQL => ({
  id: etterlevelseDokumentasjon.id || '',
  changeStamp: etterlevelseDokumentasjon.changeStamp || {
    lastModifiedDate: '',
    lastModifiedBy: '',
  },
  version: -1,
  title: etterlevelseDokumentasjon.title || '',
  beskrivelse: etterlevelseDokumentasjon.beskrivelse || '',
  gjenbrukBeskrivelse: etterlevelseDokumentasjon.gjenbrukBeskrivelse || '',
  tilgjengeligForGjenbruk: etterlevelseDokumentasjon.tilgjengeligForGjenbruk || false,
  behandlingIds: etterlevelseDokumentasjon.behandlingIds || [],
  behandlerPersonopplysninger:
    etterlevelseDokumentasjon.behandlerPersonopplysninger !== undefined
      ? etterlevelseDokumentasjon.behandlerPersonopplysninger
      : true,
  irrelevansFor: etterlevelseDokumentasjon.irrelevansFor || [],
  prioritertKravNummer: etterlevelseDokumentasjon.prioritertKravNummer || [],
  etterlevelseNummer: etterlevelseDokumentasjon.etterlevelseNummer || 0,
  teams: etterlevelseDokumentasjon.teams || [],
  resources: etterlevelseDokumentasjon.resources || [],
  risikoeiere: etterlevelseDokumentasjon.risikoeiere || [],
  nomAvdelingId: etterlevelseDokumentasjon.nomAvdelingId || '',
  avdelingNavn: etterlevelseDokumentasjon.avdelingNavn || '',
  teamsData: etterlevelseDokumentasjon.teamsData || [],
  resourcesData: etterlevelseDokumentasjon.resourcesData || [],
  risikoeiereData: etterlevelseDokumentasjon.risikoeiereData || [],
  hasCurrentUserAccess: etterlevelseDokumentasjon.hasCurrentUserAccess || false,
  behandlinger: etterlevelseDokumentasjon.behandlinger || [],
  virkemiddelId: etterlevelseDokumentasjon.virkemiddelId || '',
  // knyttetTilVirkemiddel: etterlevelseDokumentasjon.knyttetTilVirkemiddel !== undefined ? etterlevelseDokumentasjon.knyttetTilVirkemiddel : false,
  knyttetTilVirkemiddel: false,
  varslingsadresser: etterlevelseDokumentasjon.varslingsadresser || [],
  forGjenbruk: etterlevelseDokumentasjon.forGjenbruk || false,
  risikovurderinger: etterlevelseDokumentasjon.risikovurderinger || [],
  p360Recno: etterlevelseDokumentasjon.p360Recno || 0,
  p360CaseNumber: etterlevelseDokumentasjon.p360CaseNumber || '',
})
