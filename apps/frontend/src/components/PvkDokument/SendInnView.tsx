import { BodyLong, FormSummary, Heading } from '@navikt/ds-react'
import { Field } from 'formik'
import { StepTitle } from '../../pages/PvkDokumentPage'

interface IProps {
  updateTitleUrlAndStep: (step: number) => void
}
export const SendInnView = (props: IProps) => {
  const { updateTitleUrlAndStep } = props
  return (
    <Field>
      {() => (
        <div>
          <Heading level="1" size="medium" className="mb-5">
            Les og send inn
          </Heading>
          <BodyLong>
            Her kan dere lese over det som er lagt inn i PVK-en. Hvis dere oppdager feil eller
            mangel, er det mulig å gå tilbake og endre svar. Til slutt er det plass til å legge til
            ytterligere informasjon dersom det er aktuelt.
          </BodyLong>

          <FormSummary className="my-3">
            <FormSummary.Header>
              <FormSummary.Heading level="2">{StepTitle[1]}</FormSummary.Heading>
              <FormSummary.EditLink onClick={() => updateTitleUrlAndStep(2)}>
                Endre svar
              </FormSummary.EditLink>
            </FormSummary.Header>
            <FormSummary.Answers>WIP</FormSummary.Answers>
          </FormSummary>

          <FormSummary className="my-3">
            <FormSummary.Header>
              <FormSummary.Heading level="2">{StepTitle[2]}</FormSummary.Heading>
              <FormSummary.EditLink onClick={() => updateTitleUrlAndStep(3)}>
                Endre svar
              </FormSummary.EditLink>
            </FormSummary.Header>
            <FormSummary.Answers>WIP</FormSummary.Answers>
          </FormSummary>
        </div>
      )}
    </Field>
  )
}

export default SendInnView
