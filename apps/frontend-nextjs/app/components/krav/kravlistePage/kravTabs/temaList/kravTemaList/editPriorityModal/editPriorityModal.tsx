import {
  createKravPriorityList,
  updateKravPriorityList,
} from '@/api/krav/kravliste/kravPriorityList/kravPriorityList'
import { FieldWrapper } from '@/components/common/fieldWrapper/fieldWrapper'
import { IKrav } from '@/constants/krav/kravConstants'
import { IKravPriorityList } from '@/constants/krav/kravPriorityList/kravPriorityListConstants'
import { Button, Label, Loader, Modal } from '@navikt/ds-react'
import { FieldArray, FieldArrayRenderProps, Form, Formik } from 'formik'
import { useState } from 'react'
import { KravPriorityPanels } from '../kravPriorityPanels/kravPriorityPanels'

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
  const [loading, setLoading] = useState(false)

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
          width='80rem'
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
                <div className='flex justify-center'>
                  <Loader size='large' />
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

            <Modal.Footer className='button_container border-t-2 z-10 bg-white'>
              <Button
                type='button'
                onClick={() => {
                  submitForm()
                }}
                disabled={loading}
              >
                Lagre
              </Button>
              <Button
                className='ml-2.5'
                type='button'
                variant='secondary'
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
