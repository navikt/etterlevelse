'use client'

import { TKravQL } from '@/constants/krav/kravConstants'
import { UserContext } from '@/provider/user/userProvider'
import { BodyShort } from '@navikt/ds-react'
import moment from 'moment'
import { FunctionComponent, useContext } from 'react'

type TProps = {
  krav: TKravQL
  noLastModifiedDate?: boolean
}

export const KravViewModifiedDate: FunctionComponent<TProps> = ({ krav, noLastModifiedDate }) => {
  const { isAdmin, isKraveier } = useContext(UserContext)
  return (
    <>
      {!noLastModifiedDate && (
        <div>
          <BodyShort size='small'>
            Sist endret: {moment(krav.changeStamp.lastModifiedDate).format('LL')}{' '}
            {isAdmin() || isKraveier()
              ? `av ${krav.changeStamp.lastModifiedBy.split(' - ')[1]}`
              : ''}
          </BodyShort>
        </div>
      )}
    </>
  )
}
