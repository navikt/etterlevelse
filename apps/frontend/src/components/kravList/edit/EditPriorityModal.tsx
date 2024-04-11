import { Button, Label, Loader, Modal } from '@navikt/ds-react'
import { FieldArray, FieldArrayRenderProps, Form, Formik } from 'formik'
import React from 'react'
import { createKravPriorityList, updateKravPriorityList } from '../../../api/KravPriorityListApi'
import { IKrav, IKravPriorityList } from '../../../constants'
import { FieldWrapper } from '../../common/Inputs'
import { KravPriorityPanel } from './components/KravPriorityPanel'

interface IKravPriorityPanelsProps {
  fieldArrayRenderProps: FieldArrayRenderProps
}
const KravPriorityPanels = (props: IKravPriorityPanelsProps) => {
  const { fieldArrayRenderProps } = props

  const kravListe = fieldArrayRenderProps.form.values.krav as IKrav[]

  return kravListe.map((krav, index) => {
    return (
      <KravPriorityPanel
        key={`${krav.navn}_${krav.kravNummer}`}
        krav={krav}
        index={index}
        arrayLength={kravListe.length}
        fieldArrayRenderProps={fieldArrayRenderProps}
      />
    )
  })
}

export const EditPriorityModal = (props: {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  kravListe: IKrav[]
  tema: string
  temaCode: string
  kravPriorityList: IKravPriorityList
  refresh: () => void
}) => {
  const { isOpen, setIsOpen, kravListe, tema, temaCode, kravPriorityList, refresh } = props
  const [loading, setLoading] = React.useState(false)

  const submit = ({ krav }: { krav: IKrav[] }) => {
    setLoading(true)

    if (kravPriorityList.id) {
      ;(async () =>
        await updateKravPriorityList({
          id: kravPriorityList.id,
          temaId: temaCode,
          priorityList: krav.map((krav) => krav.kravNummer),
          changeStamp: kravPriorityList.changeStamp,
          version: kravPriorityList.version,
        }))()
        .then(() => {
          setLoading(false)
          refresh()
          setIsOpen(false)
        })
        .catch((error) => console.error(error))
    } else {
      ;(async () =>
        await createKravPriorityList({
          id: '',
          temaId: temaCode,
          priorityList: krav.map((krav) => krav.kravNummer),
          changeStamp: { lastModifiedDate: '', lastModifiedBy: '' },
          version: -1,
        }))()
        .then(() => {
          setLoading(false)
          refresh()
          setIsOpen(false)
        })
        .catch((error) => console.error(error))
    }
  }

  const close = () => {
    setIsOpen(false)
  }

  return (
    <Formik
      initialValues={{
        krav: kravListe,
      }}
      onSubmit={submit}
    >
      {({ submitForm, handleReset }) => (
        <Modal
          open={isOpen}
          width="80rem"
          onClose={() => {
            handleReset()
            close()
          }}
          header={{ heading: 'Endre rekkefølge på krav' }}
        >
          <Modal.Body>
            <Label>{tema}</Label>
            <div>
              {loading && (
                <div className="flex justify-center">
                  <Loader size="large" />
                </div>
              )}
              {!loading && kravListe && (
                <Form>
                  <FieldWrapper>
                    <FieldArray name={'krav'}>
                      {(fieldArrayRenderProps: FieldArrayRenderProps) => (
                        <KravPriorityPanels fieldArrayRenderProps={fieldArrayRenderProps} />
                      )}
                    </FieldArray>
                  </FieldWrapper>
                </Form>
              )}
            </div>

            <Modal.Footer className="button_container border-t-2 z-10 bg-bg-default">
              <Button
                type="button"
                onClick={() => {
                  submitForm()
                }}
                disabled={loading}
              >
                Lagre
              </Button>
              <Button
                className="ml-2.5"
                type="button"
                variant="secondary"
                onClick={() => {
                  refresh()
                  handleReset()
                  close()
                }}
                disabled={loading}
              >
                Avbryt
              </Button>
            </Modal.Footer>
          </Modal.Body>
        </Modal>
      )}
    </Formik>
  )
}
