import { getSlackChannelById, getSlackUserById } from '@/api/teamkatalogen/teamkatalogenApi'
import { ISlackChannel, ISlackUser } from '@/constants/teamkatalogen/slack/slackConstants'
import {
  EAdresseType,
  IVarslingsadresse,
  TVarslingsadresseQL,
} from '@/constants/teamkatalogen/varslingsadresse/varslingsadresseConstants'
import { slackLink, slackUserLink } from '@/util/config/config'
import { BodyLong } from '@navikt/ds-react'
import { useEffect, useState } from 'react'
import { ExternalLink } from '../common/externalLink/externalLink'

export const VarslingsadresserView = ({
  varslingsadresser,
}: {
  varslingsadresser: IVarslingsadresse[]
}) => {
  const [slackChannels, setSlackChannels] = useState<ISlackChannel[]>([])
  const [slackUsers, setSlackUsers] = useState<ISlackUser[]>([])

  useEffect(() => {
    ;(async () => {
      const loadedChannels: ISlackChannel[] = []
      const loadedUsers: ISlackUser[] = []
      const channels = await Promise.all(
        varslingsadresser
          .filter((varslingaddresse) => varslingaddresse.type === EAdresseType.SLACK)
          .filter(
            (varslingaddresse) => !slackChannels.find((sc) => sc.id === varslingaddresse.adresse)
          )
          .filter((varslingaddresse) => {
            const vas = varslingaddresse as TVarslingsadresseQL
            if (vas.slackChannel) {
              loadedChannels.push(vas.slackChannel)
              return false
            }
            return true
          })
          .map((slackChannel) => getSlackChannelById(slackChannel.adresse))
      )

      const users = await Promise.all(
        varslingsadresser
          .filter((varslingaddresse) => varslingaddresse.type === EAdresseType.SLACK_USER)
          .filter((varslingaddresse) => !slackUsers.find((u) => u.id === varslingaddresse.adresse))
          .filter((varslingaddresse) => {
            const vas = varslingaddresse as TVarslingsadresseQL
            if (vas.slackUser) {
              loadedUsers.push(vas.slackUser)
              return false
            }
            return true
          })
          .map((slackChannel) => getSlackUserById(slackChannel.adresse))
      )

      setSlackChannels([...slackChannels, ...channels, ...loadedChannels])
      setSlackUsers([...slackUsers, ...users, ...loadedUsers])
    })()
  }, [varslingsadresser])

  return (
    <div>
      {varslingsadresser.map((varslingsaddresse, index) => {
        if (varslingsaddresse.type === EAdresseType.SLACK) {
          const channel = slackChannels.find((c) => c.id === varslingsaddresse.adresse)
          return (
            <div className='flex items-center mb-2.5' key={'kravVarsling_list_SLACK_' + index}>
              <BodyLong size='medium' className='mr-1'>
                Slack:
              </BodyLong>
              <ExternalLink
                className='text-medium'
                href={slackLink(varslingsaddresse.adresse)}
              >{`#${channel?.name || varslingsaddresse.adresse}`}</ExternalLink>
            </div>
          )
        }
        if (varslingsaddresse.type === EAdresseType.SLACK_USER) {
          const user = slackUsers.find((u) => u.id === varslingsaddresse.adresse)
          return (
            <div className='flex items-center mb-2.5' key={'kravVarsling_list_SLACK_USER_' + index}>
              <BodyLong size='medium' className='mr-1'>
                Slack:
              </BodyLong>
              <ExternalLink
                className='text-medium'
                href={slackUserLink(varslingsaddresse.adresse)}
              >{`${user?.name || varslingsaddresse.adresse}`}</ExternalLink>
            </div>
          )
        }
        return (
          <div className='flex items-center mb-2.5' key={'kravVarsling_list_EMAIL_' + index}>
            <BodyLong size='medium' className='mr-1'>
              Epost:
            </BodyLong>
            <ExternalLink
              className='text-medium'
              href={`mailto:${varslingsaddresse.adresse}`}
              openOnSamePage
            >
              {varslingsaddresse.adresse}
            </ExternalLink>
          </div>
        )
      })}
    </div>
  )
}
