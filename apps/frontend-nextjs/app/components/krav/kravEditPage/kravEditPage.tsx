'use client'

import { GetKravData, IKravDataProps, TKravById } from '@/api/krav/kravEdit/kravEditApi'
import { EKravStatus, TKravQL } from '@/constants/krav/kravConstants'
import { user } from '@/services/user/userService'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { KravEdit } from './kravEdit/kravEdit'
import { KravEditUtgattKrav } from './kravEditUtgattKrav/kravEditUtgattKrav'

export const KravEditPage = () => {
  const params = useParams()
  const [krav, setKrav] = useState<TKravQL | undefined>()

  const kravData: IKravDataProps | undefined = GetKravData(params)
  const kravQuery: TKravById | undefined = kravData?.kravQuery

  useEffect(() => {
    if (kravQuery?.kravById) {
      setKrav(kravQuery.kravById)

      //  setIsEditingUtgaattKrav(kravQuery.kravById.status === EKravStatus.UTGAATT ? true : false)
    }
  }, [kravQuery])

  return (
    <>
      {krav && krav.status === EKravStatus.UTGAATT && !user.isAdmin() && (
        <KravEditUtgattKrav krav={krav} />
      )}
      {(krav && krav.status !== EKravStatus.UTGAATT) ||
        (user.isAdmin() && <KravEdit krav={krav} kravData={kravData} />)}
    </>
  )
}
