import { AdresseType, Krav, SlackChannel, SlackUser, TeamResource, Varslingsadresse, VarslingsadresseQL } from '../../../constants'
import { getSlackChannelById, getSlackUserByEmail, getSlackUserById, usePersonSearch, useSlackChannelSearch } from '../../../api/TeamApi'
import React, { ReactNode, useEffect, useState } from 'react'
import * as yup from 'yup'
import { user } from '../../../services/User'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FieldWrapper } from '../../common/Inputs'
import { FieldArray, FieldArrayRenderProps } from 'formik'
import { faSlackHash } from '@fortawesome/free-brands-svg-icons'
import { RenderTagList } from '../../common/TagList'
import LabelWithTooltip from '../../common/LabelWithTooltip'
import { Alert, Button, Loader, Modal, TextField } from '@navikt/ds-react'
import { EnvelopeClosedIcon, PersonIcon, PlusIcon } from '@navikt/aksel-icons'
import AsyncSelect from 'react-select/async'
import { DropdownIndicator } from './KravBegreperEdit'

export const KravVarslingsadresserEdit = () => {
  const [addSlackChannel, setAddSlackChannel] = useState<boolean>(false)
  const [addSlackUser, setAddSlackUser] = useState<boolean>(false)
  const [addEmail, setAddEmail] = useState<boolean>(false)

  return (
    <FieldWrapper>
      <FieldArray name="varslingsadresser">
        {(p: FieldArrayRenderProps) => {
          const varslingsadresser = (p.form.values as Krav).varslingsadresser
          const push = (v: Varslingsadresse) => {
            if (!varslingsadresser.find((v2) => v2.adresse === v.adresse)) p.push(v)
          }
          return (
            <div>
              <LabelWithTooltip label={'Varslingsadresser'} tooltip={'Angi varslingskanal (slack og/eller epost) for spørsmål eller tilbakemeldinger til kravet.'} />
              <div>
                <div className="mb-2.5">
                  <Button variant="secondary" type="button" onClick={() => setAddSlackChannel(true)} icon={<FontAwesomeIcon icon={faSlackHash} aria-hidden aria-label="" />}>
                    Legg til slack-kanal
                  </Button>
                  <Button className="ml-2.5" variant="secondary" type="button" onClick={() => setAddSlackUser(true)} icon={<PersonIcon aria-hidden aria-label="" />}>
                    Legg til slack-bruker
                  </Button>
                  <Button variant="secondary" className="ml-2.5" type="button" onClick={() => setAddEmail(true)} icon={<EnvelopeClosedIcon aria-hidden aria-label="" />}>
                    Legg til epost
                  </Button>
                </div>
                <VarslingsadresserTagList remove={p.remove} varslingsadresser={varslingsadresser} />
              </div>

              <AddModal largeHeight title="Legg til Slack kanal" isOpen={addSlackChannel} close={() => setAddSlackChannel(false)}>
                <SlackChannelSearch added={(p.form.values as Krav).varslingsadresser} add={push} close={() => setAddSlackChannel(false)} />
              </AddModal>

              <AddModal largeHeight title="Legg til Slack bruker" isOpen={addSlackUser} close={() => setAddSlackUser(false)}>
                <SlackUserSearch added={(p.form.values as Krav).varslingsadresser} add={push} close={() => setAddSlackUser(false)} />
              </AddModal>

              <AddModal title="Legg til Epost adresse" isOpen={addEmail} close={() => setAddEmail(false)}>
                <AddEmail added={(p.form.values as Krav).varslingsadresser} add={push} close={() => setAddEmail(false)} />
              </AddModal>
            </div>
          )
        }}
      </FieldArray>
    </FieldWrapper>
  )
}

const AddModal = ({ isOpen, close, title, children, largeHeight }: { isOpen: boolean; close: () => void; title: string; children: ReactNode; largeHeight?: boolean }) => (
  <Modal open={isOpen} onClose={close} header={{ heading: title }} width="medium">
    <Modal.Body className={`${largeHeight ? 'min-h-[300px]' : undefined}`}>{children}</Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" type="button" onClick={close}>
        Avbryt
      </Button>
    </Modal.Footer>
  </Modal>
)

