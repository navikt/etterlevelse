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

const channelDesc = (channel: SlackChannel) => `#${channel?.name} ${channel.num_members}`

const Varslingsadresser = () => {
  const [slackChannels, setSlackChannels] = useState<SlackChannel[]>([])

  return (
    <FieldWrapper>
      <FieldArray name='varslingsadresser'>
        {(p: FieldArrayRenderProps) => {
          const varslingsadresser = (p.form.values as Krav).varslingsadresser
          return <Block>
            <FormControl label='Varslingsadresser'>
              <SlackChannelSearch
                slackChannels={varslingsadresser.filter(va => va.type === AdresseType.SLACK)}
                p={p} addSlackChannel={channel => setSlackChannels([...slackChannels, channel])
              }/>
            </FormControl>
            {varslingsadresser.map((v, i) => {
                if (v.type === AdresseType.SLACK) {
                  const channel = slackChannels.find(c => c.id === v.adresse)
                  return <Block key={i}>{channel ? channelDesc(channel) : `Slack: ${v.adresse}`}</Block>
                }
                return <Block>{v.adresse}</Block>
              }
            )}
          </Block>
        }
        }
      </FieldArray>
    </FieldWrapper>
  )
}

const SlackChannelSearch = ({slackChannels, p, addSlackChannel}: {slackChannels: Varslingsadresse[], p: FieldArrayRenderProps, addSlackChannel: (c: SlackChannel) => void}) => {
  const [slackSearch, setSlackSearch, loading] = useSlackChannelSearch()

  useEffect(() => {
    slackChannels.forEach(c => getSlackChannelById(c.adresse).then(addSlackChannel))
  }, [])

  return (
    <StatefulSelect
      placeholder={'Søk slack kanaler'}
      maxDropdownHeight='400px'
      filterOptions={o => o}
      searchable
      noResultsMsg='Ingen resultat'
      getOptionLabel={args => {
        const channel = args.option as SlackChannel
        return channelDesc(channel)
      }}

      options={slackSearch}
      onChange={({value}) => {
        const channel = value[0] as SlackChannel
        p.push({type: AdresseType.SLACK, adresse: channel.id})
        addSlackChannel(channel)
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
