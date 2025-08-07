import { IDomainObject } from '@/constants/commonConstants'

export interface IKravPriorityList extends IDomainObject {
  id: string
  temaId: string
  priorityList: number[]
}
