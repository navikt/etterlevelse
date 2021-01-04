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
import {DateField, InputField, MultiInputField, MultiOptionField, MultiSearchField, OptionField, TextAreaField} from '../common/Inputs'
import {usePersonSearch} from '../../api/TeamApi'
import {PersonName} from '../common/PersonName'

export const EditKrav = ({krav, close}: {krav: Krav, close: (k?: Krav) => void}) => {
  const personSearch = usePersonSearch()

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
          <TextAreaField label='Hensikt' name='hensikt'/>
          <TextAreaField label='Beskrivelse' name='beskrivelse' markdown/>

          <TextAreaField label='Utfyllende beskrivelse' name='utdypendeBeskrivelse' markdown/>
          <MultiInputField label='Dokumentasjon' name='dokumentasjon'/>
          <MultiInputField label='Rettskilder' name='rettskilder'/>

          <MultiInputField label='Tagger' name='tagger'/>
          <MultiOptionField label='Kravet er relevant for' name='relevansFor' listName={ListName.RELEVANS}/>
          <MultiInputField label='Relevante implementasjoner' name='implementasjoner'/>
          <MultiInputField label='Begreper' name='begreper'/>

          <DateField label='Gyldig from' name='periode.start'/>
          <DateField label='Gyldig tom' name='periode.slutt'/>

          <OptionField label='Status' name='status' options={Object.values(KravStatus).map(id => ({id, label: kravStatus(id)}))}/>
          <MultiSearchField label='Kontaktpersoner' name='kontaktPersoner' search={personSearch} itemLabel={(id) => <PersonName ident={id}/>}/>
          <OptionField label='Avdeling' name='avdeling' listName={ListName.AVDELING}/>
          <OptionField label='Underavdeling' name='underavdeling' listName={ListName.UNDERAVDELING}/>

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
