import { ExternalLink } from '@/components/common/externalLink/externalLink'
import { LabelAboveContent } from '@/components/common/labelAboveContent/labelAboveContent'
import { LabelWrapper } from '@/components/common/labelWrapper/labelWrapper'
import { TKravViewProps } from '@/constants/krav/kravConstants'
import {
  EAdresseType,
  TVarslingsadresseQL,
} from '@/constants/teamkatalogen/varslingsadresse/varslingsadresseConstants'
import { slackLink, slackUserLink } from '@/util/config/config'
import { FunctionComponent } from 'react'

export const KravViewVarslingsadresser: FunctionComponent<TKravViewProps> = ({ header, krav }) => (
  <LabelWrapper>
    <LabelAboveContent header={header} title='Varslingsadresser'>
      {krav.varslingsadresserQl.map((varslingsaddresse: TVarslingsadresseQL, index: number) => (
        <>
          <SlackAdresse varslingsaddresse={varslingsaddresse} index={index} />
          <SlackBruker varslingsaddresse={varslingsaddresse} index={index} />
          <AnnenAdresse varslingsaddresse={varslingsaddresse} index={index} />
        </>
      ))}
    </LabelAboveContent>
  </LabelWrapper>
)

type TProps = {
  varslingsaddresse: TVarslingsadresseQL
  index: number
}

const SlackAdresse: FunctionComponent<TProps> = ({ varslingsaddresse, index }) => (
  <>
    {varslingsaddresse.type === EAdresseType.SLACK && (
      <div className='flex mb-2' key={`kravVarsling_list_SLACK_${index}`}>
        <div className='mr-1'>Slack:</div>
        <ExternalLink href={slackLink(varslingsaddresse.adresse)}>{`#${
          varslingsaddresse.slackChannel?.name || varslingsaddresse.adresse
        }`}</ExternalLink>
      </div>
    )}
  </>
)

const SlackBruker: FunctionComponent<TProps> = ({ varslingsaddresse, index }) => (
  <>
    {varslingsaddresse.type === EAdresseType.SLACK_USER && (
      <div className='flex mb-2' key={`kravVarsling_list_SLACK_USER_${index}`}>
        <div className='mr-1'>Slack:</div>
        <ExternalLink href={slackUserLink(varslingsaddresse.adresse)}>{`${
          varslingsaddresse.slackUser?.name || varslingsaddresse.adresse
        }`}</ExternalLink>
      </div>
    )}
  </>
)

const AnnenAdresse: FunctionComponent<TProps> = ({ varslingsaddresse, index }) => (
  <>
    {varslingsaddresse.type === EAdresseType.EPOST && (
      <div className='flex mb-2' key={`kravVarsling_list_EMAIL_${index}`}>
        <div className='mr-1'>Epost:</div>
        <ExternalLink href={`mailto:${varslingsaddresse.adresse}`} openOnSamePage>
          {varslingsaddresse.adresse}
        </ExternalLink>
      </div>
    )}
  </>
)
