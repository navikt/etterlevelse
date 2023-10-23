import { Field, FieldProps, Form, Formik, FormikProps } from 'formik'

import { CodeListFormValues, codeListSchema, ListName } from '../../../services/Codelist'
import { Error } from '../../common/ModalSchema'
import { LovCodeDataForm, TemaCodeDataForm } from './LovCode'
import { MarkdownInfo } from '../../common/Markdown'
import { BodyShort, Button, Label, Modal, TextField, Textarea } from '@navikt/ds-react'

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
    <Modal onClose={onClose} open={isOpen} header={{ heading: title }}>
      <div className="px-8 w-full max-w-2xl">
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
              <Modal.Body>
                <div className="flex w-full mt-4 items-center">
                  <Label className="mr-4 w-1/4">
                    Short name:
                  </Label>
                  <Field name="shortName">
                    {({ field }: FieldProps) => (
                      <TextField className="w-full" label="shortName" hideLabel {...field} />
                    )}
                  </Field>
                </div>
                <Error fieldName="shortName" />

                <div className="flex w-full mt-4 items-center">
                  <Label className="mr-4 w-1/4">
                    Description:
                  </Label>
                  <Field name="description">
                    {({ field }: FieldProps) => (
                      <Textarea label="description" hideLabel className="w-full" {...field} minRows={10} />
                    )}
                  </Field>
                </div>
                <Error fieldName="description" />
                {(initialValues.list === ListName.LOV || initialValues.list === ListName.TEMA) && <MarkdownInfo />}

                {initialValues.list === ListName.LOV && <LovCodeDataForm />}
                {initialValues.list === ListName.TEMA && <TemaCodeDataForm />}
              </Modal.Body>
              <Modal.Footer>
                <div className="flex justify-end">
                  <div className="mr-auto" >{errorOnUpdate && <BodyShort>{errorOnUpdate}</BodyShort>}</div>
                  <Button
                    type="button"
                    variant="secondary"
                    className="mr-4"
                    onClick={() => onClose()}
                  >
                    Avbryt
                  </Button>
                  <Button
                    type="button"
                    onClick={formik.submitForm}
                  >
                    Lagre
                  </Button>
                </div>
              </Modal.Footer>
            </Form>
          )}
        </Formik>
      </div>
    </Modal>
  )
}

export default UpdateCodeListModal
