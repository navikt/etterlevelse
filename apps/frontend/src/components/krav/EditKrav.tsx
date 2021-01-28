import {AdresseType, Krav, KravStatus, SlackChannel, Varslingsadresse} from '../../constants'
import {FieldArray, FieldArrayRenderProps, Form, Formik} from 'formik'
import {createKrav, mapToFormVal, updateKrav} from '../../api/KravApi'
import {disableEnter} from '../common/Table'
import {Block} from 'baseui/block'
import Button from '../common/Button'
import React, {useEffect, useState} from 'react'
import * as yup from 'yup'
import {ListName} from '../../services/Codelist'
import {kravStatus} from '../../pages/KravPage'
import {DateField, FieldWrapper, InputField, MultiInputField, MultiOptionField, OptionField, TextAreaField} from '../common/Inputs'
import {getSlackChannelById, useSlackChannelSearch} from '../../api/TeamApi'
import axios from 'axios'
import {env} from '../../util/env'
import {StatefulSelect} from 'baseui/select'
import {FormControl} from 'baseui/form-control'
import {RenderTagList} from '../common/TagList'
import {Modal, ModalBody, ModalHeader} from 'baseui/modal'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faPlus} from '@fortawesome/free-solid-svg-icons'
import {theme} from '../../util'

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

const channelDesc = (channel: SlackChannel, long?: boolean) => `Slack: #${channel?.name} ${long ? channel.num_members : ''}`

const Varslingsadresser = () => {
  const [addSlack, setAddSlack] = useState<boolean>(false)
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
                  <Button kind='secondary' size='compact' type='button' onClick={() => setAddSlack(true)}>
                    <span><FontAwesomeIcon icon={faPlus}/> Legg til slack-kanal</span>
                  </Button>
                  <Button kind='secondary' size='compact' marginLeft type='button' onClick={() => setAddEmail(true)}>
                    <span><FontAwesomeIcon icon={faPlus}/> Legg til epost</span>
                  </Button>
                </Block>
                <VarslingsadresserTagList remove={p.remove} varslingsadresser={varslingsadresser}/>
              </Block>
            </FormControl>

            <Modal unstable_ModalBackdropScroll isOpen={addSlack} onClose={() => setAddSlack(false)}>
              <ModalHeader>
                Legg til Slack kanal
              </ModalHeader>
              <ModalBody>
                <SlackChannelSearch p={p} close={() => setAddSlack(false)}/>
              </ModalBody>
            </Modal>

          </Block>
        }
        }
      </FieldArray>
    </FieldWrapper>
  )
}

const VarslingsadresserTagList = ({varslingsadresser, remove}: {
  varslingsadresser: Varslingsadresse[],
  remove: (i: number) => void
}) => {
  const [slackChannels, setSlackChannels] = useState<SlackChannel[]>([])

  useEffect(() => {
    (async () => {
      const channels = await Promise.all(
        varslingsadresser
        .filter(va => va.type === AdresseType.SLACK)
        .filter(va => !slackChannels.find(sc => sc.id === va.adresse))
        .map(c => getSlackChannelById(c.adresse))
      )
      setSlackChannels([...slackChannels, ...channels])
    })()
  }, [varslingsadresser])

  return (
    <RenderTagList
      wide
      list={varslingsadresser.map((v, i) => {
          if (v.type === AdresseType.SLACK) {
            const channel = slackChannels.find(c => c.id === v.adresse)
            return <Block key={i}>{channel ? channelDesc(channel) : `Slack: ${v.adresse}`}</Block>
          }
          return <Block key={i}>Epost: {v.adresse}</Block>
        }
      )}
      onRemove={remove}
    />
  )
}

const SlackChannelSearch = ({p, close}: {
  p: FieldArrayRenderProps,
  close: () => void
}) => {
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
        return channelDesc(channel, true)
      }}

      options={slackSearch}
      onChange={({value}) => {
        const channel = value[0] as SlackChannel
        p.push({type: AdresseType.SLACK, adresse: channel.id})
        close()
      }}
      onInputChange={event => setSlackSearch(event.currentTarget.value)}
      isLoading={loading}
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
