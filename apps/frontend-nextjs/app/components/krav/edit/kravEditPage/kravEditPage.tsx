'use client'

import { GetKravData } from '@/api/krav/edit/kravEditApi'
import { getKravByKravNummer } from '@/api/krav/kravApi'
import { CenteredLoader } from '@/components/common/centeredLoader/centeredLoader'
import { IPageResponse } from '@/constants/commonConstants'
import { IKravDataProps, TKravById } from '@/constants/krav/edit/kravEditConstant'
import { EKravStatus, IKrav, IKravVersjon, TKravQL } from '@/constants/krav/kravConstants'
import { UserContext } from '@/provider/user/userProvider'
import { Alert } from '@navikt/ds-react'
import { Params } from 'next/dist/server/request/params'
import { useParams } from 'next/navigation'
import { useContext, useEffect, useState } from 'react'
import { EditUtgattKravAlert } from './EditUtgattKravAlert'
import { KravEdit } from './kravEdit/kravEdit'

export const KravEditPage = () => {
  const params: Params = useParams()
  const user = useContext(UserContext)
  const kravData: IKravDataProps | undefined = GetKravData(params)

  const kravQuery: TKravById | undefined = kravData?.kravQuery
  const kravLoading: boolean | undefined = kravData?.kravLoading

  const [krav, setKrav] = useState<TKravQL | undefined>()
  const [alleKravVersjoner, setAlleKravVersjoner] = useState<IKravVersjon[]>([
    { kravNummer: 0, kravVersjon: 0, kravStatus: 'Utkast' },
  ])
  const [isEditingUtgaattKrav, setIsEditingUtgaattKrav] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    if (krav) {
      getKravByKravNummer(krav.kravNummer).then((response: IPageResponse<IKrav>) => {
        if (response.content.length) {
          const alleVersjoner: IKravVersjon[] = response.content
            .map((krav: IKrav) => {
              return {
                kravVersjon: krav.kravVersjon,
                kravNummer: krav.kravNummer,
                kravStatus: krav.status,
              }
            })
            .sort((a: IKravVersjon, b: IKravVersjon) => (a.kravVersjon > b.kravVersjon ? -1 : 1))

          const filteredVersjoner = alleVersjoner.filter(
            (krav: IKravVersjon) => krav.kravStatus !== EKravStatus.UTKAST
          )

          if (filteredVersjoner.length) {
            setAlleKravVersjoner(filteredVersjoner)
          }
        }
      })
    }
  }, [krav])

  useEffect(() => {
    if (!kravLoading && kravQuery?.kravById) {
      setKrav(kravQuery.kravById)
      setLoading(false)

      setIsEditingUtgaattKrav(kravQuery.kravById.status === EKravStatus.UTGAATT ? true : false)
    }
  }, [kravQuery])

  return (
    <>
      {loading && <CenteredLoader />}
      {!loading && (
        <>
          {!krav && (
            <div className='flex w-full items-left my-6 pl-6'>
              <Alert variant='error'>Error - Ingen tilgjengelig krav.</Alert>
            </div>
          )}
          {krav && (
            <>
              {krav.status === EKravStatus.UTGAATT && !user.isAdmin() && (
                <EditUtgattKravAlert krav={krav} />
              )}
              {(krav.status !== EKravStatus.UTGAATT || user.isAdmin()) && (
                <KravEdit
                  krav={krav}
                  alleKravVersjoner={alleKravVersjoner}
                  isEditingUtgaattKrav={isEditingUtgaattKrav}
                />
              )}
            </>
          )}
        </>
      )}
    </>
  )
}
