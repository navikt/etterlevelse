import { ExternalLink } from '@/components/common/externalLink/externalLink'
import { LabelAboveContent } from '@/components/common/labelAboveContent/labelAboveContent'
import { LabelWrapper } from '@/components/common/labelWrapper/labelWrapper'
import { IKravVersjon, TKravViewProps } from '@/constants/krav/kravConstants'
import { EAdresseType } from '@/constants/teamkatalogen/varslingsadresse/varslingsadresseConstants'
import { user } from '@/services/user/userService'
import { slackLink, slackUserLink } from '@/util/config/config'
import { BodyShort } from '@navikt/ds-react'
import moment from 'moment'
import { FunctionComponent } from 'react'
import { KravViewBegreper } from './kravViewBegreper/kravViewBegreper'
import { KravViewDokumentasjon } from './kravViewDokumentasjon/kravViewDokumentasjon'
import { KravViewErRelevantFor } from './kravViewErRelevantFor/kravViewErRelevantFor'
import { KravViewRegelverk } from './kravViewRegelverk/kravViewRegelverk'
import { KravViewRelasjonerTilAndreKrav } from './kravViewRelasjonerTilAndreKrav/kravViewRelasjonerTilAndreKrav'
import { KravViewTidligereVersjoner } from './kravViewTidligereVersjoner/kravViewTidligereVersjoner'

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

    <LabelWrapper>
      <LabelAboveContent header={header} title='Ansvarlig'>
        {krav.underavdeling?.shortName}
      </LabelAboveContent>
    </LabelWrapper>

    <LabelWrapper>
      <LabelAboveContent header={header} title='Varslingsadresser'>
        {krav.varslingsadresserQl.map((varslingsaddresse, index) => {
          if (varslingsaddresse.type === EAdresseType.SLACK)
            return (
              <div className='flex mb-2' key={'kravVarsling_list_SLACK_' + index}>
                <div className='mr-1'>Slack:</div>
                <ExternalLink href={slackLink(varslingsaddresse.adresse)}>{`#${
                  varslingsaddresse.slackChannel?.name || varslingsaddresse.adresse
                }`}</ExternalLink>
              </div>
            )
          if (varslingsaddresse.type === EAdresseType.SLACK_USER)
            return (
              <div className='flex mb-2' key={`kravVarsling_list_SLACK_USER_${index}`}>
                <div className='mr-1'>Slack:</div>
                <ExternalLink href={slackUserLink(varslingsaddresse.adresse)}>{`${
                  varslingsaddresse.slackUser?.name || varslingsaddresse.adresse
                }`}</ExternalLink>
              </div>
            )
          return (
            <div className='flex mb-2' key={`kravVarsling_list_EMAIL_${index}`}>
              <div className='mr-1'>Epost:</div>
              <ExternalLink href={`mailto:${varslingsaddresse.adresse}`} openOnSamePage>
                {varslingsaddresse.adresse}
              </ExternalLink>
            </div>
          )
        })}
      </LabelAboveContent>
    </LabelWrapper>

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
