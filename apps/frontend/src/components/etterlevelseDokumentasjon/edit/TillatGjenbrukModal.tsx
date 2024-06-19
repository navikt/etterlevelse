import { FilesIcon } from '@navikt/aksel-icons'
import { Button, List, Modal } from '@navikt/ds-react'
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
        header={{
          heading: 'Tilgjengeliggjør dette dokumentet til gjenbruk av andre',
          icon: <FilesIcon title="header-ikon" />,
          closeButton: false,
        }}
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
                <List as="ul" className="mb-5">
                  <List.Item>
                    Når du gjør dokumentet tilgjengelig, kan andre gjenbruke det.
                  </List.Item>
                  <List.Item>
                    De som gjenbruker dokumentet arver status og besvarelser på suksesskriterier.
                  </List.Item>
                </List>
                <TextAreaField
                  name="gjenbrukBeskrivelse"
                  label="Beskriv forutsetningene for gjenbruk av dette dokumentet ."
                  rows={5}
                  noPlaceholder
                  caption="Teksten blir vist for alle som skal gjenbruke dokumentet. Gi ikke kravspesifikk veiledning, da dette heller burde komme ved enkelte krav."
                />
              </Modal.Body>
              <Modal.Footer>
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
                <Button
                  type="button"
                  disabled={isSubmitting}
                  variant="secondary"
                  onClick={() => setIsOpen(false)}
                >
                  Avbryt
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
