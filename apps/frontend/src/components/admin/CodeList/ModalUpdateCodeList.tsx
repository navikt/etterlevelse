import { BodyShort, Button, Modal, TextField, Textarea } from '@navikt/ds-react'
import { Field, FieldProps, Form, Formik, FormikProps } from 'formik'
import { EListName, ICodeListFormValues, codeListSchema } from '../../../services/Codelist'
import { MarkdownInfo } from '../../common/Markdown'
import { FormError } from '../../common/ModalSchema'
import { LovCodeDataForm } from './LovCode'

type TModalUpdateProps = {
  title: string
  initialValues: ICodeListFormValues
  isOpen: boolean
  errorOnUpdate: any | undefined
  onClose: () => void
  submit: (process: ICodeListFormValues) => Promise<void>
}

const UpdateCodeListModal = ({
  title,
  initialValues,
  errorOnUpdate,
  isOpen,
  onClose,
  submit,
}: TModalUpdateProps) => (
  <Modal
    className="px-8 w-full max-w-2xl"
    onClose={onClose}
    open={isOpen}
    header={{ heading: title, closeButton: initialValues.list === EListName.LOV ? true : false }}
  >
    <Formik
      validateOnChange={false}
      validateOnBlur={false}
      onSubmit={(values) => {
        submit(values)
        onClose()
      }}
      initialValues={{ ...initialValues }}
      validationSchema={codeListSchema}
    >
      {(formik: FormikProps<ICodeListFormValues>) => (
        <Form>
          <Modal.Body>
            <Field name="shortName">
              {({ field }: FieldProps) => (
                <TextField
                  className="w-full"
                  label="Navn"
                  {...field}
                  error={formik.errors.shortName && <FormError fieldName="shortName" />}
                />
              )}
            </Field>

            <Field name="description">
              {({ field }: FieldProps) => (
                <Textarea
                  className="w-full mt-4"
                  label="Beskrivelse"
                  {...field}
                  minRows={10}
                  error={formik.errors.description && <FormError fieldName="description" />}
                />
              )}
            </Field>

            {(initialValues.list === EListName.LOV || initialValues.list === EListName.TEMA) && (
              <MarkdownInfo />
            )}

            {initialValues.list === EListName.LOV && <LovCodeDataForm />}
          </Modal.Body>
          <Modal.Footer>
            <div className="flex justify-end">
              <div className="mr-auto">
                {errorOnUpdate && <BodyShort>{errorOnUpdate}</BodyShort>}
              </div>
              <Button type="button" variant="secondary" className="mr-4" onClick={() => onClose()}>
                Avbryt
              </Button>
              <Button type="button" onClick={formik.submitForm}>
                Lagre
              </Button>
            </div>
          </Modal.Footer>
        </Form>
      )}
    </Formik>
  </Modal>
)

export default UpdateCodeListModal
