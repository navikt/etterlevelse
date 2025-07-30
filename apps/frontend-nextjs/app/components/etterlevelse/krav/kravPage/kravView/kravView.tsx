import { SuksesskriterieCard } from '@/components/etterlevelse/suksesskriterieCard/suksesskriterieCard'
import { ISuksesskriterie, TKravQL } from '@/constants/krav/kravConstants'
import { user } from '@/services/user/userService'
import { BodyShort } from '@navikt/ds-react'
import moment from 'moment'
import { FunctionComponent } from 'react'

type TProps = {
  krav: TKravQL
}

export const KravView: FunctionComponent<TProps> = ({ krav }) => (
  <div>
    <div className='w-full'>
      {krav.suksesskriterier.map((suksesskriterium: ISuksesskriterie, index: number) => (
        <SuksesskriterieCard
          key={suksesskriterium.id}
          suksesskriterie={suksesskriterium}
          num={index + 1}
          totalt={krav.suksesskriterier.length}
        />
      ))}
      {/* {<AllInfo krav={krav} alleKravVersjoner={alleKravVersjoner} />} */}

      <BodyShort size='small' className='mt-6'>
        Sist endret: {moment(krav.changeStamp.lastModifiedDate).format('LL')}{' '}
        {user.isAdmin() || user.isKraveier()
          ? `av ${krav.changeStamp.lastModifiedBy.split(' - ')[1]}`
          : ''}
      </BodyShort>
    </div>
  </div>
)
