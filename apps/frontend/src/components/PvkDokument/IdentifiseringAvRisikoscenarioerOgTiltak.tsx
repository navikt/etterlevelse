import { Alert, BodyShort, Button, Heading, List, ReadMore } from '@navikt/ds-react'

export const IdentifiseringAvRisikoscenarioerOgTiltak = () => {
  return (
    <div>
      <ReadMore header="Vis behandlingens livsløp">Her kommer Behandlingens livsløp.</ReadMore>

      <Heading level="1" size="medium" className="mb-5">
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

      {/* bare hvis vis det ikke finnes risikoscenarioer */}
      <Alert variant="info" className="mt-10">
        Dere har ikke lagt inn noen generelle risikoscenarioer.
      </Alert>

      <Button variant="secondary" className="mt-5">
        Opprett nytt generelt risikoscenario
      </Button>
    </div>
  )
}

export default IdentifiseringAvRisikoscenarioerOgTiltak
