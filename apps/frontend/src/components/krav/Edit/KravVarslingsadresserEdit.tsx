import { AdresseType, Krav, SlackChannel, SlackUser, TeamResource, Varslingsadresse, VarslingsadresseQL } from '../../../constants'
import { getSlackChannelById, getSlackUserByEmail, getSlackUserById, usePersonSearch, useSlackChannelSearch } from '../../../api/TeamApi'
import React, { ReactNode, useEffect, useState } from 'react'
import { Block } from 'baseui/block'
import { Notification } from 'baseui/notification'
import * as yup from 'yup'
import { user } from '../../../services/User'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { FieldWrapper } from '../../common/Inputs'
import { FieldArray, FieldArrayRenderProps } from 'formik'
import { faSlackHash } from '@fortawesome/free-brands-svg-icons'
import { RenderTagList } from '../../common/TagList'
import LabelWithTooltip from '../../common/LabelWithTooltip'
import CustomizedInput from '../../common/CustomizedInput'
import { CustomizedStatefulSelect } from '../../common/CustomizedSelect'
import { Button, Loader, Modal } from '@navikt/ds-react'
import { EnvelopeClosedIcon, PersonIcon } from '@navikt/aksel-icons'
import AsyncSelect from 'react-select/async'

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

const AddModal = ({ isOpen, close, title, children, largeHeight }: { isOpen: boolean; close: () => void; title: string; children: ReactNode, largeHeight?: boolean }) => (
  <Modal open={isOpen} onClose={close} header={{heading: title}} width="medium">
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
    ; (async () => {
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
        return "Epost: " + v.adresse
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
    <div>
      <AsyncSelect
        aria-label="Søk etter slack-kanal"
        placeholder="Søk etter slack-kanal"
        noOptionsMessage={({ inputValue }) => (inputValue.length < 3 ? 'Skriv minst tre tegn for å søke' : `Fant ingen resultater for "${inputValue}"`)}
        controlShouldRenderValue={false}
        loadingMessage={() => 'Søker...'}
        isClearable={false}
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
            height: '48px'
          })
        }}
      />
    </div>
  )
}

export const SlackUserSearch = ({ add, close }: AddVarslingsadresseProps) => {
  const [slackSearch, setSlackSearch, loading] = usePersonSearch()
  const [error, setError] = useState('')
  const [loadingSlackId, setLoadingSlackId] = useState(false)

  const addEmail = (email: string) => {
    getSlackUserByEmail(email)
      .then((user) => {
        add({ type: AdresseType.SLACK_USER, adresse: user.id })
        close && close()
      })
      .catch((e) => {
        setError('Fant ikke slack for bruker')
        setLoadingSlackId(false)
      })
  }

  return (
    <Block display="flex" flexDirection="column">
      <Block display="flex">
        <CustomizedStatefulSelect
          placeholder={'Søk slack brukere'}
          maxDropdownHeight="400px"
          filterOptions={(o) => o}
          searchable
          noResultsMsg="Ingen resultat"
          getOptionLabel={(args) => (args.option as TeamResource).fullName}
          onFocus={() => setError('')}
          disabled={loadingSlackId}
          options={slackSearch}
          onChange={({ value }) => {
            const resource = value[0] as TeamResource
            if (resource) {
              setLoadingSlackId(true)
              addEmail(resource.email)
            }
          }}
          onInputChange={(event) => setSlackSearch(event.currentTarget.value)}
          isLoading={loading}
        />
        <Block>
          <Button type="button" onClick={() => addEmail(user.getEmail())} className="ml-2.5">
            Meg{' '}
          </Button>
        </Block>
      </Block>
      {loadingSlackId && <Loader size="large" />}
      {error && (
        <Notification kind="negative" overrides={{ Body: { style: { marginBottom: '-25px' } } }}>
          {error}
        </Notification>
      )}
    </Block>
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
    }
    close && close()
  }
  const onKey = (e: React.KeyboardEvent) => e.key === 'Enter' && add()
  return (
    <Block display="flex" flexDirection="column">
      <Block display="flex">
        <CustomizedInput onKeyDown={onKey} value={val} onFocus={() => setError('')} onChange={(e) => setVal((e.target as HTMLInputElement).value)} onBlur={() => add()} />
        <Block display="flex" justifyContent="space-between">
          <Button type="button" onClick={() => add(user.getEmail())} className="ml-2.5">
            Meg{' '}
          </Button>
          <Button type="button" onClick={() => add} className="ml-2.5">
            <FontAwesomeIcon icon={faPlus} />{' '}
          </Button>
        </Block>
      </Block>
      {error && (
        <Notification kind="negative" overrides={{ Body: { style: { marginBottom: '-25px' } } }}>
          {error}
        </Notification>
      )}
    </Block>
  )
}

export const slackChannelView = (channel: SlackChannel, long?: boolean) => `Slack: #${channel.name} ${long ? channel.numMembers : ''}`
