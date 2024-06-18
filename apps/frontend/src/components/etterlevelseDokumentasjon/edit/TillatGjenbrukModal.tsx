import { BodyLong, Button, Modal } from '@navikt/ds-react'
import { Form, Formik } from 'formik'
import { useState } from 'react'
import {
  etterlevelseDokumentasjonMapToFormVal,
  etterlevelseDokumentasjonSchema,
  getEtterlevelseDokumentasjon,
  updateEtterlevelseDokumentasjon,
} from '../../../api/EtterlevelseDokumentasjonApi'
import { TEtterlevelseDokumentasjonQL } from '../../../constants'
import { TextAreaField } from '../../common/Inputs'

interface IProps {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  setEtterlevelseDokumentasjon: (e: TEtterlevelseDokumentasjonQL) => void
}

export const TillatGjenbrukModal = (props: IProps) => {
  const { etterlevelseDokumentasjon, setEtterlevelseDokumentasjon } = props

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
        size="small"
        variant="tertiary"
        className="whitespace-nowrap mt-5"
        type="button"
        onClick={() => setIsOpen(true)}
      >
        Tillat gjenbruk
      </Button>

      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        header={{ heading: 'Tilgjengeliggjør dette dokumentet for gjenbruk', closeButton: false }}
      >
        <Formik
          initialValues={etterlevelseDokumentasjonMapToFormVal(
            etterlevelseDokumentasjon ? etterlevelseDokumentasjon : {}
          )}
          onSubmit={submit}
          validationSchema={etterlevelseDokumentasjonSchema()}
          validateOnChange={false}
          validateOnBlur={false}
        >
          {({ values, setFieldValue, submitForm, isSubmitting }) => (
            <Form>
              <Modal.Body>
                <BodyLong className="mb-5">
                  Kort beskrivelse av det som vil skje nå ved at du gjør dette. Når du gjør dette
                  kan andre bygge sine egne vurderinger på dine. Det kan være lurt å sørge for at
                  dokumentets navn gjør at folk kjenner den igjen og bla bla bla.
                </BodyLong>
                <TextAreaField
                  name="gjenbrukBeskrivelse"
                  label="Beskriv forutsetninger for gjenbruk av dette dokumentet. Dette vil andre lese ved at de oppretter bla bla bla barnedokument (valgfritt)"
                  rows={5}
                  noPlaceholder
                  caption="Ikke gå inn i spesifikt krav, men skriv noe overordnet du :) "
                />
              </Modal.Body>
              <Modal.Footer>
                <Button
                  type="button"
                  disabled={isSubmitting}
                  variant="secondary"
                  onClick={() => setIsOpen(false)}
                >
                  Avbryt
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  disabled={isSubmitting}
                  onClick={() => {
                    setFieldValue('tilgjengeligForGjenbruk', true)
                    submitForm()
                  }}
                >
                  Bekreft gjenbruk
                </Button>
                {values.tilgjengeligForGjenbruk && (
                  <Button
                    type="button"
                    variant="danger"
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
    </div>
  )
}

export default TillatGjenbrukModal
