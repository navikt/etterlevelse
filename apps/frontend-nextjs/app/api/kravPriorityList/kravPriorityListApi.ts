import { IPageResponse } from '@/constants/commonConstants'
import { IKravPriorityList } from '@/constants/krav/kravPriorityList/kravPriorityListConstants'
import { env } from '@/util/env/env'
import axios from 'axios'

export const getKravPriorityListPage = async (pageNumber: number, pageSize: number) => {
  return (
    await axios.get<IPageResponse<IKravPriorityList>>(
      `${env.backendBaseUrl}/kravprioritylist?pageNumber=${pageNumber}&pageSize=${pageSize}`
    )
  ).data
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

export const kravPrioritingMapToFormValue = (
  kravprioritylist: Partial<IKravPriorityList>
): IKravPriorityList => ({
  id: kravprioritylist.id || '',
  temaId: kravprioritylist.temaId || '',
  priorityList: kravprioritylist.priorityList || [],
  changeStamp: kravprioritylist.changeStamp || { lastModifiedDate: '', lastModifiedBy: '' },
  version: -1,
})

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
