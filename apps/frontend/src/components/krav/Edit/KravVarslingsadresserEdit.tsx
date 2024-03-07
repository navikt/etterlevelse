import { faSlackHash } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { EnvelopeClosedIcon, PersonIcon, PlusIcon } from '@navikt/aksel-icons'
import { Alert, Button, Loader, Modal, TextField } from '@navikt/ds-react'
import { FieldArray, FieldArrayRenderProps } from 'formik'
import React, { ReactNode, useEffect, useState } from 'react'
import { CSSObjectWithLabel } from 'react-select'
import AsyncSelect from 'react-select/async'
import * as yup from 'yup'
import {
  getSlackChannelById,
  getSlackUserByEmail,
  getSlackUserById,
  usePersonSearch,
  useSlackChannelSearch,
} from '../../../api/TeamApi'
import {
  EAdresseType,
  IKrav,
  ISlackChannel,
  ISlackUser,
  ITeamResource,
  IVarslingsadresse,
  TVarslingsadresseQL,
} from '../../../constants'
import { user } from '../../../services/User'
import { ettlevColors } from '../../../util/theme'
import { FieldWrapper } from '../../common/Inputs'
import LabelWithTooltip from '../../common/LabelWithTooltip'
import { Error } from '../../common/ModalSchema'
import { RenderTagList } from '../../common/TagList'
import { DropdownIndicator } from './KravBegreperEdit'

export const KravVarslingsadresserEdit = () => {
  const [addSlackChannel, setAddSlackChannel] = useState<boolean>(false)
  const [addSlackUser, setAddSlackUser] = useState<boolean>(false)
  const [addEmail, setAddEmail] = useState<boolean>(false)

  return (
    <FieldWrapper>
      <FieldArray name="varslingsadresser">
        {(fieldArrayRenderProps: FieldArrayRenderProps) => {
          const varslingsadresser = (fieldArrayRenderProps.form.values as IKrav).varslingsadresser
          const push = (v: IVarslingsadresse) => {
            if (!varslingsadresser.find((v2) => v2.adresse === v.adresse))
              fieldArrayRenderProps.push(v)
          }
          return (
            <div>
              <LabelWithTooltip
                label={'Varslingsadresser'}
                tooltip={
                  'Angi varslingskanal (slack og/eller epost) for spørsmål eller tilbakemeldinger til kravet.'
                }
              />
              <div>
                <div className="mb-2.5">
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={() => setAddSlackChannel(true)}
                    icon={<FontAwesomeIcon icon={faSlackHash} aria-hidden aria-label="" />}
                  >
                    Legg til slack-kanal
                  </Button>
                  <Button
                    className="ml-2.5"
                    variant="secondary"
                    type="button"
                    onClick={() => setAddSlackUser(true)}
                    icon={<PersonIcon aria-hidden aria-label="" />}
                  >
                    Legg til slack-bruker
                  </Button>
                  <Button
                    variant="secondary"
                    className="ml-2.5"
                    type="button"
                    onClick={() => setAddEmail(true)}
                    icon={<EnvelopeClosedIcon aria-hidden aria-label="" />}
                  >
                    Legg til epost
                  </Button>
                </div>
                <VarslingsadresserTagList
                  remove={fieldArrayRenderProps.remove}
                  varslingsadresser={varslingsadresser}
                />
              </div>

              <AddModal
                largeHeight
                title="Legg til Slack kanal"
                isOpen={addSlackChannel}
                close={() => setAddSlackChannel(false)}
              >
                <SlackChannelSearch
                  added={(fieldArrayRenderProps.form.values as IKrav).varslingsadresser}
                  add={push}
                  close={() => setAddSlackChannel(false)}
                />
              </AddModal>

              <AddModal
                largeHeight
                title="Legg til Slack bruker"
                isOpen={addSlackUser}
                close={() => setAddSlackUser(false)}
              >
                <SlackUserSearch
                  added={(fieldArrayRenderProps.form.values as IKrav).varslingsadresser}
                  add={push}
                  close={() => setAddSlackUser(false)}
                />
              </AddModal>

              <AddModal
                title="Legg til Epost adresse"
                isOpen={addEmail}
                close={() => setAddEmail(false)}
              >
                <AddEmail
                  added={(fieldArrayRenderProps.form.values as IKrav).varslingsadresser}
                  add={push}
                  close={() => setAddEmail(false)}
                />
              </AddModal>
            </div>
          )
        }}
      </FieldArray>
    </FieldWrapper>
  )
}

