'use client'

import { IKravVersjon, TKravViewInfoProps } from '@/constants/krav/kravConstants'
import { UserContext } from '@/provider/user/userProvider'
import { BodyShort } from '@navikt/ds-react'
import moment from 'moment'
import { FunctionComponent, useContext } from 'react'
import { KravViewAnsvarlig } from './kravViewAnsvarlig/kravViewAnsvarlig'
import { KravViewBegreper } from './kravViewBegreper/kravViewBegreper'
import { KravViewDokumentasjon } from './kravViewDokumentasjon/kravViewDokumentasjon'
import { KravViewErRelevantFor } from './kravViewErRelevantFor/kravViewErRelevantFor'
import { KravViewRegelverk } from './kravViewRegelverk/kravViewRegelverk'
import { KravViewRelasjonerTilAndreKrav } from './kravViewRelasjonerTilAndreKrav/kravViewRelasjonerTilAndreKrav'
import { KravViewTidligereVersjoner } from './kravViewTidligereVersjoner/kravViewTidligereVersjoner'
import { KravViewVarslingsadresser } from './kravViewVarslingsadresser/kravViewVarslingsadresser'

interface IProps extends TKravViewInfoProps {
  alleKravVersjoner: IKravVersjon[]
  noLastModifiedDate?: boolean
}

export const KravViewInfo: FunctionComponent<IProps> = ({
  krav,
  alleKravVersjoner,
  noLastModifiedDate,
}) => {
  const { isAdmin, isKraveier } = useContext(UserContext)

  return (
    <div>
      <KravViewDokumentasjon krav={krav} />

      <KravViewBegreper krav={krav} />

      <KravViewRelasjonerTilAndreKrav krav={krav} />

      <KravViewErRelevantFor krav={krav} />

      <KravViewTidligereVersjoner alleKravVersjoner={alleKravVersjoner} krav={krav} />

      <KravViewRegelverk krav={krav} />

      <KravViewAnsvarlig krav={krav} />

      <KravViewVarslingsadresser krav={krav} />

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
    </div>
  )
}
