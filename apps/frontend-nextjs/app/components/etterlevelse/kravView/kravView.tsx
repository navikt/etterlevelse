import { IKravVersjon, TKravViewProps } from '@/constants/krav/kravConstants'
import { user } from '@/services/user/userService'
import { BodyShort } from '@navikt/ds-react'
import moment from 'moment'
import { FunctionComponent } from 'react'
import { KravViewAnsvarlig } from './kravViewAnsvarlig/kravViewAnsvarlig'
import { KravViewBegreper } from './kravViewBegreper/kravViewBegreper'
import { KravViewDokumentasjon } from './kravViewDokumentasjon/kravViewDokumentasjon'
import { KravViewErRelevantFor } from './kravViewErRelevantFor/kravViewErRelevantFor'
import { KravViewRegelverk } from './kravViewRegelverk/kravViewRegelverk'
import { KravViewRelasjonerTilAndreKrav } from './kravViewRelasjonerTilAndreKrav/kravViewRelasjonerTilAndreKrav'
import { KravViewTidligereVersjoner } from './kravViewTidligereVersjoner/kravViewTidligereVersjoner'
import { KravViewVarslingsadresser } from './kravViewVarslingsadresser/kravViewVarslingsadresser'

interface IProps extends TKravViewProps {
  alleKravVersjoner: IKravVersjon[]
  noLastModifiedDate?: boolean
}

export const KravView: FunctionComponent<IProps> = ({
  krav,
  alleKravVersjoner,
  noLastModifiedDate,
  header,
}) => (
  <div>
    <KravViewDokumentasjon krav={krav} header={header} />

    <KravViewBegreper krav={krav} header={header} />

    <KravViewRelasjonerTilAndreKrav krav={krav} header={header} />

    <KravViewErRelevantFor krav={krav} header={header} />

    <KravViewTidligereVersjoner alleKravVersjoner={alleKravVersjoner} header={header} krav={krav} />

    <KravViewRegelverk header={header} krav={krav} />

    <KravViewAnsvarlig header={header} krav={krav} />

    <KravViewVarslingsadresser header={header} krav={krav} />

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
  </div>
)
