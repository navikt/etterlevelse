import { IKravPriorityList } from '@/constants/krav/kravPriorityList/kravPriorityListConstants'
import { env } from '@/util/env/env'
import axios from 'axios'

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
  kravId: kravprioritylist.kravId || '',
  temaId: kravprioritylist.temaId || '',
  priorityList: kravprioritylist.priorityList || [],
  changeStamp: kravprioritylist.changeStamp || { lastModifiedDate: '', lastModifiedBy: '' },
  version: -1,
})
