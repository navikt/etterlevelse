'use client'

import { ISuksesskriterie, TKravQL } from '@/constants/krav/kravConstants'
import { UserContext } from '@/provider/user/userProvider'
import { BodyShort } from '@navikt/ds-react'
import moment from 'moment'
import { FunctionComponent, useContext } from 'react'
import { SuksesskriterieCard } from '../../../../../suksesskriterieCard/suksesskriterieCard'

type TProps = { krav: TKravQL }

export const KravView: FunctionComponent<TProps> = ({ krav }) => {
  const user = useContext(UserContext)

  return (
    <div>
      <div className='w-full'>
        {krav.suksesskriterier.map((suksesskriterium: ISuksesskriterie, index: number) => (
          <SuksesskriterieCard
            key={suksesskriterium.id}
            suksesskriterie={suksesskriterium}
            number={index + 1}
            totalt={krav.suksesskriterier.length}
          />
        ))}
        {/* {<KravViewInfo krav={krav} alleKravVersjoner={alleKravVersjoner} />} */}

        <BodyShort size='small' className='mt-6'>
          Sist endret: {moment(krav.changeStamp.lastModifiedDate).format('LL')}{' '}
          {user.isAdmin() || user.isKraveier()
            ? 'av ' + krav.changeStamp.lastModifiedBy.split(' - ')[1]
            : ''}
        </BodyShort>
      </div>
    </div>
  )
}
