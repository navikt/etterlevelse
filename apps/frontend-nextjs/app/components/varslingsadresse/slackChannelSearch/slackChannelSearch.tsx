import { useSlackChannelSearch } from '@/api/teamkatalogen/teamkatalogenApi'
import { DropdownIndicator } from '@/components/etterlevelse/edit/dropdownIndicator/dropdownIndicator'
import { EAdresseType, ISlackChannel, IVarslingsadresse } from '@/constants/commonConstants'
import { noOptionMessage, selectOverrides } from '@/util/search/searchUtil'
import AsyncSelect from 'react-select/async'

type TAddVarslingsadresseProps = {
  add: (varsling: IVarslingsadresse) => void
  added?: IVarslingsadresse[]
  close?: () => void
}

export const SlackChannelSearch = ({ add, close }: TAddVarslingsadresseProps) => (
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
