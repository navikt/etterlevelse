import { TKravQL } from '@/constants/krav/kravConstants'
import { user } from '@/services/user/userService'
import { BodyShort } from '@navikt/ds-react'
import moment from 'moment'
import { FunctionComponent } from 'react'

type TProps = {
  krav: TKravQL
  noLastModifiedDate?: boolean
}

export const KravViewModifiedDate: FunctionComponent<TProps> = ({ krav, noLastModifiedDate }) => (
  <>
    {!noLastModifiedDate && (
      <div>
        <BodyShort size='small'>
          Sist endret: {moment(krav.changeStamp.lastModifiedDate).format('LL')}{' '}
          {user.isAdmin() || user.isKraveier()
            ? `av ${krav.changeStamp.lastModifiedBy.split(' - ')[1]}`
            : ''}
        </BodyShort>
      </div>
    )}
  </>
)
