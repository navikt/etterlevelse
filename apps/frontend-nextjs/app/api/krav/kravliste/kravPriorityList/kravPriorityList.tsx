import {
  getKravPriorityListByTemaCode,
  kravPrioritingMapToFormValue,
} from '@/api/kravPriorityList/kravPriorityListApi'
import { IKravPriorityList } from '@/constants/krav/kravPriorityList/kravPriorityListConstants'
import { env } from '@/util/env/env'
import axios from 'axios'
import { useEffect, useState } from 'react'

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
