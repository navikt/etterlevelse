import { useSlackChannelSearch } from '@/api/teamkatalogen/slack/slackApi'
import { DropdownIndicator } from '@/components/etterlevelse/edit/dropdownIndicator/dropdownIndicator'
import { EAdresseType, IVarslingsadresse } from '@/constants/commonConstants'
import { ISlackChannel } from '@/constants/teamkatalogen/slack/slackConstants'
import { noOptionMessage, selectOverrides } from '@/util/search/searchUtil'
import { FunctionComponent } from 'react'
import AsyncSelect from 'react-select/async'

type TProps = {
  add: (varsling: IVarslingsadresse) => void
  added?: IVarslingsadresse[]
  close?: () => void
}

export const SlackChannelSearch: FunctionComponent<TProps> = ({ add, close }) => (
  <AsyncSelect
    aria-label='Søk etter slack-kanal'
    placeholder='Søk etter slack-kanal'
    noOptionsMessage={({ inputValue }) => noOptionMessage(inputValue)}
    controlShouldRenderValue={false}
    loadingMessage={() => 'Søker...'}
    isClearable={false}
    components={{ DropdownIndicator }}
    loadOptions={useSlackChannelSearch}
    onChange={(slackKanal) => {
      const channel = slackKanal as ISlackChannel
      if (channel) add({ type: EAdresseType.SLACK, adresse: channel.id })
      if (close) {
        close()
      }
    }}
    styles={selectOverrides}
  />
)
