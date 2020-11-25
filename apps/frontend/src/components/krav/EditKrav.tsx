import {Krav, KravStatus} from '../../constants'
import {Form, Formik} from 'formik'
import {createKrav, mapToFormVal, updateKrav} from '../../api/KravApi'
import {disableEnter} from '../common/Table'
import {Block} from 'baseui/block'
import Button from '../common/Button'
import React from 'react'
import * as yup from 'yup'
import {ListName} from '../../services/Codelist'
import {kravStatus} from '../../pages/KravPage'
import {InputField, MultiInputField, OptionField} from '../common/Inputs'

export const EditKrav = ({krav, close}: {krav: Krav, close: (k?: Krav) => void}) => {

  const submit = (krav: Krav) => {
    if (krav.id) {
      updateKrav(krav).then(k => close(k))
    } else {
      createKrav(krav).then(k => close(k))
    }
  }

  return (
    <Formik
      onSubmit={submit}
      initialValues={mapToFormVal(krav)}
      validationSchema={kravSchema()}
    >{() => (
      <Form onKeyDown={disableEnter}>
        <Block>

          <InputField label='Navn' name='navn'/>
          <InputField label='Beskrivelse' name='beskrivelse'/>
          <InputField label='Utdypende beskrivelse' name='utdypendeBeskrivelse'/>
          <InputField label='Hensikt' name='hensikt'/>

          <MultiInputField label='Dokumentasjon' name='dokumentasjon'/>
          <MultiInputField label='Relevante implementasjoner' name='implementasjoner'/>
          <MultiInputField label='Begreper' name='begreper'/>
          <MultiInputField label='Kontaktpersoner' name='kontaktPersoner'/>
          <MultiInputField label='Rettskilder' name='rettskilder'/>
          <MultiInputField label='Tagger' name='tagger'/>

          <InputField label='Avdeling' name='avdeling'/>
          <InputField label='Underavdeling' name='underavdeling'/>

          <OptionField label='Relevans for' name='relevansFor' listName={ListName.RELEVANS}/>
          <OptionField label='Status' name='status' options={Object.values(KravStatus).map(id => ({id, label: kravStatus(id)}))}/>

        </Block>

        <Block display='flex' justifyContent='flex-end'>
          <Button type='button' kind='secondary' marginRight onClick={close}>Avbryt</Button>
          <Button type='submit'>Lagre</Button>
        </Block>
      </Form>
    )}
    </Formik>
  )
}

const kravSchema = () => {
  return yup.object<Krav>()
}
