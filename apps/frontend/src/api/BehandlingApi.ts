import axios from 'axios'
import { Behandling, PageResponse } from '../constants'
import { env } from '../util/env'
import { useSearch } from '../util/hooks'
import { useEffect, useState } from 'react'
import { updateBehandlingNameWithNumber } from '../components/etterlevelseDokumentasjon/common/utils'

export const getBehandling = async (id: string) => {
  return (await axios.get<Behandling>(`${env.backendBaseUrl}/behandling/${id}`)).data
}

export const getBehandlinger = async () => {
  return (await axios.get<PageResponse<Behandling>>(`${env.backendBaseUrl}/behandling?myBehandlinger=true`)).data.content
}

export const searchBehandling = async (name: string) => {
  return (await axios.get<PageResponse<Behandling>>(`${env.backendBaseUrl}/behandling/search/${name}`)).data.content
}

export const useBehandling = (id?: string) => {
  const [data, setData] = useState<Behandling | undefined>(undefined)

  useEffect(() => {
    id &&
      getBehandling(id)
        .then(setData)
        .catch((e) => {
          setData(undefined)
          console.log("couldn't find behandling", e)
        })
  }, [id])

  return [data, setData] as [Behandling | undefined, (behandling: Behandling | undefined) => void]
}

export const behandlingName = (behandling?: Behandling) => {
  let behandlingName = ''

  if (behandling) {
    if (behandling.nummer) {
      behandlingName += 'B' + behandling.nummer + ' '
    }
    if (behandling.overordnetFormaal && behandling.overordnetFormaal.shortName) {
      behandlingName += behandling.overordnetFormaal.shortName + ': '
    }
    if (behandling.navn) {
      behandlingName += behandling.navn
    }
  }

  return behandlingName
}
export const useSearchBehandling = () => useSearch(searchBehandling)

export const searchBehandlingOptions = async (searchParam: string) => {
  if (searchParam && searchParam.length > 2) {
    const behandlinger = await searchBehandling(searchParam)
    if(behandlinger && behandlinger.length) {
      return behandlinger.map((b) => {
        return {value: b.id, label: 'B' + b.nummer + ' ' + b.overordnetFormaal.shortName + ': ' + b.navn, ...b}
      })
    }
  }
  return []
}
