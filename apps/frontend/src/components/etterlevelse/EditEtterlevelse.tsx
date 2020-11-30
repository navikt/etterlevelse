import {Etterlevelse, EtterlevelseStatus} from '../../constants'
import {Form, Formik} from 'formik'
import {createEtterlevelse, mapToFormVal, updateEtterlevelse} from '../../api/EtterlevelseApi'
import {disableEnter} from '../common/Table'
import {Block} from 'baseui/block'
import Button from '../common/Button'
import React from 'react'
import * as yup from 'yup'
import {etterlevelseStatus} from '../../pages/EtterlevelsePage'
import {BoolField, DateField, InputField, MultiInputField, OptionField, TextAreaField} from '../common/Inputs'
import {theme} from '../../util'

export const EditEtterlevelse = ({etterlevelse, close}: {etterlevelse: Etterlevelse, close: (k?: Etterlevelse) => void}) => {

  const submit = (etterlevelse: Etterlevelse) => {
    if (etterlevelse.id) {
      updateEtterlevelse(etterlevelse).then(k => close(k))
    } else {
      createEtterlevelse(etterlevelse).then(k => close(k))
    }
  }

  return (
    <Formik
      onSubmit={submit}
      initialValues={mapToFormVal(etterlevelse)}
      validationSchema={etterlevelseSchema()}
    >{() => (
      <Form onKeyDown={disableEnter}>
        <Block>

          <InputField label='Behandling' name='behandling'/>
          <InputField label='Krav-nummer' name='kravNummer'/>
          <InputField label='Krav-versjon' name='kravVersjon'/>

          <Block height={theme.sizing.scale600}/>

          <BoolField label='Etterleves' name='etterleves'/>
          <TextAreaField label='Begrunnelse' name='begrunnelse'/>
          <MultiInputField label='Dokumentasjon' name='dokumentasjon'/>

          <Block height={theme.sizing.scale600}/>

          <DateField label='Frist for ferdigstillelse' name='fristForFerdigstillelse'/>

          <Block height={theme.sizing.scale600}/>

          <OptionField label='Status' name='status' options={Object.values(EtterlevelseStatus).map(id => ({id, label: etterlevelseStatus(id)}))}/>

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

const etterlevelseSchema = () => {
  return yup.object<Etterlevelse>()
}
