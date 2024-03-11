import axios from 'axios'
import { useEffect, useState } from 'react'
import { IKravPriorityList, IPageResponse } from '../constants'
import { env } from '../util/env'

export const getAllKravPriorityList = async () => {
  const PAGE_SIZE = 100
  const firstPage = await getKravPriorityListPage(0, PAGE_SIZE)
  if (firstPage.pages === 1) {
    return firstPage.content.length > 0 ? [...firstPage.content] : []
  } else {
    let allKravPrioritering: IKravPriorityList[] = [...firstPage.content]
    for (let currentPage = 1; currentPage < firstPage.pages; currentPage++) {
      allKravPrioritering = [
        ...allKravPrioritering,
        ...(await getKravPriorityListPage(currentPage, PAGE_SIZE)).content,
      ]
    }
    return allKravPrioritering
  }
}

export const getKravPriorityListPage = async (pageNumber: number, pageSize: number) => {
  return (
    await axios.get<IPageResponse<IKravPriorityList>>(
      `${env.backendBaseUrl}/kravprioritylist?pageNumber=${pageNumber}&pageSize=${pageSize}`
    )
  ).data
}

export const getKravPriorityList = async (id: string) => {
  return (await axios.get<IKravPriorityList>(`${env.backendBaseUrl}/kravprioritylist/${id}`)).data
}

export const getKravPriorityListByTemaCode = async (temaCode: string) => {
  return await axios
    .get<IKravPriorityList>(`${env.backendBaseUrl}/kravprioritylist/tema/${temaCode}`)
    .then((resp) => {
      return kravPrioritingMapToFormValue(resp.data)
    })
    .catch(() => {
      return kravPrioritingMapToFormValue({})
    })
}

export const getKravPriorityListByKravNummerAndTemaCode = async (
  temaCode: string,
  kravNummer: number
) => {
  return await axios.get<IPageResponse<IKravPriorityList>>(
    `${env.backendBaseUrl}/kravprioritylist/tema/${temaCode}/${kravNummer}`
  )
}

export const createKravPriorityList = async (kravPrioritering: IKravPriorityList) => {
  const dto = kravPrioriteringToDto(kravPrioritering)
  return (await axios.post<IKravPriorityList>(`${env.backendBaseUrl}/kravprioritylist`, dto)).data
}

export const updateKravPriorityList = async (kravPrioritering: IKravPriorityList) => {
  const dto = kravPrioriteringToDto(kravPrioritering)
  return (
    await axios.put<IKravPriorityList>(
      `${env.backendBaseUrl}/kravprioritylist/${kravPrioritering.id}`,
      dto
    )
  ).data
}

export const useKravPriorityList = (temaCode: string) => {
  const [data, setData] = useState(kravPrioritingMapToFormValue({}))
  const [loading, setLoading] = useState(false)

  const fetchData = () => {
    setLoading(true)
    getKravPriorityListByTemaCode(temaCode).then((response: IKravPriorityList | undefined) => {
      if (response) {
        setData(response)
      }
    })
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [temaCode])

  return [data, loading, fetchData] as [IKravPriorityList, boolean, () => void]
}

function kravPrioriteringToDto(kravPrioriteringToDto: IKravPriorityList): IKravPriorityList {
  const dto = {
    ...kravPrioriteringToDto,
  } as any
  delete dto.changeStamp
  delete dto.version
  return dto
}

export const kravPrioritingMapToFormValue = (
  kravprioritylist: Partial<IKravPriorityList>
): IKravPriorityList => ({
  id: kravprioritylist.id || '',
  temaId: kravprioritylist.temaId || '',
  priorityList: kravprioritylist.priorityList || [],
  changeStamp: kravprioritylist.changeStamp || { lastModifiedDate: '', lastModifiedBy: '' },
  version: -1,
})
