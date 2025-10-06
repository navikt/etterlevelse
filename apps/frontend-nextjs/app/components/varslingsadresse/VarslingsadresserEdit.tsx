'use client'

import {
  getSlackChannelById,
  getSlackUserByEmail,
  getSlackUserById,
  usePersonSearch,
  useSlackChannelSearch,
} from '@/api/teamkatalogen/teamkatalogenApi'
import { IEtterlevelseDokumentasjon } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { TKravQL } from '@/constants/krav/kravConstants'
import { ISlackChannel, ISlackUser } from '@/constants/teamkatalogen/slack/slackConstants'
import { ITeamResource } from '@/constants/teamkatalogen/teamkatalogConstants'
import {
  EAdresseType,
  IVarslingsadresse,
  TVarslingsadresseQL,
} from '@/constants/teamkatalogen/varslingsadresse/varslingsadresseConstants'
import { UserContext } from '@/provider/user/userProvider'
import { noOptionMessage, selectOverrides } from '@/util/search/searchUtil'
import { EnvelopeClosedIcon, HashtagIcon, PersonIcon, PlusIcon } from '@navikt/aksel-icons'
import { Alert, Button, Loader, TextField } from '@navikt/ds-react'
import { FieldArray, FieldArrayRenderProps } from 'formik'
import React, { FunctionComponent, useContext, useEffect, useState } from 'react'
import AsyncSelect from 'react-select/async'
import * as yup from 'yup'
import { DropdownIndicator } from '../common/dropdownIndicator/dropdownIndicator'
import { FieldWrapper } from '../common/fieldWrapper/fieldWrapper'
import { LabelWithDescription } from '../common/labelWithoTootip.tsx/LabelWithTooltip'
import { Error } from '../common/modalSchema/ModalSchema'
import { RenderTagList } from '../common/renderTagList/renderTagList'
import { ContentLayout } from '../others/layout/content/content'
import { AddEmailModal } from './AddEmailModal'
import { AddSlackChannelModal } from './AddSlackChannelModal'
import { AddSlackUserModal } from './AddSlackUserModal'

interface IVarslingsadresserEditProps {
  fieldName: 'varslingsadresser' | 'varslingsadresserQl'
}

export const VarslingsadresserEdit = (props: IVarslingsadresserEditProps) => {
  const { fieldName } = props

  const [addSlackChannel, setAddSlackChannel] = useState<boolean>(false)
  const [addSlackUser, setAddSlackUser] = useState<boolean>(false)
  const [addEmail, setAddEmail] = useState<boolean>(false)

  return (
    <FieldWrapper>
      <FieldArray name={fieldName}>
        {(fieldArrayRenderProps: FieldArrayRenderProps) => {
          let varslingsadresser = []

          if (fieldName === 'varslingsadresser') {
            varslingsadresser = (fieldArrayRenderProps.form.values as IEtterlevelseDokumentasjon)
              .varslingsadresser
          } else {
            varslingsadresser = (fieldArrayRenderProps.form.values as TKravQL).varslingsadresserQl
          }

          const push = (varsling: TVarslingsadresseQL) => {
            if (!varslingsadresser.find((varsling2) => varsling2.adresse === varsling.adresse))
              fieldArrayRenderProps.push(varsling)
          }
          return (
            <div>
              <LabelWithDescription label='Velg varslingskanal (slack og/eller epost) for spørsmål eller tilbakemeldinger på kravet.' />
              <div>
                <div className='mb-2.5'>
                  <Button
                    variant='secondary'
                    type='button'
                    onClick={() => setAddSlackChannel(true)}
                    icon={
                      <HashtagIcon
                        title='hash tag icon'
                        aria-hidden
                        aria-label=''
                        fontSize='1.5rem'
                      />
                    }
                  >
                    Legg til slack-kanal
                  </Button>
                  <Button
                    className='ml-2.5'
                    variant='secondary'
                    type='button'
                    onClick={() => setAddSlackUser(true)}
                    icon={<PersonIcon aria-hidden aria-label='' />}
                  >
                    Legg til slack-bruker
                  </Button>
                  <Button
                    variant='secondary'
                    className='ml-2.5'
                    type='button'
                    onClick={() => setAddEmail(true)}
                    icon={<EnvelopeClosedIcon aria-hidden aria-label='' />}
                  >
                    Legg til epost
                  </Button>
                </div>
                <VarslingsadresserTagList
                  remove={fieldArrayRenderProps.remove}
                  varslingsadresser={varslingsadresser}
                />
              </div>

              {addSlackChannel && (
                <AddSlackChannelModal
                  isOpen={addSlackChannel}
                  close={() => setAddSlackChannel(false)}
                  doAdd={push}
                />
              )}

              {addSlackUser && (
                <AddSlackUserModal
                  isOpen={addSlackUser}
                  close={() => setAddSlackUser(false)}
                  doAdd={push}
                />
              )}

              {addEmail && (
                <AddEmailModal
                  isOpen={addEmail}
                  close={() => setAddEmail(false)}
                  added={fieldArrayRenderProps.form.values[fieldName] as TVarslingsadresseQL[]}
                  doAdd={push}
                />
              )}
            </div>
          )
        }}
      </FieldArray>
    </FieldWrapper>
  )
}

type TVarslingsadresserTagListProps = {
  varslingsadresser: IVarslingsadresse[]
  remove: (i: number) => void
}

