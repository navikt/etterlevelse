import {AdresseType, SlackChannel, TeamResource, Varslingsadresse} from '../../constants'
import {getSlackUserByEmail, usePersonSearch, useSlackChannelSearch} from '../../api/TeamApi'
import {StatefulSelect} from 'baseui/select'
import React, {useState} from 'react'
import {Block} from 'baseui/block'
import {Spinner} from '../common/Spinner'
import {theme} from '../../util'
import {Notification} from 'baseui/notification'
import * as yup from 'yup'
import {Input} from 'baseui/input'
import Button from '../common/Button'
import {user} from '../../services/User'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faPlus} from '@fortawesome/free-solid-svg-icons'

type AddVarslingsadresseProps = {added: Varslingsadresse[], add: (v: Varslingsadresse) => void, close: () => void}

export const SlackChannelSearch = ({added, add, close}: AddVarslingsadresseProps) => {
  const [slackSearch, setSlackSearch, loading] = useSlackChannelSearch()

  return (
    <StatefulSelect
      placeholder={'Søk slack kanaler'}
      maxDropdownHeight='400px'
      filterOptions={o => o}
      searchable
      noResultsMsg='Ingen resultat'
      getOptionLabel={args => {
        const channel = args.option as SlackChannel
        return slackChannelView(channel, true)
      }}

      options={slackSearch.filter(ch => !added.find(va => va.adresse === ch.id))}
      onChange={({value}) => {
        const channel = value[0] as SlackChannel
        if (channel) add({type: AdresseType.SLACK, adresse: channel.id})
        close()
      }}
      onInputChange={event => setSlackSearch(event.currentTarget.value)}
      isLoading={loading}
    />
  )
}

export const SlackUserSearch = ({added, add, close}: AddVarslingsadresseProps) => {
  const [slackSearch, setSlackSearch, loading] = usePersonSearch()
  const [error, setError] = useState('')
  const [loadingSlackId, setLoadingSlackId] = useState(false)

  return (
    <Block display='flex' flexDirection='column'>
      <StatefulSelect
        placeholder={'Søk slack brukere'}
        maxDropdownHeight='400px'
        filterOptions={o => o}
        searchable
        noResultsMsg='Ingen resultat'
        getOptionLabel={args => (args.option as TeamResource).fullName}
        onFocus={() => setError('')}
        disabled={loadingSlackId}

        options={slackSearch}
        onChange={({value}) => {
          const resource = value[0] as TeamResource
          if (resource)
            setLoadingSlackId(true)
          getSlackUserByEmail(resource.email)
          .then(user => {
            add({type: AdresseType.SLACK_USER, adresse: user.id})
            close()
          }).catch(e => {
            setError('Fant ikke slack for bruker')
            setLoadingSlackId(false)
          })
        }}
        onInputChange={event => setSlackSearch(event.currentTarget.value)}
        isLoading={loading}
      />
      {loadingSlackId && <Spinner size={theme.sizing.scale800}/>}
      {error && <Notification kind='negative' overrides={{Body: {style: {marginBottom: '-25px'}}}}>{error}</Notification>}
    </Block>
  )
}

const emailValidator = yup.string().email()

export const AddEmail = ({added, add: doAdd, close}: AddVarslingsadresseProps) => {
  const [val, setVal] = useState('')
  const [error, setError] = useState('')
  const add = (adresse?: string) => {
    const toAdd = adresse || val
    if (!toAdd) return
    if (!added.find(va => va.adresse === toAdd)) {
      if (!emailValidator.isValidSync(toAdd)) {
        setError('Ugyldig epostadress')
        return
      }
      doAdd({type: AdresseType.EPOST, adresse: toAdd})
    }
    close()
  }
  const onKey = (e: React.KeyboardEvent) => (e.key === 'Enter') && add()
  return (
    <Block display='flex' flexDirection='column'>
      <Block display='flex'>
        <Input onKeyDown={onKey} value={val} onFocus={() => setError('')}
               onChange={e => setVal((e.target as HTMLInputElement).value)}
               onBlur={() => add()}
        />
        <Block display='flex' justifyContent='space-between'>
          <Button type='button' onClick={() => add(user.getEmail())} marginLeft>Meg </Button>
          <Button type='button' onClick={add} marginLeft><FontAwesomeIcon icon={faPlus}/> </Button>
        </Block>
      </Block>
      {error && <Notification kind='negative' overrides={{Body: {style: {marginBottom: '-25px'}}}}>
        {error}
      </Notification>
      }
    </Block>
  )
}

export const slackChannelView = (channel: SlackChannel, long?: boolean) => `Slack: #${channel.name} ${long ? channel.numMembers : ''}`
