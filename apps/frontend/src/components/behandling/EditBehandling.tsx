import React from 'react'
import {Block} from 'baseui/block'
import {Behandling, BehandlingEtterlevData} from '../../constants'
import {mapToFormVal, updateBehandling} from '../../api/BehandlingApi'
import {Label} from '../common/PropertyLabel'
import {MultiOptionField} from '../common/Inputs'
import {ListName} from '../../services/Codelist'
import {Form, Formik} from 'formik'
import * as yup from 'yup'
import Button from '../common/Button'

type EditBehProps = {
  behandling: Behandling
  close: (behandling?: BehandlingEtterlevData) => void
  formRef: React.Ref<any>
}

export const EditBehandling = ({behandling, close, formRef}: EditBehProps) => {
  return (
    <Formik
      onSubmit={async (b: BehandlingEtterlevData) =>
        close(await updateBehandling(b))
      }
      initialValues={mapToFormVal(behandling)}
      validationSchema={behandlingSchema()}
      innerRef={formRef}
    >
      {({isSubmitting, isValid, errors, submitForm}) => (
        <Form>
          <Block>
            <Label title="Endrer egenskaper for">
              behandling {behandling.nummer}
            </Label>

            <MultiOptionField
              label="Relevans for"
              name="relevansFor"
              listName={ListName.RELEVANS}
            />
          </Block>

          <Block display="flex" justifyContent="flex-end">
            <Block>{!isValid && JSON.stringify(errors)}</Block>
            <Button type="button" kind="secondary" marginRight onClick={close}>
              Avbryt
            </Button>
            <Button type="button" disabled={isSubmitting} onClick={submitForm}>
              Lagre
            </Button>
          </Block>
        </Form>
      )}
    </Formik>
  )
}

const behandlingSchema = () => {
  return yup.object({})
}
