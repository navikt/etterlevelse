import {Krav, KravStatus} from '../../constants'
import {Form, Formik} from 'formik'
import {createKrav, mapToFormVal, updateKrav} from '../../api/KravApi'
import {Block} from 'baseui/block'
import Button from '../common/Button'
import React from 'react'
import * as yup from 'yup'
import {ListName} from '../../services/Codelist'
import {kravStatus} from '../../pages/KravPage'
import {DateField, InputField, MultiInputField, MultiOptionField, OptionField, TextAreaField} from '../common/Inputs'
import axios from 'axios'
import {env} from '../../util/env'
import {KravVarslingsadresserEdit} from './Edit/KravVarslingsadresserEdit'
import {KravRegelverkEdit} from './Edit/KravRegelverkEdit'
import {KravSuksesskriterierEdit} from './Edit/KravSuksesskriterieEdit'

type EditKravProps = {
  krav: Krav,
  close: (k?: Krav) => void,
  formRef: React.Ref<any>
}

export const EditKrav = ({krav, close, formRef}: EditKravProps) => {
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
      innerRef={formRef}
    >{({isSubmitting, submitForm}) => (
      <Form>
        <Block>
          <InputField label='Navn' name='navn'/>
          <TextAreaField label='Hensikt' name='hensikt' markdown shortenLinks onImageUpload={onImageUpload(krav.id)}/>
          <KravSuksesskriterierEdit/>
          <TextAreaField label='Beskrivelse' name='beskrivelse' markdown shortenLinks onImageUpload={onImageUpload(krav.id)}/>

          <TextAreaField label='Utfyllende beskrivelse' name='utdypendeBeskrivelse' markdown shortenLinks onImageUpload={onImageUpload(krav.id)}/>
          <TextAreaField label='Endringer fra forrige versjon' name='versjonEndringer'/>

          <MultiInputField label='Dokumentasjon' name='dokumentasjon' link/>
          <KravRegelverkEdit/>
          <MultiInputField label='Rettskilder' name='rettskilder' link/>

          <MultiInputField label='Tagger' name='tagger'/>
          <MultiOptionField label='Kravet er relevant for' name='relevansFor' listName={ListName.RELEVANS}/>
          <MultiInputField label='Relevante implementasjoner' name='implementasjoner'/>
          <MultiInputField label='Begreper' name='begreper'/>

          <DateField label='Gyldig from' name='periode.start'/>
          <DateField label='Gyldig tom' name='periode.slutt'/>

          <OptionField label='Status' name='status' options={Object.values(KravStatus).map(id => ({id, label: kravStatus(id)}))}/>
          <KravVarslingsadresserEdit/>
          <OptionField label='Avdeling' name='avdeling' listName={ListName.AVDELING}/>
          <OptionField label='Underavdeling' name='underavdeling' listName={ListName.UNDERAVDELING}/>

        </Block>

        <Block display='flex' justifyContent='flex-end'>
          <Button type='button' kind='secondary' marginRight onClick={close}>Avbryt</Button>
          <Button type='button' disabled={isSubmitting} onClick={submitForm}>Lagre</Button>
        </Block>
      </Form>
    )}
    </Formik>
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
