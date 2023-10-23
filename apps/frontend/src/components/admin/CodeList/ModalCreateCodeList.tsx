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
import { Modal } from '@navikt/ds-react'

const modalBlockProps: BlockProps = {
  width: '700px',
  paddingRight: '2rem',
  paddingLeft: '2rem',
}

type ModalCreateProps = {
  title: string
  list: string
  modalRef: React.RefObject<HTMLDialogElement>
  errorOnCreate: any | undefined
  submit: (code: CodeListFormValues) => Promise<void>
  onClose: () => void
}

const CreateCodeListModal = ({ modalRef, title, list, errorOnCreate, onClose, submit }: ModalCreateProps) => {
  return (
    <Modal ref={modalRef} onClose={() => onClose()} header={{ heading: title }}>
      <div className="w-full max-w-2xl px-8">
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
              <Modal.Body>
                <div className="flex w-full mt-4 items-center">
                  <LabelMedium marginRight={'1rem'} width="25%">
                    Code:
                  </LabelMedium>
                  <Field name="code" render={({ field }: FieldProps) => <CustomizedInput {...field} type="input" size={InputSIZE.default} />} />
                </div>
                <Error fieldName="code" />

                <div className="flex w-full mt-4 items-center">
                  <LabelMedium marginRight={'1rem'} width="25%">
                    Short name:
                  </LabelMedium>
                  <Field name="shortName" render={({ field }: FieldProps) => <CustomizedInput {...field} type="input" size={InputSIZE.default} />} />
                </div>
                <Error fieldName="shortName" />

                <div className="flex w-full mt-4 items-center">
                  <LabelMedium marginRight={'1rem'} width="25%">
                    Description:
                  </LabelMedium>
                  <Field name="description" render={({ field }: FieldProps) => <CustomizedTextarea {...field} type="input" rows={10} />} />
                </div>
                <Error fieldName="description" />
                {(list === ListName.LOV || list === ListName.TEMA) && <MarkdownInfo />}

                {list === ListName.LOV && <LovCodeDataForm />}
                {list === ListName.TEMA && <TemaCodeDataForm />}
              </Modal.Body>
              <Modal.Footer>
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
                  {/* <ModalButton
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
                  </ModalButton> */}
                </Block>
              </Modal.Footer>
            </Form>
          )}
        </Formik>
      </div>
    </Modal>
  )
}

export default CreateCodeListModal
