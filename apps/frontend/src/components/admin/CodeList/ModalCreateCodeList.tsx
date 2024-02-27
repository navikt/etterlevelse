import { BodyShort, Button, Modal, TextField, Textarea } from '@navikt/ds-react'
import { Field, FieldProps, Form, Formik } from 'formik'
import {
  EListName,
  ELovCodeRelevans,
  ICodeListFormValues,
  codeListSchema,
} from '../../../services/Codelist'
import { MarkdownInfo } from '../../common/Markdown'
import { FormError } from '../../common/ModalSchema'
import { LovCodeDataForm } from './LovCode'

type TModalCreateProps = {
  title: string
  list: string
  isOpen: boolean
  errorOnCreate: any | undefined
  submit: (code: ICodeListFormValues) => Promise<void>
  onClose: () => void
}

const ModalCreateCodeList = ({
  isOpen,
  title,
  list,
  errorOnCreate,
  onClose,
  submit,
}: TModalCreateProps) => (
  <Modal
    className="w-full max-w-2xl px-8"
    open={isOpen}
    onClose={() => onClose()}
    header={{ heading: title, closeButton: false }}
  >
    <div>
      <Formik
        validateOnBlur={false}
        validateOnMount={false}
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
            data: {
              relevantFor: ELovCodeRelevans.KRAV_OG_VIRKEMIDDEL,
            },
          } as ICodeListFormValues
        }
        validationSchema={codeListSchema}
      >
        {({ errors, submitForm }) => (
          <Form>
            <Modal.Body>
              <Field
                name="code"
                render={({ field }: FieldProps) => (
                  <TextField
                    {...field}
                    className="w-full"
                    label="Kode"
                    error={errors.code && <FormError fieldName="code" />}
                  />
                )}
              />

              <Field
                name="shortName"
                render={({ field }: FieldProps) => (
                  <TextField
                    {...field}
                    className="w-full mt-4"
                    label="Navn"
                    error={errors.shortName && <FormError fieldName="shortName" />}
                  />
                )}
              />

              <Field
                name="description"
                render={({ field }: FieldProps) => (
                  <Textarea
                    {...field}
                    className="w-full mt-4"
                    label="Beskrivelse"
                    minRows={10}
                    error={errors.description && <FormError fieldName="description" />}
                  />
                )}
              />

              {(list === EListName.LOV || list === EListName.TEMA) && <MarkdownInfo />}

              {list === EListName.LOV && <LovCodeDataForm />}
              {/* {list === ListName.TEMA && <TemaCodeDataForm />} */}
            </Modal.Body>
            <Modal.Footer>
              <div className="flex justify-end">
                <div className="mr-auto">
                  {errorOnCreate && <BodyShort>{errorOnCreate}</BodyShort>}
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  className="mr-4"
                  onClick={() => onClose()}
                >
                  Avbryt
                </Button>
                <Button type="button" onClick={submitForm}>
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

export default ModalCreateCodeList