export const VarslingsadresserTagList = ({ varslingsadresser, remove }: { varslingsadresser: Varslingsadresse[]; remove: (i: number) => void }) => {
  const [slackChannels, setSlackChannels] = useState<SlackChannel[]>([])
  const [slackUsers, setSlackUsers] = useState<SlackUser[]>([])

  useEffect(() => {
    ;(async () => {
      const loadedChannels: SlackChannel[] = []
      const loadedUsers: SlackUser[] = []
      const channels = await Promise.all(
        varslingsadresser
          .filter((va) => va.type === AdresseType.SLACK)
          .filter((va) => !slackChannels.find((sc) => sc.id === va.adresse))
          .filter((va) => {
            const vas = va as VarslingsadresseQL
            if (vas.slackChannel) {
              loadedChannels.push(vas.slackChannel)
              return false
            }
            return true
          })
          .map((c) => getSlackChannelById(c.adresse)),
      )

      const users = await Promise.all(
        varslingsadresser
          .filter((va) => va.type === AdresseType.SLACK_USER)
          .filter((va) => !slackUsers.find((u) => u.id === va.adresse))
          .filter((va) => {
            const vas = va as VarslingsadresseQL
            if (vas.slackUser) {
              loadedUsers.push(vas.slackUser)
              return false
            }
            return true
          })
          .map((c) => getSlackUserById(c.adresse)),
      )

      setSlackChannels([...slackChannels, ...channels, ...loadedChannels])
      setSlackUsers([...slackUsers, ...users, ...loadedUsers])
    })()
  }, [varslingsadresser])

  return (
    <RenderTagList
      list={varslingsadresser.map((v, i) => {
        if (v.type === AdresseType.SLACK) {
          const channel = slackChannels.find((c) => c.id === v.adresse)
          return channel ? slackChannelView(channel) : `Slack: ${v.adresse}`
        } else if (v.type === AdresseType.SLACK_USER) {
          const user = slackUsers.find((u) => u.id === v.adresse)
          return user ? `Slack: ${user.name}` : `Slack: ${v.adresse}`
        }
        return 'Epost: ' + v.adresse
      })}
      onRemove={remove}
    />
  )
}

type AddVarslingsadresseProps = {
  add: (v: Varslingsadresse) => void
  added?: Varslingsadresse[]
  close?: () => void
}

export const SlackChannelSearch = ({ added, add, close }: AddVarslingsadresseProps) => {
  return (
    <AsyncSelect
      aria-label="Søk etter slack-kanal"
      placeholder="Søk etter slack-kanal"
      noOptionsMessage={({ inputValue }) => (inputValue.length < 3 ? 'Skriv minst tre tegn for å søke' : `Fant ingen resultater for "${inputValue}"`)}
      controlShouldRenderValue={false}
      loadingMessage={() => 'Søker...'}
      isClearable={false}
      components={{ DropdownIndicator }}
      loadOptions={useSlackChannelSearch}
      onChange={(slackKanal) => {
        const channel = slackKanal as SlackChannel
        if (channel) add({ type: AdresseType.SLACK, adresse: channel.id })
        close && close()
      }}
      styles={{
        control: (base) => ({
          ...base,
          cursor: 'text',
          height: '48px',
        }),
      }}
    />
  )
}

export const SlackUserSearch = ({ add, close }: AddVarslingsadresseProps) => {
  const [error, setError] = useState('')
  const [loadingSlackId, setLoadingSlackId] = useState(false)

  const addEmail = (email: string) => {
    getSlackUserByEmail(email)
      .then((user) => {
        add({ type: AdresseType.SLACK_USER, adresse: user.id })
        setLoadingSlackId(false)
        setError('')
        close && close()
      })
      .catch((e) => {
        setError('Fant ikke slack for bruker')
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
            noOptionsMessage={({ inputValue }) => (inputValue.length < 3 ? 'Skriv minst tre tegn for å søke' : `Fant ingen resultater for "${inputValue}"`)}
            controlShouldRenderValue={false}
            loadingMessage={() => 'Søker...'}
            isClearable={false}
            loadOptions={usePersonSearch}
            components={{ DropdownIndicator }}
            onFocus={() => setError('')}
            onBlur={() => setError('')}
            onChange={(person) => {
              const resource = person as TeamResource
              if (resource) {
                setLoadingSlackId(true)
                addEmail(resource.email)
              }
            }}
            styles={{
              control: (base) => ({
                ...base,
                cursor: 'text',
                height: '48px',
              }),
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

export const AddEmail = ({ added, add: doAdd, close }: AddVarslingsadresseProps) => {
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
      doAdd({ type: AdresseType.EPOST, adresse: toAdd })
      setVal('')
    }
    close && close()
  }

  const onKey = (e: React.KeyboardEvent) => e.key === 'Enter' && add()
  return (
    <div className="flex flex-col">
      <div className="flex">
        <TextField
          label="epost"
          hideLabel
          onKeyDown={onKey}
          value={val}
          onFocus={() => setError('')}
          onChange={(e) => setVal((e.target as HTMLInputElement).value)}
          onBlur={() => add()}
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
      {error && (
        <Alert variant="error" className="mt-2.5">
          {error}
        </Alert>
      )}
    </div>
  )
}

export const slackChannelView = (channel: SlackChannel, long?: boolean) => `Slack: #${channel.name} ${long ? channel.numMembers : ''}`
