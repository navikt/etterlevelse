import axios from 'axios'
import {Behandling, BehandlingEtterlevData, emptyPage, GraphQLResponse, PageResponse} from '../constants'
import {env} from '../util/env'
import {useSearch} from '../util/hooks'
import {useEffect, useState} from 'react'
import {user} from '../services/User'
import {DocumentNode} from 'graphql'

export const getBehandling = async (id: string) => {
  return (await axios.get<Behandling>(`${env.backendBaseUrl}/behandling/${id}`)).data
}

export const getBehandlinger = async () => {
  return (await axios.get<PageResponse<Behandling>>(`${env.backendBaseUrl}/behandling?myBehandlinger=true`)).data.content
}

export const searchBehandling = async (name: string) => {
  return (await axios.get<PageResponse<Behandling>>(`${env.backendBaseUrl}/behandling/search/${name}`)).data.content
}

export const updateBehandling = async (behandling: BehandlingEtterlevData) => {
  const dto = {id: behandling.id, relevansFor: behandling.relevansFor.map(c => c.code)}
  return (await axios.put<Behandling>(`${env.backendBaseUrl}/behandling/${behandling.id}`, dto)).data
}

export const useBehandling = (id?: string) => {
  const [data, setData] = useState<Behandling | undefined>(undefined)

  useEffect(() => {
    id && getBehandling(id).then(setData).catch(e => {
      setData(undefined)
      console.log('couldn\'t find behandling', e)
    })
  }, [id])

  return [data, setData] as [Behandling | undefined, (k: Behandling | undefined) => void]
}

export const behandlingName = (k?: Behandling) => k ? k.overordnetFormaal.shortName + ' - ' + k.navn : ''
export const useSearchBehandling = () => useSearch(searchBehandling)

export const useMyBehandlinger = () => {
  const [data, setData] = useState<Behandling []>([])
  const ident = user.getIdent()

  useEffect(() => {
    ident && getBehandlinger().then(setData).catch(e => {
      setData([])
      console.log('couldn\'t find behandlinger', e)
    })
  }, [ident])

  return data
}

export const mapToFormVal = (behandling: Partial<Behandling> & {id: string}): BehandlingEtterlevData => {
  return {
    id: behandling.id,
    relevansFor: behandling.relevansFor || []
  }
}

// GraphQL

export type BehandlingFilters = {
  relevans?: string[]
}
export type Page = {pageNumber?: number, pageSize?: number}

export const getBehandlingGql = async (variables: BehandlingFilters & Page, query: string) => {
  return (await axios.post<GraphQLResponse<{behandling: PageResponse<Behandling>}>>(`${env.backendBaseUrl}/graphql`, {
    query,
    variables
  })).data.data.behandling
}

export const useBehandlingFilter = (filter: BehandlingFilters & Page, query: DocumentNode) => {
  const values = Object.values(filter)
  const filterActive = !!values.find(v => Array.isArray(v) ? !!v.length : !!v)

  const [data, setData] = useState<PageResponse<Behandling>>(emptyPage)
  const [loading, setLoading] = useState(filterActive)

  useEffect(() => {
    if (filterActive) {
      setLoading(true)
      setData(emptyPage)
      getBehandlingGql(filter, query.loc?.source.body!).then(r => {
        setData(r);
        setLoading(false)
      })
    }
  }, [filter.relevans, filter.pageNumber, filter.pageSize])

  return [data, loading] as [PageResponse<Behandling>, boolean]
}
