import * as React from 'react'
import { Modal, ModalBody, ModalButton, ModalFooter, ModalHeader, ROLE, SIZE } from 'baseui/modal'

import { Field, FieldProps, Form, Formik, FormikProps } from 'formik'

import { Button, KIND } from 'baseui/button'
import { Block, BlockProps } from 'baseui/block'
import { LabelMedium } from 'baseui/typography'
import { SIZE as InputSIZE } from 'baseui/input'
import { CodeListFormValues, codeListSchema, ListName } from '../../../services/Codelist'
import { Error } from '../../common/ModalSchema'
import { LovCodeDataForm, TemaCodeDataForm } from './LovCode'
import { MarkdownInfo } from '../../common/Markdown'
import CustomizedInput from '../../common/CustomizedInput'
import CustomizedTextarea from '../../common/CustomizedTextarea'
import { buttonContentStyle } from '../../common/Button'

const modalBlockProps: BlockProps = {
  width: '700px',
  paddingRight: '2rem',
  paddingLeft: '2rem',
}

const rowBlockProps: BlockProps = {
  display: 'flex',
  width: '100%',
  marginTop: '1rem',
  alignItems: 'center',
}

type ModalUpdateProps = {
  title: string
  initialValues: CodeListFormValues
  isOpen: boolean
  errorOnUpdate: any | undefined
  onClose: () => void
  submit: (process: CodeListFormValues) => Promise<void>
}

const UpdateCodeListModal = ({ title, initialValues, errorOnUpdate, isOpen, onClose, submit }: ModalUpdateProps) => {
  return (
    <Modal onClose={onClose} closeable={false} isOpen={isOpen} animate autoFocus size={SIZE.auto} role={ROLE.dialog}>
      <Block {...modalBlockProps}>
        <Formik
          onSubmit={(values) => {
            submit(values)
            onClose()
          }}
          initialValues={{ ...initialValues }}
          validationSchema={codeListSchema}
        >
          {(formik: FormikProps<CodeListFormValues>) => (
            <Form>
              <ModalHeader>{title}</ModalHeader>
              <ModalBody>
                <Block {...rowBlockProps}>
                  <LabelMedium marginRight={'1rem'} width="25%">
                    Short name:
                  </LabelMedium>
                  <Field name="shortName">
                    {({ field }: FieldProps<CodeListFormValues>) => (
                      <CustomizedInput name="shortName" value={formik.values.shortName} onChange={formik.handleChange} type="input" size={InputSIZE.default} />
                    )}
                  </Field>
                </Block>
                <Error fieldName="shortName" />

                <Block {...rowBlockProps}>
                  <LabelMedium marginRight={'1rem'} width="25%">
                    Description:
                  </LabelMedium>
                  <Field name="description">
                    {({ field }: FieldProps<CodeListFormValues>) => (
                      <CustomizedTextarea name="description" value={formik.values.description} onChange={formik.handleChange} type="input" rows={10} />
                    )}
                  </Field>
                </Block>
                <Error fieldName="description" />
                {(initialValues.list === ListName.LOV || initialValues.list === ListName.TEMA) && <MarkdownInfo />}

                {initialValues.list === ListName.LOV && <LovCodeDataForm />}
                {initialValues.list === ListName.TEMA && <TemaCodeDataForm />}
              </ModalBody>
              <ModalFooter>
                <Block display="flex" justifyContent="flex-end">
                  <Block marginRight="auto">{errorOnUpdate && <p>{errorOnUpdate}</p>}</Block>
                  <Button
                    type="button"
                    kind={KIND.secondary}
                    onClick={() => onClose()}
                    overrides={{
                      BaseButton: {
                        style: {
                          ...buttonContentStyle,
                        },
                      },
                    }}
                  >
                    <strong>Avbryt</strong>
                  </Button>
                  <ModalButton
                    type="button"
                    onClick={formik.submitForm}
                    overrides={{
                      BaseButton: {
                        style: {
                          ...buttonContentStyle,
                        },
                      },
                    }}
                  >
                    <strong>Lagre</strong>
                  </ModalButton>
                </Block>
              </ModalFooter>
            </Form>
          )}
        </Formik>
      </Block>
    </Modal>
  )
}

export default UpdateCodeListModal
