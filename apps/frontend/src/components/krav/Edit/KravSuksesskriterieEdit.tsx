import {FieldWrapper} from '../../common/Inputs'
import {FieldArray} from 'formik'
import React from 'react'
import {Krav} from '../../../constants'
import {FormControl} from 'baseui/form-control'
import {FormikProps} from 'formik/dist/types'
import {Block} from 'baseui/block'
import {Notification} from 'baseui/notification'


export const KravSuksesskriterierEdit = () => {

  return (
    <FieldWrapper>
      <FieldArray name={'suksesskriterier'}>
        {(p) => {
          const form = p.form as FormikProps<Krav>
          return (
            <FormControl label={'Suksesskriterier'}>
              <Block>
                <Notification kind={'warning'}>Kommer snart ;)</Notification>
                {form.values.suksesskriterier.map((s, i) => {
                  return (
                    <Block>
                      {s.id}: {s.navn}
                    </Block>
                  )
                })}
              </Block>
            </FormControl>
          )
        }}
      </FieldArray>
    </FieldWrapper>
  )
}