const AddModal = ({
  isOpen,
  close,
  title,
  children,
  largeHeight,
}: {
  isOpen: boolean
  close: () => void
  title: string
  children: ReactNode
  largeHeight?: boolean
}) => (
  <Modal
    open={isOpen}
    onClose={close}
    header={{ heading: title, closeButton: false }}
    width="medium"
  >
    <Modal.Body className={`${largeHeight ? 'min-h-[18.75rem]' : undefined}`}>
      {children}
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" type="button" onClick={close}>
        Avbryt
      </Button>
    </Modal.Footer>
  </Modal>
)

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

type TAddVarslingsadresseProps = {
  add: (v: IVarslingsadresse) => void
  added?: IVarslingsadresse[]
  close?: () => void
}

export const SlackChannelSearch = ({ add, close }: TAddVarslingsadresseProps) => {
  return (
    <AsyncSelect
      aria-label="Søk etter slack-kanal"
      placeholder="Søk etter slack-kanal"
      noOptionsMessage={({ inputValue }) =>
        inputValue.length < 3
          ? 'Skriv minst tre tegn for å søke'
          : `Fant ingen resultater for "${inputValue}"`
      }
      controlShouldRenderValue={false}
      loadingMessage={() => 'Søker...'}
      isClearable={false}
      components={{ DropdownIndicator }}
      loadOptions={useSlackChannelSearch}
      onChange={(slackKanal) => {
        const channel = slackKanal as ISlackChannel
        if (channel) add({ type: EAdresseType.SLACK, adresse: channel.id })
        close && close()
      }}
      styles={{
        control: (base) =>
          ({
            ...base,
            cursor: 'text',
            height: '3rem',
            borderColor: ettlevColors.textAreaBorder,
          }) as CSSObjectWithLabel,
      }}
    />
  )
}

export const SlackUserSearch = ({ add, close }: TAddVarslingsadresseProps) => {
  const [error, setError] = useState('')
  const [loadingSlackId, setLoadingSlackId] = useState(false)

  const addEmail = (email: string) => {
    getSlackUserByEmail(email)
      .then((user) => {
        add({ type: EAdresseType.SLACK_USER, adresse: user.id })
        setLoadingSlackId(false)
        setError('')
        close && close()
      })
      .catch((e) => {
        setError('Fant ikke slack for bruker, error: ' + e.toString())
        setLoadingSlackId(false)
      })
  }

  return (
    <div className="flex flex-col">
      <div className="flex w-full">
        <div className="w-full">
          <AsyncSelect
            aria-label="Søk etter slack-bruker"
            placeholder="Søk etter slack-bruker"
            noOptionsMessage={({ inputValue }) =>
              inputValue.length < 3
                ? 'Skriv minst tre tegn for å søke'
                : `Fant ingen resultater for "${inputValue}"`
            }
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
            styles={{
              control: (base) =>
                ({
                  ...base,
                  cursor: 'text',
                  height: '3rem',
                  borderColor: ettlevColors.textAreaBorder,
                }) as CSSObjectWithLabel,
            }}
          />
        </div>
        <div className="flex justify-end ml-2.5">
          <Button type="button" onClick={() => addEmail(user.getEmail())}>
            Meg
          </Button>
        </div>
      </div>
      {loadingSlackId && <Loader size="large" />}
      {error && (
        <Alert className="mt-2.5" variant="error">
          {error}
        </Alert>
      )}
    </div>
  )
}

const emailValidator = yup
  .string()
  .email()
  .matches(/.+@nav.no/i)

export const AddEmail = ({ added, add: doAdd, close }: TAddVarslingsadresseProps) => {
  const [val, setVal] = useState('')
  const [error, setError] = useState('')

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
    close && close()
  }

  const onKey = (e: React.KeyboardEvent) => e.key === 'Enter' && add()
  return (
    <div className="flex flex-col">
      <div className="flex w-full">
        <TextField
          label="epost"
          hideLabel
          onKeyDown={onKey}
          value={val}
          onFocus={() => setError('')}
          onChange={(e) => setVal((e.target as HTMLInputElement).value)}
          onBlur={() => add()}
          className={`w-full ${error ? 'border-2 rounded-md border-[#c30000]' : ''}`}
        />
        <div className="flex justify-between ml-2.5">
          <Button type="button" onClick={() => add(user.getEmail())}>
            Meg
          </Button>
          <Button type="button" onClick={() => add} className="ml-2.5">
            <PlusIcon title="legg til epost" aria-label="legg til epost" />
          </Button>
        </div>
      </div>
      {error && <Error message={error} />}
    </div>
  )
}

export const slackChannelView = (channel: ISlackChannel, long?: boolean) =>
  `Slack: #${channel.name} ${long ? channel.numMembers : ''}`
