import { AdresseType, Krav, SlackChannel, SlackUser, TeamResource, Varslingsadresse, VarslingsadresseQL } from '../../../constants'
import { getSlackChannelById, getSlackUserByEmail, getSlackUserById, usePersonSearch, useSlackChannelSearch } from '../../../api/TeamApi'
import React, { ReactNode, useEffect, useState } from 'react'
import { Block } from 'baseui/block'
import { Spinner } from '../../common/Spinner'
import { theme } from '../../../util'
import { Notification } from 'baseui/notification'
import * as yup from 'yup'
import Button from '../../common/Button'
import { user } from '../../../services/User'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope, faPlus, faUser } from '@fortawesome/free-solid-svg-icons'
import { FieldWrapper } from '../../common/Inputs'
import { FieldArray, FieldArrayRenderProps } from 'formik'
import { FormControl } from 'baseui/form-control'
import { faSlackHash } from '@fortawesome/free-brands-svg-icons'
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'baseui/modal'
import { RenderTagList } from '../../common/TagList'
import LabelWithTooltip from '../../common/LabelWithTooltip'
import CustomizedInput from '../../common/CustomizedInput'
import { CustomizedStatefulSelect } from '../../common/CustomizedSelect'
import { borderColor, borderStyle, borderWidth } from '../../common/Style'
import { ettlevColors } from '../../../util/theme'

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
            <>
              <FormControl
                label={<LabelWithTooltip label={'Varslingsadresser'} tooltip={'Angi varslingskanal (slack og/eller epost) for spørsmål eller tilbakemeldinger til kravet.'} />}
              >
                <Block>
                  <Block marginBottom={theme.sizing.scale400}>
                    <Button
                      kind="secondary"
                      size="compact"
                      type="button"
                      onClick={() => setAddSlackChannel(true)}
                      $style={{
                        ...borderColor(p.form.errors['varslingsadresser'] ? ettlevColors.red600 : ettlevColors.green600),
                        ...borderStyle(p.form.errors['varslingsadresser'] ? 'solid' : 'solid'),
                        ...borderWidth(p.form.errors['varslingsadresser'] ? '2px' : '2px'),
                        backgroundColor: p.form.errors['varslingsadresser'] ? ettlevColors.red50 : 'inherit',
                      }}
                    >
                      <span>
                        <FontAwesomeIcon icon={faSlackHash} /> Legg til slack-kanal
                      </span>
                    </Button>
                    <Button
                      kind="secondary"
                      size="compact"
                      marginLeft
                      type="button"
                      onClick={() => setAddSlackUser(true)}
                      $style={{
                        ...borderColor(p.form.errors['varslingsadresser'] ? ettlevColors.red600 : ettlevColors.green600),
                        ...borderStyle(p.form.errors['varslingsadresser'] ? 'solid' : 'solid'),
                        ...borderWidth(p.form.errors['varslingsadresser'] ? '2px' : '2px'),
                        backgroundColor: p.form.errors['varslingsadresser'] ? ettlevColors.red50 : 'inherit',
                      }}
                    >
                      <span>
                        <FontAwesomeIcon icon={faUser} /> Legg til slack-bruker
                      </span>
                    </Button>
                    <Button
                      kind="secondary"
                      size="compact"
                      marginLeft
                      type="button"
                      onClick={() => setAddEmail(true)}
                      $style={{
                        ...borderColor(p.form.errors['varslingsadresser'] ? ettlevColors.red600 : ettlevColors.green600),
                        ...borderStyle(p.form.errors['varslingsadresser'] ? 'solid' : 'solid'),
                        ...borderWidth(p.form.errors['varslingsadresser'] ? '2px' : '2px'),
                        backgroundColor: p.form.errors['varslingsadresser'] ? ettlevColors.red50 : 'inherit',
                      }}
                    >
                      <span>
                        <FontAwesomeIcon icon={faEnvelope} /> Legg til epost
                      </span>
                    </Button>
                  </Block>
                  <VarslingsadresserTagList remove={p.remove} varslingsadresser={varslingsadresser} />
                </Block>
              </FormControl>

              <AddModal title="Legg til Slack kanal" isOpen={addSlackChannel} close={() => setAddSlackChannel(false)}>
                <SlackChannelSearch added={(p.form.values as Krav).varslingsadresser} add={push} close={() => setAddSlackChannel(false)} />
              </AddModal>

              <AddModal title="Legg til Slack bruker" isOpen={addSlackUser} close={() => setAddSlackUser(false)}>
                <SlackUserSearch added={(p.form.values as Krav).varslingsadresser} add={push} close={() => setAddSlackUser(false)} />
              </AddModal>

              <AddModal title="Legg til Epost adresse" isOpen={addEmail} close={() => setAddEmail(false)}>
                <AddEmail added={(p.form.values as Krav).varslingsadresser} add={push} close={() => setAddEmail(false)} />
              </AddModal>
            </>
          )
        }}
      </FieldArray>
    </FieldWrapper>
  )
}

const AddModal = ({ isOpen, close, title, children }: { isOpen: boolean; close: () => void; title: string; children: ReactNode }) => (
  <Modal closeable={false} unstable_ModalBackdropScroll isOpen={isOpen} onClose={close}>
    <ModalHeader>{title}</ModalHeader>
    <ModalBody>{children}</ModalBody>
    <ModalFooter>
      <Button kind="secondary" size="compact" type="button" onClick={close}>
        Avbryt
      </Button>
    </ModalFooter>
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
      wide
      list={varslingsadresser.map((v, i) => {
        if (v.type === AdresseType.SLACK) {
          const channel = slackChannels.find((c) => c.id === v.adresse)
          return <Block key={i}>{channel ? slackChannelView(channel) : `Slack: ${v.adresse}`}</Block>
        } else if (v.type === AdresseType.SLACK_USER) {
          const user = slackUsers.find((u) => u.id === v.adresse)
          return <Block key={i}>{user ? `Slack: ${user.name}` : `Slack: ${v.adresse}`}</Block>
        }
        return <Block key={i}>Epost: {v.adresse}</Block>
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
  const [slackSearch, setSlackSearch, loading] = useSlackChannelSearch()

  return (
    <CustomizedStatefulSelect
      placeholder={'Søk slack kanaler'}
      maxDropdownHeight="400px"
      filterOptions={(o) => o}
      searchable
      noResultsMsg="Ingen resultat"
      getOptionLabel={(args) => {
        const channel = args.option as SlackChannel
        return slackChannelView(channel, true)
      }}
      options={slackSearch.filter((ch) => !added || !added.find((va) => va.adresse === ch.id))}
      onChange={({ value }) => {
        const channel = value[0] as SlackChannel
        if (channel) add({ type: AdresseType.SLACK, adresse: channel.id })
        close && close()
      }}
      onInputChange={(event) => setSlackSearch(event.currentTarget.value)}
      isLoading={loading}
    />
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
          <Button type="button" onClick={() => addEmail(user.getEmail())} marginLeft>
            Meg{' '}
          </Button>
        </Block>
      </Block>
      {loadingSlackId && <Spinner size={theme.sizing.scale800} />}
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
          <Button type="button" onClick={() => add(user.getEmail())} marginLeft>
            Meg{' '}
          </Button>
          <Button type="button" onClick={add} marginLeft>
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
