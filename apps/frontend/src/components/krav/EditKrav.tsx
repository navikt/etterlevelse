import {AdresseType, Krav, KravStatus, SlackChannel, SlackUser, Varslingsadresse, VarslingsadresseQL} from '../../constants'
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
import {getSlackChannelById, getSlackUserById} from '../../api/TeamApi'
import axios from 'axios'
import {env} from '../../util/env'
import {FormControl} from 'baseui/form-control'
import {RenderTagList} from '../common/TagList'
import {Modal, ModalBody, ModalFooter, ModalHeader} from 'baseui/modal'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faEnvelope, faUser} from '@fortawesome/free-solid-svg-icons'
import {theme} from '../../util'
import {faSlackHash} from '@fortawesome/free-brands-svg-icons'
import {AddEmail, SlackChannelSearch, slackChannelView, SlackUserSearch} from './Varslingsadresser'

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
              <SlackChannelSearch added={(p.form.values as Krav).varslingsadresser} add={p.push} close={() => setAddSlackChannel(false)}/>
            </AddModal>

            <AddModal title='Legg til Slack bruker' isOpen={addSlackUser} close={() => setAddSlackUser(false)}>
              <SlackUserSearch added={(p.form.values as Krav).varslingsadresser} add={p.push} close={() => setAddSlackUser(false)}/>
            </AddModal>

            <AddModal title='Legg til Epost adresse' isOpen={addEmail} close={() => setAddEmail(false)}>
              <AddEmail added={(p.form.values as Krav).varslingsadresser} add={p.push} close={() => setAddEmail(false)}/>
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

export const VarslingsadresserTagList = ({varslingsadresser, remove}: {
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
            return <Block key={i}>{channel ? slackChannelView(channel) : `Slack: ${v.adresse}`}</Block>
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
