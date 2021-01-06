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

  return (<Formik
      onSubmit={async (b: BehandlingEtterlevData) => close(await updateBehandling(b))}
      initialValues={mapToFormVal(behandling)}
      validationSchema={behandlingSchema()}
    >{({isSubmitting}) => (
      <Form onKeyDown={disableEnter}>
        <Block>
          <Label title='Endrer egenskaper for'>behandling {behandling.nummer}</Label>

          <MultiOptionField label='Relevans for' name='relevansFor' listName={ListName.RELEVANS}/>

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

const behandlingSchema = () => {
  return yup.object({})
}
