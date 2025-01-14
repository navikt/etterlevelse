import { BodyLong, Button, Heading } from '@navikt/ds-react'
import { Form, Formik } from 'formik'
import { mapPvkDokumentToFormValue } from '../../api/PvkDokumentApi'
import { IPvkDokument } from '../../constants'
import FormButtons from './edit/FormButtons'
import ArtOgOmFangSummary from './formSummary/ArtOgOmfangSummary'
import InnvolveringSummary from './formSummary/InnvolveringSummary'

interface IProps {
  pvkDokument: IPvkDokument
  updateTitleUrlAndStep: (step: number) => void
  personkategorier: string[]
  databehandlere: string[]
  etterlevelseDokumentasjonId: string
  activeStep: number
  setActiveStep: (step: number) => void
  setSelectedStep: (step: number) => void
}
export const SendInnView = (props: IProps) => {
  const {
    pvkDokument,
    updateTitleUrlAndStep,
    personkategorier,
    databehandlere,
    etterlevelseDokumentasjonId,
    activeStep,
    setActiveStep,
    setSelectedStep,
  } = props

  const submit = async (pvkDokument: IPvkDokument) => {
    console.debug('submited pvkdokument, pvkdokument: ', pvkDokument)
  }

  return (
    <Formik
      validateOnChange={false}
      validateOnBlur={false}
      onSubmit={submit}
      initialValues={mapPvkDokumentToFormValue(pvkDokument as IPvkDokument)}
    >
      {({ submitForm }) => (
        <Form>
          <div className="flex justify-center">
            <div>
              <Heading level="1" size="medium" className="mb-5">
                Les og send inn
              </Heading>
              <BodyLong>
                Her kan dere lese over det som er lagt inn i PVK-en. Hvis dere oppdager feil eller
                mangel, er det mulig å gå tilbake og endre svar. Til slutt er det plass til å legge
                til ytterligere informasjon dersom det er aktuelt.
              </BodyLong>

              <ArtOgOmFangSummary
                personkategorier={personkategorier}
                updateTitleUrlAndStep={updateTitleUrlAndStep}
              />

              <InnvolveringSummary
                databehandlere={databehandlere}
                personkategorier={personkategorier}
                updateTitleUrlAndStep={updateTitleUrlAndStep}
              />

              <div className="mt-5">
                <Button type="button" onClick={() => {}}>
                  Send til PVO
                </Button>
              </div>

              <FormButtons
                etterlevelseDokumentasjonId={etterlevelseDokumentasjonId}
                activeStep={activeStep}
                setActiveStep={setActiveStep}
                setSelectedStep={setSelectedStep}
                submitForm={submitForm}
              />
            </div>
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default SendInnView
