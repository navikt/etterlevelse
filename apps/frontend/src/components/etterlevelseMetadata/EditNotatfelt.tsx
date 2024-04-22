import { FileTextIcon } from '@navikt/aksel-icons'
import { BodyShort, Button, Heading, Modal } from '@navikt/ds-react'
import { Form, Formik, FormikProps } from 'formik'
import React from 'react'
import {
  createEtterlevelseMetadata,
  updateEtterlevelseMetadata,
} from '../../api/EtterlevelseMetadataApi'
import { IEtterlevelseMetadata } from '../../constants'
import { useDebouncedState } from '../../util/hooks/customHooks'
import TextEditor from '../common/TextEditor/TextEditor'

type TEditNotatfeltProps = {
  isOpen: boolean
  setIsNotatfeltOpen: React.Dispatch<React.SetStateAction<boolean>>
  etterlevelseMetadata: IEtterlevelseMetadata
  setEtterlevelseMetadata: React.Dispatch<React.SetStateAction<IEtterlevelseMetadata>>
  formRef?: React.RefObject<any>
}

export const EditNotatfelt = ({
  isOpen,
  setIsNotatfeltOpen,
  etterlevelseMetadata,
  setEtterlevelseMetadata,
  formRef,
}: TEditNotatfeltProps) => {
  const debounceDelay = 500
  const [notater, setNotater] = useDebouncedState(etterlevelseMetadata.notater || '', debounceDelay)

  const submit = (values: IEtterlevelseMetadata) => {
    if (etterlevelseMetadata.id === 'ny') {
      createEtterlevelseMetadata({ ...values, notater: notater }).then((resp) => {
        setEtterlevelseMetadata(resp)
      })
    } else {
      updateEtterlevelseMetadata({ ...values, notater: notater }).then((resp) => {
        setEtterlevelseMetadata(resp)
      })
    }
    setIsNotatfeltOpen(false)
  }

  return (
    <Modal
      className="w-full max-w-4xl"
      open={isOpen}
      onClose={() => {
        setIsNotatfeltOpen(false)
      }}
      aria-label="Notat"
    >
      <Modal.Header>
        <div className="flex items-center">
          <FileTextIcon aria-label="" aria-hidden width="1.5rem" height="1.625rem" />
          <Heading level="2" size="small">
            Notat
          </Heading>
        </div>
      </Modal.Header>

      <Modal.Body>
        <Formik
          onSubmit={(values) => {
            submit(values)
          }}
          innerRef={formRef}
          validateOnChange={false}
          validateOnBlur={false}
          initialValues={etterlevelseMetadata}
        >
          {({ errors }: FormikProps<IEtterlevelseMetadata>) => (
            <Form>
              <div>
                <BodyShort className="mb-6">
                  Notatet er kun for internt bruk, og ikke en del av dokumentasjonen
                </BodyShort>

                <TextEditor
                  initialValue={notater}
                  setValue={setNotater}
                  height="21.875rem"
                  errors={errors}
                  simple
                />

                <div className="w-full flex justify-end mt-6">
                  <Button
                    type="button"
                    className="mr-4"
                    variant="secondary"
                    onClick={() => {
                      setNotater(etterlevelseMetadata.notater || '')
                      setIsNotatfeltOpen(false)
                    }}
                  >
                    Avbryt
                  </Button>
                  <Button type="submit">Lagre arbeidsnotat</Button>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </Modal.Body>
    </Modal>
  )
}
export default EditNotatfelt
