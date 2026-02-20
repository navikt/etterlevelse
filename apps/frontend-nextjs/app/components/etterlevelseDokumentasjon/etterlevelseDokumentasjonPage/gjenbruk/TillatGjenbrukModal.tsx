'use client'

import {
  etterlevelseDokumentasjonMapToFormVal,
  getEtterlevelseDokumentasjon,
  updateEtterlevelseDokumentasjon,
} from '@/api/etterlevelseDokumentasjon/etterlevelseDokumentasjonApi'
import { TextAreaField } from '@/components/common/textAreaField/textAreaField'
import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { Button, List, Modal } from '@navikt/ds-react'
import { Form, Formik } from 'formik'
import { FunctionComponent, useState } from 'react'
import { gjenbrukDokumentasjonSchema } from './form/gjenbrukSchema'

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  setEtterlevelseDokumentasjon: (e: TEtterlevelseDokumentasjonQL) => void
}

export const TillatGjenbrukModal: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  setEtterlevelseDokumentasjon,
}) => {
  const [isOpen, setIsOpen] = useState(false)

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

  return (
    <div>
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

      {isOpen && (
        <Modal
          className='min-w-[1000px] px-5 py-5'
          open={isOpen}
          onClose={() => setIsOpen(false)}
          header={{
            heading: etterlevelseDokumentasjon.tilgjengeligForGjenbruk
              ? 'Rediger gjenbruk av dette dokumentet'
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
            validationSchema={gjenbrukDokumentasjonSchema()}
            validateOnChange={false}
            validateOnBlur={false}
          >
            {({ setFieldValue, submitForm, isSubmitting, initialValues }) => (
              <Form>
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
                </Modal.Body>
                <Modal.Footer>
                  <Button
                    type='submit'
                    variant='primary'
                    disabled={isSubmitting}
                    onClick={() => {
                      setFieldValue('tilgjengeligForGjenbruk', true)
                      submitForm()
                    }}
                  >
                    {etterlevelseDokumentasjon.tilgjengeligForGjenbruk
                      ? 'Lagre veiledning'
                      : 'Slå på gjenbruk'}
                  </Button>
                  <Button
                    type='button'
                    disabled={isSubmitting}
                    variant='secondary'
                    onClick={() => setIsOpen(false)}
                  >
                    Avbryt
                  </Button>
                  {initialValues.tilgjengeligForGjenbruk &&
                    initialValues.gjenbrukBeskrivelse.length > 0 && (
                      <Button
                        type='button'
                        variant='danger'
                        disabled={isSubmitting}
                        onClick={() => {
                          setFieldValue('tilgjengeligForGjenbruk', false)
                          submitForm()
                        }}
                      >
                        Slutt å tillate gjenbruk
                      </Button>
                    )}
                </Modal.Footer>
              </Form>
            )}
          </Formik>
        </Modal>
      )}
    </div>
  )
}
export default TillatGjenbrukModal
