'use client'

import {
  etterlevelseDokumentasjonMapToFormVal,
  getEtterlevelseDokumentasjon,
  updateEtterlevelseDokumentasjon,
} from '@/api/etterlevelseDokumentasjon/etterlevelseDokumentasjonApi'
import { TextAreaField } from '@/components/common/textAreaField/textAreaField'
import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { ExclamationmarkTriangleIcon } from '@navikt/aksel-icons'
import { Button, InfoCard, InlineMessage, Link, List, Modal } from '@navikt/ds-react'
import { Form, Formik } from 'formik'
import _ from 'lodash'
import { FunctionComponent, RefObject, useEffect, useRef, useState } from 'react'
import { gjenbrukDokumentasjonSchema } from './form/gjenbrukSchema'

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
          className='min-w-[1000px] px-5 py-5'
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
            {({ setFieldValue, submitForm, isSubmitting, initialValues, errors }) => (
              <Form>
                {(errors.title ||
                  errors.beskrivelse ||
                  errors.varslingsadresser ||
                  errors.teamsData ||
                  errors.resourcesData ||
                  errors.nomAvdelingId) && (
                  <InfoCard data-color='warning'>
                    <InfoCard.Header icon={<ExclamationmarkTriangleIcon aria-hidden />}>
                      <InfoCard.Title>
                        Dere må oppdatere følgende felt i dokumentegenskaper før dere kan slå på
                        gjenbruk.
                      </InfoCard.Title>
                    </InfoCard.Header>
                    <InfoCard.Content>
                      <List>
                        {Object.entries(errors)
                          .filter(([, error]) => error)
                          .map(([key, error]) => {
                            if (key !== 'gjenbrukBeskrivelse') {
                              return (
                                <List.Item key={key}>
                                  <Link
                                    href={`/dokumentasjon/edit/${etterlevelseDokumentasjon.id}#${key}`}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                  >
                                    {error as string} (åpner i en ny fane)
                                  </Link>
                                </List.Item>
                              )
                            }
                          })}
                      </List>
                    </InfoCard.Content>
                  </InfoCard>
                )}

                <Modal.Body>
                  <List as='ul' className='mb-5'>
                    <List.Item>
                      Når du tillater gjenbruk av dokumentet ditt, vil de som gjenbruker kunne arve
                      både veilending og svar, og bruke disse som utgangspunkt for sin egen
                      dokumentasjon.
                    </List.Item>
                    <List.Item>
                      De som gjenbruker er likevel ansvarlig for at etterlevelsen blir riktig.
                    </List.Item>
                  </List>
                  <TextAreaField
                    name='gjenbrukBeskrivelse'
                    label='Skriv veiledning som hjelper andre å forstå om de skal gjenbruke dette dokumentet'
                    height='150px'
                    markdown
                    noPlaceholder
                    caption={
                      <>Hvem skal gjenbruke? Ved hvilken type arbeid blir gjenbruk passende?</>
                    }
                  />

                  {etterlevelseDokumentasjon.tilgjengeligForGjenbruk && (
                    <InlineMessage status='info' className='mt-5'>
                      Det er alltid mulig ả slä av gjenbruk slik at muligheten ikke vises lenger.
                      Veiledning som dere har skrevet, vil fortsatt synes for dere og de som
                      allerede gjenbruker dokumentet. Etter hvert kan dere velge om dere vil slá pả
                      gjenbruk pả nytt.
                    </InlineMessage>
                  )}
                </Modal.Body>
                <Modal.Footer>
                  <Button
                    type='submit'
                    variant='primary'
                    disabled={isSubmitting}
                    onClick={async () => {
                      setSubmitClick(!submitClick)
                      await setFieldValue('tilgjengeligForGjenbruk', true)
                      await submitForm()
                    }}
                  >
                    {etterlevelseDokumentasjon.tilgjengeligForGjenbruk
                      ? 'Lagre endringene'
                      : 'Slå på gjenbruk'}
                  </Button>

                  {initialValues.tilgjengeligForGjenbruk &&
                    initialValues.gjenbrukBeskrivelse.length > 0 && (
                      <Button
                        type='button'
                        variant='secondary'
                        disabled={isSubmitting}
                        onClick={async () => {
                          setSubmitClick(!submitClick)
                          await setFieldValue('tilgjengeligForGjenbruk', false)
                          await submitForm()
                        }}
                      >
                        Slå av gjenbruk
                      </Button>
                    )}

                  <Button type='button' variant='secondary' onClick={() => {}}>
                    Lagre til senere
                  </Button>

                  <Button
                    type='button'
                    disabled={isSubmitting}
                    variant='tertiary'
                    onClick={() => setIsOpen(false)}
                  >
                    Avbryt
                  </Button>
                </Modal.Footer>
              </Form>
            )}
          </Formik>
        </Modal>
      )}
    </>
  )
}
export default TillatGjenbrukModal
