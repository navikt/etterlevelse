import React from 'react'
import {Block} from 'baseui/block'
import {Behandling, BehandlingEtterlevData} from '../../constants'
import {mapToFormVal, updateBehandling} from '../../api/BehandlingApi'
import {Label} from '../common/PropertyLabel'
import {MultiOptionField} from '../common/Inputs'
import {ListName} from '../../services/Codelist'
import {Form, Formik} from 'formik'
import {disableEnter} from '../common/Table'
import * as yup from 'yup'
import Button from '../common/Button'


export const EditBehandling = ({behandling, close}: {behandling: Behandling, close: (behandling?: BehandlingEtterlevData) => void}) => {

  const submit = (b: BehandlingEtterlevData) => {
    updateBehandling(b).then(k => close(k))
  }

  return (<Formik
      onSubmit={submit}
      initialValues={mapToFormVal(behandling)}
      validationSchema={behandlingSchema()}
    >{() => (
      <Form onKeyDown={disableEnter}>
        <Block>
          <Label title='Navn'>{behandling.navn}</Label>
          <Label title='Nummer'>{behandling.nummer}</Label>
          <Label title='Overordnet formål'>{behandling.overordnetFormaal.shortName}</Label>

          <MultiOptionField label='Relevans for' name='relevansFor' listName={ListName.RELEVANS}/>

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

const behandlingSchema = () => {
  return yup.object<BehandlingEtterlevData>()
}