export const VarslingsadresserTagList: FunctionComponent<TVarslingsadresserTagListProps> = ({
  varslingsadresser,
  remove,
}) => {
  const [slackChannels, setSlackChannels] = useState<ISlackChannel[]>([])
  const [slackUsers, setSlackUsers] = useState<ISlackUser[]>([])

  useEffect(() => {
    ;(async () => {
      const loadedChannels: ISlackChannel[] = []
      const loadedUsers: ISlackUser[] = []
      const channels: ISlackChannel[] = await Promise.all(
        varslingsadresser
          .filter((varslingaddresse) => varslingaddresse.type === EAdresseType.SLACK)
          .filter(
            (varslingaddresse: IVarslingsadresse) =>
              !slackChannels.find(
                (slackChannel: ISlackChannel) => slackChannel.id === varslingaddresse.adresse
              )
          )
          .filter((varslingaddresse: IVarslingsadresse) => {
            const varsling = varslingaddresse as TVarslingsadresseQL
            if (varsling.slackChannel) {
              loadedChannels.push(varsling.slackChannel)
              return false
            }
            return true
          })
          .map((slackChannel) => getSlackChannelById(slackChannel.adresse))
      )

      const users: ISlackUser[] = await Promise.all(
        varslingsadresser
          .filter(
            (varslingaddresse: IVarslingsadresse) =>
              varslingaddresse.type === EAdresseType.SLACK_USER
          )
          .filter(
            (varslingaddresse: IVarslingsadresse) =>
              !slackUsers.find((user: ISlackUser) => user.id === varslingaddresse.adresse)
          )
          .filter((varslingaddresse) => {
            const varsling: TVarslingsadresseQL = varslingaddresse as TVarslingsadresseQL
            if (varsling.slackUser) {
              loadedUsers.push(varsling.slackUser)
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
      list={varslingsadresser.map((varslingaddresse: IVarslingsadresse) => {
        if (varslingaddresse.type === EAdresseType.SLACK) {
          const channel: ISlackChannel | undefined = slackChannels.find(
            (slackChannel) => slackChannel.id === varslingaddresse.adresse
          )
          return channel ? slackChannelView(channel) : `Slack: ${varslingaddresse.adresse}`
        } else if (varslingaddresse.type === EAdresseType.SLACK_USER) {
          const user: ISlackUser | undefined = slackUsers.find(
            (user) => user.id === varslingaddresse.adresse
          )
          return user ? `Slack: ${user.name}` : `Slack: ${varslingaddresse.adresse}`
        }
        return 'Epost: ' + varslingaddresse.adresse
      })}
      onRemove={remove}
    />
  )
}

type TAddVarslingsadresseProps = {
  add: (v: IVarslingsadresse) => void
  added?: IVarslingsadresse[]
  close?: () => void
}

export const SlackChannelSearch: FunctionComponent<TAddVarslingsadresseProps> = ({
  add,
  close,
}) => (
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

export const SlackUserSearch: FunctionComponent<TAddVarslingsadresseProps> = ({ add, close }) => {
  const [error, setError] = useState('')
  const [loadingSlackId, setLoadingSlackId] = useState(false)
  const user = useContext(UserContext)

  const addEmail = (email: string) => {
    getSlackUserByEmail(email)
      .then((user) => {
        add({ type: EAdresseType.SLACK_USER, adresse: user.id })
        setLoadingSlackId(false)
        setError('')
        if (close) {
          close()
        }
      })
      .catch((e) => {
        setError('Fant ikke slack for bruker, error: ' + e.toString())
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

export const emailValidator = yup
  .string()
  .email()
  .matches(/.+@nav.no/i)

export const AddEmail = ({ added, add: doAdd, close }: TAddVarslingsadresseProps) => {
  const [val, setVal] = useState('')
  const [error, setError] = useState('')
  const user = useContext(UserContext)

  const add = (adresse?: string) => {
    const toAdd = adresse || val
    if (!toAdd) return
    if (!added || !added.find((va) => va.adresse === toAdd)) {
      if (!emailValidator.isValidSync(toAdd)) {
        setError('Ikke gyldig @nav.no epost adresse')
        return
      }
      doAdd({ type: EAdresseType.EPOST, adresse: toAdd })
      setVal('')
    }
    if (close) {
      close()
    }
  }

  const onKey = (e: React.KeyboardEvent) => e.key === 'Enter' && add()

  return (
    <div className='flex flex-col'>
      <ContentLayout>
        <TextField
          label='epost'
          hideLabel
          onKeyDown={onKey}
          value={val}
          onFocus={() => setError('')}
          onChange={(e) => setVal((e.target as HTMLInputElement).value)}
          onBlur={() => add()}
          className={`w-full ${error ? 'border-2 rounded-md border-[#c30000]' : ''}`}
        />
        <div className='flex justify-between ml-2.5'>
          <Button type='button' onClick={() => add(user.getEmail())}>
            Meg
          </Button>
          <Button type='button' onClick={() => add} className='ml-2.5'>
            <PlusIcon title='legg til epost' aria-label='legg til epost' />
          </Button>
        </div>
      </ContentLayout>
      {error && <Error message={error} />}
    </div>
  )
}

export const slackChannelView = (channel: ISlackChannel, long?: boolean) =>
  `Slack: #${channel.name} ${long ? channel.numMembers : ''}`
