import { IDomainObject } from '@/constants/commonConstants'

export interface IKravPriorityList extends IDomainObject {
  kravId: string
  temaId: string
  priorityList: number[]
}
