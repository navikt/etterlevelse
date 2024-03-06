import axios from 'axios'
import { useEffect, useState } from 'react'
import { IPageResponse, IVirkemiddel } from '../constants'
import { env } from '../util/env'

export const getAllVirkemiddel = async () => {
  const PAGE_SIZE = 100
  const firstPage = await getVirkemiddelPage(0, PAGE_SIZE)
  if (firstPage.pages === 1) {
    return firstPage.content.length > 0 ? [...firstPage.content] : []
  } else {
    let allVirkemiddel: IVirkemiddel[] = [...firstPage.content]
    for (let currentPage = 1; currentPage < firstPage.pages; currentPage++) {
      allVirkemiddel = [
        ...allVirkemiddel,
        ...(await getVirkemiddelPage(currentPage, PAGE_SIZE)).content,
      ]
    }
    return allVirkemiddel
  }
}

export const getVirkemiddelPage = async (pageNumber: number, pageSize: number) => {
  return (
    await axios.get<IPageResponse<IVirkemiddel>>(
      `${env.backendBaseUrl}/virkemiddel?pageNumber=${pageNumber}&pageSize=${pageSize}`
    )
  ).data
}

export const getVirkemiddel = async (id: string) => {
  return (await axios.get<IVirkemiddel>(`${env.backendBaseUrl}/virkemiddel/${id}`)).data
}

export const deleteVirkemiddel = async (id: string) => {
  return (await axios.delete<IVirkemiddel>(`${env.backendBaseUrl}/virkemiddel/${id}`)).data
}

export const createVirkemiddel = async (virkemiddel: IVirkemiddel) => {
  const dto = virkemiddelToVirkemiddelDto(virkemiddel)
  return (await axios.post<IVirkemiddel>(`${env.backendBaseUrl}/virkemiddel`, dto)).data
}

export const updateVirkemiddel = async (virkemiddel: IVirkemiddel) => {
  const dto = virkemiddelToVirkemiddelDto(virkemiddel)
  return (await axios.put<IVirkemiddel>(`${env.backendBaseUrl}/virkemiddel/${virkemiddel.id}`, dto))
    .data
}

export const useVirkemiddelFilter = () => {
  const [data, setData] = useState<IVirkemiddel[]>([])
  const [totalDataLength, setTotalDataLenght] = useState<number>(0)
  const [virkemiddelTypeFilter, setVirkemiddelTypeFilter] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [refetch, setRefetch] = useState<boolean>(false)

  const refetchData = () => {
    setRefetch(!refetch)
  }

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      let allVirkemiddel = await getAllVirkemiddel()
      setTotalDataLenght(allVirkemiddel.length)

      if (virkemiddelTypeFilter && virkemiddelTypeFilter !== 'alle') {
        allVirkemiddel = allVirkemiddel.filter(
          (v) => v.virkemiddelType?.code === virkemiddelTypeFilter
        )
      }

      setData(allVirkemiddel)
      setLoading(false)
    })()
  }, [virkemiddelTypeFilter, refetch])

  return [data, totalDataLength, setVirkemiddelTypeFilter, loading, refetchData] as [
    IVirkemiddel[],
    number,
    React.Dispatch<React.SetStateAction<string>>,
    boolean,
    () => void,
  ]
}

export const virkemiddelToVirkemiddelDto = (virkemiddel: IVirkemiddel): IVirkemiddel => {
  const dto = {
    ...virkemiddel,
    regelverk: virkemiddel.regelverk.map((regelverk) => ({
      ...regelverk,
      lov: regelverk.lov.code,
    })),
  } as any
  delete dto.changeStamp
  delete dto.version
  return dto
}

export const virkemiddelMapToFormVal = (virkemiddel: Partial<IVirkemiddel>): IVirkemiddel => {
  return {
    id: virkemiddel.id || '',
    navn: virkemiddel.navn || '',
    changeStamp: virkemiddel.changeStamp || { lastModifiedDate: '', lastModifiedBy: '' },
    version: -1,
    regelverk: virkemiddel.regelverk || [],
    virkemiddelType: virkemiddel.virkemiddelType?.code,
    livsSituasjon: virkemiddel.livsSituasjon || '',
  } as IVirkemiddel
}
