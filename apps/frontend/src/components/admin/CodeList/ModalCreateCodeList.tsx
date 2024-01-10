import { Field, FieldProps, Form, Formik } from 'formik'
import { EListName, ELovCodeRelevans, ICodeListFormValues, codeListSchema } from '../../../services/Codelist'
import { MarkdownInfo } from '../../common/Markdown'
import { Error } from '../../common/ModalSchema'
import { LovCodeDataForm } from './LovCode'

import { BodyShort, Button, Label, Modal, TextField, Textarea } from '@navikt/ds-react'

type TModalCreateProps = {
  title: string
  list: string
  isOpen: boolean
  errorOnCreate: any | undefined
  submit: (code: ICodeListFormValues) => Promise<void>
  onClose: () => void
}

const CreateCodeListModal = ({ isOpen, title, list, errorOnCreate, onClose, submit }: TModalCreateProps) => {
  return (
    <Modal className="w-full max-w-2xl px-8" open={isOpen} onClose={() => onClose()} header={{ heading: title }}>
      <div>
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
              data: {
                relevantFor: ELovCodeRelevans.KRAV_OG_VIRKEMIDDEL,
              },
            } as ICodeListFormValues
          }
          validationSchema={codeListSchema}
        >
          {({ submitForm }) => (
            <Form>
              <Modal.Body>
                <div className="flex w-full mt-4 items-center">
                  <Label className="mr-4 w-1/4">Code:</Label>
                  <Field name="code" render={({ field }: FieldProps) => <TextField {...field} className="w-full" label="Code" hideLabel />} />
                </div>
                <Error fieldName="code" />

                <div className="flex w-full mt-4 items-center">
                  <Label className="mr-4 w-1/4">Short name:</Label>
                  <Field name="shortName" render={({ field }: FieldProps) => <TextField {...field} className="w-full" label="Short name" hideLabel />} />
                </div>
                <Error fieldName="shortName" />

                <div className="flex w-full mt-4 items-center">
                  <Label className="mr-4 w-1/4">Description:</Label>
                  <Field name="description" render={({ field }: FieldProps) => <Textarea {...field} className="w-full" label="Description" minRows={10} hideLabel />} />
                </div>
                <Error fieldName="description" />
                {(list === EListName.LOV || list === EListName.TEMA) && <MarkdownInfo />}

                {list === EListName.LOV && <LovCodeDataForm />}
                {/* {list === ListName.TEMA && <TemaCodeDataForm />} */}
              </Modal.Body>
              <Modal.Footer>
                <div className="flex justify-end">
                  <div className="mr-auto">{errorOnCreate && <BodyShort>{errorOnCreate}</BodyShort>}</div>
                  <Button type="button" variant="secondary" className="mr-4" onClick={() => onClose()}>
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
}

export default CreateCodeListModal
