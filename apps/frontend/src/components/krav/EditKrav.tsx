import {AdresseType, Krav, KravStatus, SlackChannel, SlackUser, TeamResource, Varslingsadresse, VarslingsadresseQL} from '../../constants'
import {FieldArray, FieldArrayRenderProps, Form, Formik} from 'formik'
import {createKrav, mapToFormVal, updateKrav} from '../../api/KravApi'
import {disableEnter} from '../common/Table'
import {Block} from 'baseui/block'
import Button from '../common/Button'
import React, {ReactNode, useEffect, useState} from 'react'
import * as yup from 'yup'
import {ListName} from '../../services/Codelist'
import {kravStatus} from '../../pages/KravPage'
import {DateField, FieldWrapper, InputField, MultiInputField, MultiOptionField, OptionField, TextAreaField} from '../common/Inputs'
import {getSlackChannelById, getSlackUserByEmail, getSlackUserById, usePersonSearch, useSlackChannelSearch} from '../../api/TeamApi'
import axios from 'axios'
import {env} from '../../util/env'
import {StatefulSelect} from 'baseui/select'
import {FormControl} from 'baseui/form-control'
import {RenderTagList} from '../common/TagList'
import {Modal, ModalBody, ModalFooter, ModalHeader} from 'baseui/modal'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faEnvelope, faPlus, faUser} from '@fortawesome/free-solid-svg-icons'
import {theme} from '../../util'
import {Input} from 'baseui/input'
import {user} from '../../services/User'
import {Notification} from 'baseui/notification'
import {faSlackHash} from '@fortawesome/free-brands-svg-icons'
import {Spinner} from '../common/Spinner'

type EditKravProps = {
  krav: Krav,
  close: (k?: Krav) => void,
  formRef: React.Ref<any>
}

export const EditKrav = ({krav, close}: EditKravProps) => {
  const submit = async (krav: Krav) => {
    if (krav.id) {
      close(await updateKrav(krav))
    } else {
      close(await createKrav(krav))
    }
  }

  return (
    <Formik
      onSubmit={submit}
      initialValues={mapToFormVal(krav)}
      validationSchema={kravSchema()}
    >{({isSubmitting}) => (
      <Form onKeyDown={disableEnter}>
        <Block>
          <InputField label='Navn' name='navn'/>
          <TextAreaField label='Hensikt' name='hensikt'/>
          <TextAreaField label='Beskrivelse' name='beskrivelse' markdown shortenLinks onImageUpload={onImageUpload(krav.id)}/>

          <TextAreaField label='Utfyllende beskrivelse' name='utdypendeBeskrivelse' markdown shortenLinks onImageUpload={onImageUpload(krav.id)}/>
          <TextAreaField label='Endringer fra forrige versjon' name='versjonEndringer'/>
          <MultiInputField label='Dokumentasjon' name='dokumentasjon'/>
          <MultiInputField label='Rettskilder' name='rettskilder'/>

          <MultiInputField label='Tagger' name='tagger'/>
          <MultiOptionField label='Kravet er relevant for' name='relevansFor' listName={ListName.RELEVANS}/>
          <MultiInputField label='Relevante implementasjoner' name='implementasjoner'/>
          <MultiInputField label='Begreper' name='begreper'/>

          <DateField label='Gyldig from' name='periode.start'/>
          <DateField label='Gyldig tom' name='periode.slutt'/>

          <OptionField label='Status' name='status' options={Object.values(KravStatus).map(id => ({id, label: kravStatus(id)}))}/>
          <Varslingsadresser/>
          <OptionField label='Avdeling' name='avdeling' listName={ListName.AVDELING}/>
          <OptionField label='Underavdeling' name='underavdeling' listName={ListName.UNDERAVDELING}/>

        </Block>

        <Block display='flex' justifyContent='flex-end'>
          <Button type='button' kind='secondary' marginRight onClick={close}>Avbryt</Button>
          <Button type='submit' disabled={isSubmitting}>Lagre</Button>
        </Block>
      </Form>
    )}
    </Formik>
  )
}

const channelDesc = (channel: SlackChannel, long?: boolean) => `Slack: #${channel.name} ${long ? channel.numMembers : ''}`

const Varslingsadresser = () => {
  const [addSlackChannel, setAddSlackChannel] = useState<boolean>(false)
  const [addSlackUser, setAddSlackUser] = useState<boolean>(false)
  const [addEmail, setAddEmail] = useState<boolean>(false)

  return (
    <FieldWrapper>
      <FieldArray name='varslingsadresser'>
        {(p: FieldArrayRenderProps) => {
          const varslingsadresser = (p.form.values as Krav).varslingsadresser
          return <Block>
            <FormControl label='Varslingsadresser'>
              <Block>
                <Block marginBottom={theme.sizing.scale400}>
                  <Button kind='secondary' size='compact' type='button' onClick={() => setAddSlackChannel(true)}>
                    <span><FontAwesomeIcon icon={faSlackHash}/> Legg til slack-kanal</span>
                  </Button>
                  <Button kind='secondary' size='compact' marginLeft type='button' onClick={() => setAddSlackUser(true)}>
                    <span><FontAwesomeIcon icon={faUser}/> Legg til slack-bruker</span>
                  </Button>
                  <Button kind='secondary' size='compact' marginLeft type='button' onClick={() => setAddEmail(true)}>
                    <span><FontAwesomeIcon icon={faEnvelope}/> Legg til epost</span>
                  </Button>
                </Block>
                <VarslingsadresserTagList remove={p.remove} varslingsadresser={varslingsadresser}/>
              </Block>
            </FormControl>

            <AddModal title='Legg til Slack kanal' isOpen={addSlackChannel} close={() => setAddSlackChannel(false)}>
              <SlackChannelSearch p={p} close={() => setAddSlackChannel(false)}/>
            </AddModal>

            <AddModal title='Legg til Slack bruker' isOpen={addSlackUser} close={() => setAddSlackUser(false)}>
              <SlackUserSearch p={p} close={() => setAddSlackUser(false)}/>
            </AddModal>

            <AddModal title='Legg til Epost adresse' isOpen={addEmail} close={() => setAddEmail(false)}>
              <AddEmail p={p} close={() => setAddEmail(false)}/>
            </AddModal>

          </Block>
        }
        }
      </FieldArray>
    </FieldWrapper>
  )
}

