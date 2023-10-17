import * as React from 'react'
import { Modal, ModalBody, ModalButton, ModalFooter, ModalHeader, ROLE, SIZE } from 'baseui/modal'
import { Block, BlockProps } from 'baseui/block'
import { LabelMedium } from 'baseui/typography'
import { Field, FieldProps, Form, Formik } from 'formik'
import { SIZE as InputSIZE } from 'baseui/input'
import { Button, KIND } from 'baseui/button'
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

type ModalCreateProps = {
  title: string
  list: string
  isOpen: boolean
  errorOnCreate: any | undefined
  submit: (code: CodeListFormValues) => Promise<void>
  onClose: () => void
}

const CreateCodeListModal = ({ isOpen, title, list, errorOnCreate, onClose, submit }: ModalCreateProps) => {
  return (
    <Modal closeable={false} animate autoFocus size={SIZE.auto} role={ROLE.dialog} isOpen={isOpen} onClose={() => onClose()}>
      <Block {...modalBlockProps}>
        <Formik
          onSubmit={(values) => {
            submit(values)
            onClose()
          }}
          initialValues={
            {
              list: list,
              code: '',
              shortName: '',
              description: '',
              data: {},
            } as CodeListFormValues
          }
          validationSchema={codeListSchema}
        >
          {({ submitForm }) => (
            <Form>
              <ModalHeader>{title}</ModalHeader>
              <ModalBody>
                <Block {...rowBlockProps}>
                  <LabelMedium marginRight={'1rem'} width="25%">
                    Code:
                  </LabelMedium>
                  <Field name="code" render={({ field }: FieldProps) => <CustomizedInput {...field} type="input" size={InputSIZE.default} />} />
                </Block>
                <Error fieldName="code" />

                <Block {...rowBlockProps}>
                  <LabelMedium marginRight={'1rem'} width="25%">
                    Short name:
                  </LabelMedium>
                  <Field name="shortName" render={({ field }: FieldProps) => <CustomizedInput {...field} type="input" size={InputSIZE.default} />} />
                </Block>
                <Error fieldName="shortName" />

                <Block {...rowBlockProps}>
                  <LabelMedium marginRight={'1rem'} width="25%">
                    Description:
                  </LabelMedium>
                  <Field name="description" render={({ field }: FieldProps) => <CustomizedTextarea {...field} type="input" rows={10} />} />
                </Block>
                <Error fieldName="description" />
                {(list === ListName.LOV || list === ListName.TEMA) && <MarkdownInfo />}

                {list === ListName.LOV && <LovCodeDataForm />}
                {list === ListName.TEMA && <TemaCodeDataForm />}
              </ModalBody>
              <ModalFooter>
                <Block display="flex" justifyContent="flex-end">
                  <Block marginRight="auto">{errorOnCreate && <p>{errorOnCreate}</p>}</Block>
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
                    onClick={submitForm}
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

export default CreateCodeListModal
