import axios from 'axios'
import { useEffect, useState } from 'react'
import {
  IEtterlevelseDokumentasjon,
  IEtterlevelseDokumentasjonWithRelation,
  IPageResponse,
  TEtterlevelseDokumentasjonQL,
} from '../constants'
import { env } from '../util/env'
import { getVirkemiddel } from './VirkemiddelApi'

export const etterlevelseDokumentasjonName = (
  etterlevelseDokumentasjon?: IEtterlevelseDokumentasjon
) =>
  etterlevelseDokumentasjon
    ? 'E' + etterlevelseDokumentasjon.etterlevelseNummer + ' ' + etterlevelseDokumentasjon.title
    : ''

export const getEtterlevelseDokumentasjon = async (id: string) => {
  return (
    await axios.get<IEtterlevelseDokumentasjon>(
      `${env.backendBaseUrl}/etterlevelsedokumentasjon/${id}`
    )
  ).data
}

export const searchEtterlevelsedokumentasjon = async (searchParam: string) => {
  return (
    await axios.get<IPageResponse<IEtterlevelseDokumentasjon>>(
      `${env.backendBaseUrl}/etterlevelsedokumentasjon/search/${searchParam}`
    )
  ).data.content
}

export const searchEtterlevelsedokumentasjonByBehandlingId = async (behandlingId: string) => {
  return (
    await axios.get<IPageResponse<IEtterlevelseDokumentasjon>>(
      `${env.backendBaseUrl}/etterlevelsedokumentasjon/search/behandling/${behandlingId}`
    )
  ).data.content
}

export const updateEtterlevelseDokumentasjon = async (
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
) => {
  const dto = etterlevelseDokumentasjonToDomainToObject(etterlevelseDokumentasjon)
  return (
    await axios.put<IEtterlevelseDokumentasjon>(
      `${env.backendBaseUrl}/etterlevelsedokumentasjon/${etterlevelseDokumentasjon.id}`,
      dto
    )
  ).data
}

export const createEtterlevelseDokumentasjon = async (
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
) => {
  const dto = etterlevelseDokumentasjonToDomainToObject(etterlevelseDokumentasjon)
  return (
    await axios.post<IEtterlevelseDokumentasjon>(
      `${env.backendBaseUrl}/etterlevelsedokumentasjon`,
      dto
    )
  ).data
}

export const createEtterlevelseDokumentasjonWithRelataion = async (
  fromDocumentId: string,
  etterlevelseDokumentasjon: IEtterlevelseDokumentasjonWithRelation
) => {
  const dto = etterlevelseDokumentasjonToDomainToObject(etterlevelseDokumentasjon)
  return (
    await axios.post<IEtterlevelseDokumentasjon>(
      `${env.backendBaseUrl}/etterlevelsedokumentasjon/relation/${fromDocumentId}`,
      dto
    )
  ).data
}

export const deleteEtterlevelseDokumentasjon = async (etterlevelseDokumentasjonId: string) => {
  return (
    await axios.delete<IEtterlevelseDokumentasjon>(
      `${env.backendBaseUrl}/etterlevelsedokumentasjon/${etterlevelseDokumentasjonId}`
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
                (virkemiddelResponse) => (virkmiddel = virkemiddelResponse)
              )
            }
            setData({
              ...etterlevelseDokumentasjon,
              virkemiddel: virkmiddel,
            })
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

export const etterlevelseDokumentasjonToDomainToObject = (
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
): IEtterlevelseDokumentasjon => {
  const domainToObject = {
    ...etterlevelseDokumentasjon,
    behandlingIds: etterlevelseDokumentasjon.behandlinger
      ? etterlevelseDokumentasjon.behandlinger.map((behandling) => behandling.id)
      : [],
    irrelevansFor: etterlevelseDokumentasjon.irrelevansFor.map((irrelevans) => irrelevans.code),
    teams: etterlevelseDokumentasjon.teamsData
      ? etterlevelseDokumentasjon.teamsData.map((team) => team.id)
      : [],
    avdeling: etterlevelseDokumentasjon.avdeling?.code,
    resources: etterlevelseDokumentasjon.resourcesData
      ? etterlevelseDokumentasjon.resourcesData.map((resource) => resource.navIdent)
      : [],
    risikoeiere: etterlevelseDokumentasjon.risikoeiereData
      ? etterlevelseDokumentasjon.risikoeiereData.map((resource) => resource.navIdent)
      : [],
  } as any
  delete domainToObject.changeStamp
  delete domainToObject.version
  delete domainToObject.teamsData
  delete domainToObject.resourcesData
  delete domainToObject.behandlinger
  return domainToObject
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
  avdeling: etterlevelseDokumentasjon.avdeling,
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
})

export const etterlevelseDokumentasjonWithRelationMapToFormVal = (
  etterlevelseDokumentasjon: Partial<IEtterlevelseDokumentasjonWithRelation>
): IEtterlevelseDokumentasjonWithRelation => {
  const etterlevelseDokumentasjonWithOutRelation =
    etterlevelseDokumentasjonMapToFormVal(etterlevelseDokumentasjon)

  return {
    ...etterlevelseDokumentasjonWithOutRelation,
    relationType: etterlevelseDokumentasjon.relationType,
  }
}

//graphql
