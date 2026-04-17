'use client'

import {
  etterlevelseDokumentasjonMapToFormVal,
  getEtterlevelseDokumentasjon,
  updateEtterlevelseDokumentasjon,
} from '@/api/etterlevelseDokumentasjon/etterlevelseDokumentasjonApi'
import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { isEmptyArray, isMissingText } from '@/util/common/validationUtils'
import { Button, Modal } from '@navikt/ds-react'
import { Form, Formik } from 'formik'
import _ from 'lodash'
import { FunctionComponent, RefObject, useEffect, useRef, useState } from 'react'
import { gjenbrukDokumentasjonSchema } from './form/gjenbrukSchema'
import { IkkeTilgjengeligForGjenbrukModal } from './ikkeTilgjengeligForGjenbrukModal/ikkeTilgjengeligForGjenbrukModal'
import { TilgjengeligForGjenbrukModal } from './tilgjengeligForGjenbrukModal/tilgjengeligForGjenbrukModal'

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  setEtterlevelseDokumentasjon: (e: TEtterlevelseDokumentasjonQL) => void
  isOpen?: boolean
  setIsOpen?: (open: boolean) => void
  renderTrigger?: boolean
}

export const TillatGjenbrukModal: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  setEtterlevelseDokumentasjon,
  isOpen: controlledIsOpen,
  setIsOpen: controlledSetIsOpen,
  renderTrigger = true,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const [submitClick, setSubmitClick] = useState<boolean>(false)

  const errorSummaryRef = useRef<HTMLDivElement>(null)
  const formRef: RefObject<any> = useRef(undefined)

  const isOpen = controlledIsOpen ?? internalIsOpen
  const setIsOpen = controlledSetIsOpen ?? setInternalIsOpen

  const submit = async (etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL) => {
    const updatedEtterlevelseDokumentajson = await getEtterlevelseDokumentasjon(
      etterlevelseDokumentasjon.id
    )
    const etterlevelseDokumentasjonWithGjenbrukData: TEtterlevelseDokumentasjonQL = {
      ...updatedEtterlevelseDokumentajson,
      tilgjengeligForGjenbruk: etterlevelseDokumentasjon.tilgjengeligForGjenbruk,
      gjenbrukBeskrivelse: etterlevelseDokumentasjon.gjenbrukBeskrivelse,
    }

    setEtterlevelseDokumentasjon(etterlevelseDokumentasjonWithGjenbrukData)
    await updateEtterlevelseDokumentasjon(etterlevelseDokumentasjonWithGjenbrukData).catch((e) =>
      console.debug(e)
    )
    setIsOpen(false)
  }

  useEffect(() => {
    if (!_.isEmpty(formRef.current.errors) && errorSummaryRef.current) {
      errorSummaryRef.current.focus()
    }
  }, [submitClick])

  if (!renderTrigger && !isOpen) {
    return null
  }

  return (
    <>
      {renderTrigger && (
        <Button
          size='small'
          variant='tertiary'
          className='whitespace-nowrap w-full justify-center'
          type='button'
          onClick={() => setIsOpen(true)}
        >
          {etterlevelseDokumentasjon.gjenbrukBeskrivelse &&
          etterlevelseDokumentasjon.tilgjengeligForGjenbruk
            ? 'Endre gjenbruk'
            : 'Slå på gjenbruk'}
        </Button>
      )}

      {isOpen && (
        <Modal
          className='min-w-250 px-5 py-5'
          open={isOpen}
          onClose={() => setIsOpen(false)}
          header={{
            heading: etterlevelseDokumentasjon.tilgjengeligForGjenbruk
              ? 'Endre gjenbruk av dette dokumentet'
              : 'Slå på gjenbruk av dette dokumentet',
            // icon: <FilesIcon title="header-ikon" />,
            closeButton: false,
          }}
        >
          <Formik
            initialValues={etterlevelseDokumentasjonMapToFormVal(
              etterlevelseDokumentasjon ? etterlevelseDokumentasjon : {}
            )}
            onSubmit={submit}
            innerRef={formRef}
            validationSchema={gjenbrukDokumentasjonSchema()}
            validateOnChange={false}
            validateOnBlur={false}
          >
            {({ setFieldValue, submitForm, isSubmitting, initialValues, values }) => {
              const hasMissingRequiredField =
                isMissingText(values.title) ||
                isMissingText(values.beskrivelse) ||
                isEmptyArray(values.varslingsadresser) ||
                isEmptyArray(values.teamsData) ||
                isEmptyArray(values.resourcesData) ||
                isMissingText(values.nomAvdelingId)

              return (
                <Form>
                  {etterlevelseDokumentasjon.tilgjengeligForGjenbruk && (
                    <TilgjengeligForGjenbrukModal
                      etterlevelseDokumentasjon={etterlevelseDokumentasjon}
                      values={values}
                      setIsOpen={setIsOpen}
                      setFieldValue={setFieldValue}
                      submitForm={submitForm}
                      isSubmitting={isSubmitting}
                      setSubmitClick={setSubmitClick}
                      initialValues={initialValues}
                    />
                  )}
                  {!etterlevelseDokumentasjon.tilgjengeligForGjenbruk && (
                    <IkkeTilgjengeligForGjenbrukModal
                      etterlevelseDokumentasjon={etterlevelseDokumentasjon}
                      values={values}
                      setIsOpen={setIsOpen}
                      setFieldValue={setFieldValue}
                      submitForm={submitForm}
                      isSubmitting={isSubmitting}
                      hasMissingRequiredField={hasMissingRequiredField}
                      setSubmitClick={setSubmitClick}
                      submit={submit}
                    />
                  )}
                </Form>
              )
            }}
          </Formik>
        </Modal>
      )}
    </>
  )
}
export default TillatGjenbrukModal