const AddModal = ({isOpen, close, title, children}: {isOpen: boolean, close: () => void, title: string, children: ReactNode}) =>
  <Modal unstable_ModalBackdropScroll isOpen={isOpen} onClose={close}>
    <ModalHeader>
      {title}
    </ModalHeader>
    <ModalBody>
      {children}
    </ModalBody>
    <ModalFooter>
      <Button kind='secondary' size='compact' type='button' onClick={close}>
        Avbryt
      </Button>
    </ModalFooter>
  </Modal>

const VarslingsadresserTagList = ({varslingsadresser, remove}: {
  varslingsadresser: Varslingsadresse[],
  remove: (i: number) => void
}) => {
  const [slackChannels, setSlackChannels] = useState<SlackChannel[]>([])
  const [slackUsers, setSlackUsers] = useState<SlackUser[]>([])

  useEffect(() => {
    (async () => {
      const loadedChannels: SlackChannel[] = []
      const loadedUsers: SlackUser[] = []
      const channels = await Promise.all(
        varslingsadresser
        .filter(va => va.type === AdresseType.SLACK)
        .filter(va => !slackChannels.find(sc => sc.id === va.adresse))
        .filter(va => {
          const vas = va as VarslingsadresseQL
          if (vas.slackChannel) {
            loadedChannels.push(vas.slackChannel)
            return false
          }
          return true
        })
        .map(c => getSlackChannelById(c.adresse))
      )

      const users = await Promise.all(
        varslingsadresser
        .filter(va => va.type === AdresseType.SLACK_USER)
        .filter(va => !slackUsers.find(u => u.id === va.adresse))
        .filter(va => {
          const vas = va as VarslingsadresseQL
          if (vas.slackUser) {
            loadedUsers.push(vas.slackUser)
            return false
          }
          return true
        })
        .map(c => getSlackUserById(c.adresse))
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
            const channel = slackChannels.find(c => c.id === v.adresse)
            return <Block key={i}>{channel ? channelDesc(channel) : `Slack: ${v.adresse}`}</Block>
          } else if (v.type === AdresseType.SLACK_USER) {
            const user = slackUsers.find(u => u.id === v.adresse)
            return <Block key={i}>{user ? `Slack: ${user.name}` : `Slack: ${v.adresse}`}</Block>
          }
          return <Block key={i}>Epost: {v.adresse}</Block>
        }
      )}
      onRemove={remove}
    />
  )
}

type AddVarslingsadresseProps = {p: FieldArrayRenderProps, close: () => void}

const SlackChannelSearch = ({p, close}: AddVarslingsadresseProps) => {
  const [slackSearch, setSlackSearch, loading] = useSlackChannelSearch()

  const added = (p.form.values as Krav).varslingsadresser

  return (
    <StatefulSelect
      placeholder={'Søk slack kanaler'}
      maxDropdownHeight='400px'
      filterOptions={o => o}
      searchable
      noResultsMsg='Ingen resultat'
      getOptionLabel={args => {
        const channel = args.option as SlackChannel
        return channelDesc(channel, true)
      }}

      options={slackSearch.filter(ch => !added.find(va => va.adresse === ch.id))}
      onChange={({value}) => {
        const channel = value[0] as SlackChannel
        if (channel) p.push({type: AdresseType.SLACK, adresse: channel.id})
        close()
      }}
      onInputChange={event => setSlackSearch(event.currentTarget.value)}
      isLoading={loading}
    />
  )
}

const SlackUserSearch = ({p, close}: AddVarslingsadresseProps) => {
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
              p.push({type: AdresseType.SLACK_USER, adresse: user.id})
              close()
            }).catch(e => {
              setError('Fant ikke slack for bruker')
              setLoadingSlackId(false)
            })
        }}
        onInputChange={event => setSlackSearch(event.currentTarget.value)}
        isLoading={loading}
      />
      {loadingSlackId && <Spinner size={theme.sizing.scale800}/> }
      {error && <Notification kind='negative' overrides={{Body: {style: {marginBottom: '-25px'}}}}>
        {error}
      </Notification>
      }
    </Block>
  )
}

const emailValidator = yup.string().email()

const AddEmail = ({p, close}: AddVarslingsadresseProps) => {
  const [val, setVal] = useState('')
  const [error, setError] = useState('')
  const add = (adresse?: string) => {
    const toAdd = adresse || val
    if (!toAdd) return
    const added = (p.form.values as Krav).varslingsadresser
    if (!added.find(va => va.adresse === toAdd)) {
      if (!emailValidator.isValidSync(toAdd)) {
        setError('Ugyldig epostadress')
        return
      }
      p.push({type: AdresseType.EPOST, adresse: toAdd})
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

const onImageUpload = (kravId: string) => async (file: File) => {
  const config = {headers: {'content-type': 'multipart/form-data'}}
  const formData = new FormData()
  formData.append('file', file)
  const id = (await axios.post<string[]>(`${env.backendBaseUrl}/krav/${kravId}/files`, formData, config)).data[0]

  return `/api/krav/${kravId}/files/${id}`
}

const kravSchema = () => {
  return yup.object({})
}
