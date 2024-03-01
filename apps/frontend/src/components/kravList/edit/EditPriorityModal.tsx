import { Button, Label, Loader, Modal } from '@navikt/ds-react'
import { FieldArray, FieldArrayRenderProps, Form, Formik } from 'formik'
import React from 'react'
import {
  createKravPriority,
  kravMapToKravPrioriting,
  updateKravPriority,
} from '../../../api/KravPriorityApi'
import { IKrav } from '../../../constants'
import { FieldWrapper } from '../../common/Inputs'
import { KravPriorityPanel } from './components/KravPriorityPanel'

export const kravListPriorityModal = () => document.querySelector('#krav-list-edit-priority-modal')

interface IKravPriorityPanelsProps {
  p: FieldArrayRenderProps
}
const KravPriorityPanels = (props: IKravPriorityPanelsProps) => {
  const { p } = props

  const kravListe = p.form.values.krav as IKrav[]

  return kravListe.map((k, i) => {
    return (
      <KravPriorityPanel
        key={`${k.navn}_${k.kravNummer}`}
        krav={k}
        index={i}
        arrayLength={kravListe.length}
        p={p}
      />
    )
  })
}

export const EditPriorityModal = (props: {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  kravListe: IKrav[]
  tema: string
  refresh: () => void
}) => {
  const { isOpen, setIsOpen, kravListe, tema, refresh } = props
  const [loading, setLoading] = React.useState(false)

  const setPriority = (kravListe: IKrav[]) => {
    const pattern = new RegExp(tema.substr(0, 3).toUpperCase() + '[0-9]+')

    return kravListe.map((k, i) => {
      const index: number = i + 1
      if (!k.prioriteringsId) {
        return {
          ...k,
          prioriteringsId: tema.substr(0, 3).toUpperCase() + index,
        }
      } else {
        if (k.prioriteringsId?.match(pattern)) {
          return {
            ...k,
            prioriteringsId: k.prioriteringsId.replace(
              pattern,
              tema.substr(0, 3).toUpperCase() + index
            ),
          }
        } else {
          return {
            ...k,
            prioriteringsId: k.prioriteringsId.concat(tema.substr(0, 3).toUpperCase() + index),
          }
        }
      }
    })
  }

  const submit = ({ krav }: { krav: IKrav[] }) => {
    setLoading(true)
    const updateKravPriorityPromise: Promise<any>[] = []
    const kravMedPrioriteting = setPriority([...krav])
    kravMedPrioriteting.forEach((kmp) => {
      if (kmp.kravPriorityUID) {
        updateKravPriorityPromise.push(
          (async () => await updateKravPriority(kravMapToKravPrioriting(kmp)))()
        )
      } else {
        updateKravPriorityPromise.push(
          (async () => await createKravPriority(kravMapToKravPrioriting(kmp)))()
        )
      }
    })
    try {
      Promise.all(updateKravPriorityPromise).then(() => {
        setLoading(false)
        refresh()
        setIsOpen(false)
      })
    } catch (error: any) {
      console.error(error)
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
          width={'1280px'}
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
                    <FieldArray name={'krav'}>{(p) => <KravPriorityPanels p={p} />}</FieldArray>
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
