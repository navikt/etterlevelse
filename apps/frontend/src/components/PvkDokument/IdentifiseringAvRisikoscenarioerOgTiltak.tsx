import { Alert, BodyShort, Heading, List, ReadMore } from '@navikt/ds-react'
import CreateRisikoscenario from './edit/CreateRisikoscenario'
import CreateRisikoscenarioTiltak from './edit/CreateRisikoscenarioTiltak'
import FormButtons from './edit/FormButtons'

interface IProps {
  etterlevelseDokumentasjonId: string
  activeStep: number
  setActiveStep: (step: number) => void
}

export const IdentifiseringAvRisikoscenarioerOgTiltak = (props: IProps) => {
  const { etterlevelseDokumentasjonId, activeStep, setActiveStep } = props
  return (
    <div>
      <ReadMore header="Vis behandlingens livsløp">Her kommer Behandlingens livsløp.</ReadMore>

      <Heading level="1" size="medium" className="my-5">
        Identifisering av risikoscenarioer og tiltak
      </Heading>

      <BodyShort>
        I en PVK må dere vurdere sannsynligheten for at personvern ikke ivaretas på tilstrekkelig
        vis, og hvilke konsekvenser det vil gi. Hvor dette risikoscenarioet er av betydning, må dere
        identifisere forebyggende tiltak som reduserer risiko.
      </BodyShort>
      <Heading spacing size="small" level="3" className="mt-3">
        Slik gjør dere:
      </Heading>
      <List>
        <List.Item>
          Risikoscenarioer og tiltak som har tilknytning til etterlevelseskrav, må dere opprette på
          den aktuelle kravsiden. Se Temaoversikt med alle PVK-relaterte etterlevelseskrav (åpnes i
          et nytt vindu)
        </List.Item>
        <List.Item>
          Generelle risikoscenarioer og tiltak som ikke har en direkte tilknytning til
          etterlevelseskrav legger dere inn på denne siden.
        </List.Item>
      </List>
      <BodyShort>
        Vi anbefaler at dere vurderer etterlevelseskravene først, og beskriver generelle, resterende
        risikoscenarioer og tiltak deretter.
      </BodyShort>

      <Alert inline variant="info" className="mt-5">
        Hvis risikoscenarioer eller tiltak gjelder flere steder, kan dere finne og gjenbruke disse.
      </Alert>

      <Heading level="2" size="medium" className="mt-5">
        Generelle risikoscenarioer
      </Heading>

      {/* bare vis alert hvis det ikke finnes risikoscenarioer WIP*/}
      {/* <Alert variant="info" className="mt-10">
        Dere har ikke lagt inn noen generelle risikoscenarioer.
      </Alert> */}

      <CreateRisikoscenarioTiltak />

      <CreateRisikoscenario />

      <FormButtons
        etterlevelseDokumentasjonId={etterlevelseDokumentasjonId}
        activeStep={activeStep}
        setActiveStep={setActiveStep}
      />
    </div>
  )
}

export default IdentifiseringAvRisikoscenarioerOgTiltak
