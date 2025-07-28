import { getSlackChannelById, getSlackUserById } from '@/api/teamkatalogen/slack/slackApi'
import { RenderTagList } from '@/components/common/renderTagList/renderTagList'
import { ISlackChannel, ISlackUser } from '@/constants/teamkatalogen/slack/slackConstants'
import {
  EAdresseType,
  IVarslingsadresse,
  TVarslingsadresseQL,
} from '@/constants/teamkatalogen/varslingsadresse/varslingsadresseConstants'
import { slackChannelView } from '@/util/teamkatalog/utils'
import { useEffect, useState } from 'react'

export const VarslingsadresserTagList = ({
  varslingsadresser,
  remove,
}: {
  varslingsadresser: IVarslingsadresse[]
  remove: (i: number) => void
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
          .map((slackChannel: IVarslingsadresse) => getSlackChannelById(slackChannel.adresse))
      )

      const users = await Promise.all(
        varslingsadresser
          .filter((varslingaddresse) => varslingaddresse.type === EAdresseType.SLACK_USER)
          .filter(
            (varslingaddresse: IVarslingsadresse) =>
              !slackUsers.find(
                (varslingaddresseId) => varslingaddresseId.id === varslingaddresse.adresse
              )
          )
          .filter((varslingaddresse: IVarslingsadresse) => {
            const varslingsadresseQL = varslingaddresse as TVarslingsadresseQL
            if (varslingsadresseQL.slackUser) {
              loadedUsers.push(varslingsadresseQL.slackUser)
              return false
            }
            return true
          })
          .map((slackChannel: IVarslingsadresse) => getSlackUserById(slackChannel.adresse))
      )

      setSlackChannels([...slackChannels, ...channels, ...loadedChannels])
      setSlackUsers([...slackUsers, ...users, ...loadedUsers])
    })()
  }, [varslingsadresser])

  return (
    <RenderTagList
      list={varslingsadresser.map((varslingaddresse) => {
        if (varslingaddresse.type === EAdresseType.SLACK) {
          const channel = slackChannels.find((c) => c.id === varslingaddresse.adresse)
          return channel ? slackChannelView(channel) : `Slack: ${varslingaddresse.adresse}`
        } else if (varslingaddresse.type === EAdresseType.SLACK_USER) {
          const user = slackUsers.find((u) => u.id === varslingaddresse.adresse)
          return user ? `Slack: ${user.name}` : `Slack: ${varslingaddresse.adresse}`
        }
        return 'Epost: ' + varslingaddresse.adresse
      })}
      onRemove={remove}
    />
  )
}
