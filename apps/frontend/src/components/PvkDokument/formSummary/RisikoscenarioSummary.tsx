import { FormSummary } from '@navikt/ds-react'
import { ExternalLink } from '../../common/RouteLink'

export const RisikoscenarioSummary = () => {
  const currentPath = window.location.pathname
  const risikoscenarioLink = currentPath.slice(0, -1) + '5'

  return (
    <FormSummary className="my-3">
      <FormSummary.Header>
        <FormSummary.Heading level="2">Risikoscenarioer og tiltak</FormSummary.Heading>
      </FormSummary.Header>
      <FormSummary.Answers>
        <FormSummary.Answer>
          <FormSummary.Value>
            <FormSummary.Answers>
              <FormSummary.Answer>
                <FormSummary.Label>Risikoscenarioer</FormSummary.Label>
                <FormSummary.Value>
                  Det er beskrevet totalt sett X risikoscenarioer.{' '}
                  <ExternalLink href={risikoscenarioLink + '?tab=risikoscenario'}>
                    Se alle risikoscenarioer
                  </ExternalLink>
                  .
                </FormSummary.Value>
              </FormSummary.Answer>
              <FormSummary.Answer>
                <FormSummary.Label>Tiltak</FormSummary.Label>
                <FormSummary.Value>
                  Det er beskrevet totalt sett Y tiltak.{' '}
                  <ExternalLink href={risikoscenarioLink + '?tab=tiltak'}>
                    Se alle tiltak
                  </ExternalLink>
                  .
                </FormSummary.Value>
              </FormSummary.Answer>
            </FormSummary.Answers>
          </FormSummary.Value>
        </FormSummary.Answer>
      </FormSummary.Answers>
    </FormSummary>
  )
}
export default RisikoscenarioSummary
