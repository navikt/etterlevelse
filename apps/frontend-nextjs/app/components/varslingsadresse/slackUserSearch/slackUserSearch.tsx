'use client'

import { getSlackUserByEmail, usePersonSearch } from '@/api/teamkatalogen/teamkatalogenApi'
import { DropdownIndicator } from '@/components/common/dropdownIndicator/dropdownIndicator'
import { ContentLayout } from '@/components/others/layout/content/content'
import { ISlackUser } from '@/constants/teamkatalogen/slack/slackConstants'
import { ITeamResource } from '@/constants/teamkatalogen/teamkatalogConstants'
import {
  EAdresseType,
  IVarslingsadresse,
} from '@/constants/teamkatalogen/varslingsadresse/varslingsadresseConstants'
import { UserContext } from '@/provider/user/userProvider'
import { noOptionMessage, selectOverrides } from '@/util/search/searchUtil'
import { Alert, Button, Loader } from '@navikt/ds-react'
import { FunctionComponent, useContext, useState } from 'react'
import AsyncSelect from 'react-select/async'

type TProps = {
  add: (v: IVarslingsadresse) => void
  added?: IVarslingsadresse[]
  close?: () => void
}

export const SlackUserSearch: FunctionComponent<TProps> = ({ add, close }) => {
  const [error, setError] = useState('')
  const [loadingSlackId, setLoadingSlackId] = useState(false)
  const user = useContext(UserContext)

  const addEmail = (email: string): void => {
    getSlackUserByEmail(email)
      .then((user: ISlackUser) => {
        add({ type: EAdresseType.SLACK_USER, adresse: user.id })
        setLoadingSlackId(false)
        setError('')
        if (close) {
          close()
        }
      })
      .catch((error: any) => {
        setError(`Fant ikke slack for bruker, error: ${error.toString()}`)
        setLoadingSlackId(false)
      })
  }

  return (
    <div className='flex flex-col'>
      <ContentLayout>
        <div className='w-full'>
          <AsyncSelect
            aria-label='Søk etter slack-bruker'
            placeholder='Søk etter slack-bruker'
            noOptionsMessage={({ inputValue }) => noOptionMessage(inputValue)}
            controlShouldRenderValue={false}
            loadingMessage={() => 'Søker...'}
            isClearable={false}
            loadOptions={usePersonSearch}
            components={{ DropdownIndicator }}
            onFocus={() => setError('')}
            onBlur={() => setError('')}
            onChange={(person) => {
              const resource = person as ITeamResource
              if (resource) {
                setLoadingSlackId(true)
                addEmail(resource.email)
              }
            }}
            styles={selectOverrides}
          />
        </div>
        <div className='flex justify-end ml-2.5'>
          <Button type='button' onClick={() => addEmail(user.getEmail())}>
            Meg
          </Button>
        </div>
      </ContentLayout>
      {loadingSlackId && <Loader size='large' className='flex justify-self-center' />}
      {error && (
        <Alert className='mt-2.5' variant='error'>
          {error}
        </Alert>
      )}
    </div>
  )
}
