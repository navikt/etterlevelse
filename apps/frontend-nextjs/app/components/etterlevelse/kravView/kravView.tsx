import { ExternalLink } from '@/components/common/externalLink/externalLink'
import { LabelAboveContent } from '@/components/common/labelAboveContent/labelAboveContent'
import { LabelWrapper } from '@/components/common/labelWrapper/labelWrapper'
import { LovViewList } from '@/components/lov/lov'
import { IKravVersjon, TKravViewProps } from '@/constants/krav/kravConstants'
import { EAdresseType } from '@/constants/teamkatalogen/varslingsadresse/varslingsadresseConstants'
import { user } from '@/services/user/userService'
import { slackLink, slackUserLink } from '@/util/config/config'
import { BodyShort } from '@navikt/ds-react'
import moment from 'moment'
import { FunctionComponent } from 'react'
import { KravBegreper } from './kravBegreper/kravBegreper'
import { KravDokumentasjon } from './kravDokumentasjon/kravDokumentasjon'
import { KravErRelevantFor } from './kravErRelevantFor/kravErRelevantFor'
import { KravRelasjonerTilAndreKrav } from './kravRelasjonerTilAndreKrav/kravRelasjonerTilAndreKrav'
import { KravTidligereVersjoner } from './kravTidligereVersjoner/kravTidligereVersjoner'

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
    <KravDokumentasjon krav={krav} header={header} />

    <KravBegreper krav={krav} header={header} />

    <KravRelasjonerTilAndreKrav krav={krav} header={header} />

    <KravErRelevantFor krav={krav} header={header} />

    <KravTidligereVersjoner alleKravVersjoner={alleKravVersjoner} header={header} krav={krav} />

    {krav.regelverk.length && (
      <LabelWrapper>
        <LabelAboveContent header={header} title='Regelverk'>
          <LovViewList regelverkListe={krav.regelverk} />
        </LabelAboveContent>
      </LabelWrapper>
    )}

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
