import axios from "axios";
import {emptyPage, Krav, PageResponse} from '../constants'
import {env} from '../util/env'
import {useEffect, useState} from 'react'

export const getKravPage = async (pageNumber: number, pageSize: number) => {
  return (await axios.get<PageResponse<Krav>>(`${env.backendBaseUrl}/krav?pageNumber=${pageNumber}&pageSize=${pageSize}`)).data
}

export const getKrav = async (id: string) => {
  return (await axios.get<Krav>(`${env.backendBaseUrl}/krav/${id}`)).data
}

export const useKravPage = (pageSize: number) => {
  const [data, setData] = useState<PageResponse<Krav>>(emptyPage)
  const [page, setPage] = useState<number>(0)

  useEffect(() => {
    getKravPage(page, pageSize).then(setData)
  }, [page, pageSize])

  const prevPage = () => setPage(Math.max(0, page - 1))
  const nextPage = () => setPage(Math.min(data?.pages ? data.pages - 1 : 0, page + 1))

  return [data, prevPage, nextPage] as [PageResponse<Krav>, () => void, () => void]
}

export const useKrav = (id: string) => {
  const [data, setData] = useState<Krav>()

  useEffect(() => {
    getKrav(id).then(setData)
  }, [id])

  return data
}
