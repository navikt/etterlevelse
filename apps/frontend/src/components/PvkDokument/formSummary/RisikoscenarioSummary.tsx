import { FormSummary } from '@navikt/ds-react'
import { IRisikoscenario, ITiltak } from '../../../constants'
import { ExternalLink } from '../../common/RouteLink'

interface IProps {
  alleRisikoscenario: IRisikoscenario[]
  alleTiltak: ITiltak[]
  customStepNumber?: number
}

export const RisikoscenarioSummary = (props: IProps) => {
  const { alleRisikoscenario, alleTiltak, customStepNumber } = props
  const currentPath = window.location.pathname
  const risikoscenarioLink = currentPath.slice(0, -1) + `${customStepNumber ? customStepNumber : 6}`

  return (
    <FormSummary className='my-3'>
      <FormSummary.Header>
        <FormSummary.Heading level='2'>Risikoscenarioer og tiltak</FormSummary.Heading>
      </FormSummary.Header>
      <FormSummary.Answers>
        <FormSummary.Answer>
          <FormSummary.Value>
            <FormSummary.Answers>
              <FormSummary.Answer>
                <FormSummary.Label>Risikoscenarioer</FormSummary.Label>
                <FormSummary.Value>
                  Det er beskrevet totalt sett {alleRisikoscenario.length} risikoscenarioer.{' '}
                  <ExternalLink href={risikoscenarioLink + '?tab=risikoscenarioer&filter=alle'}>
                    Se alle risikoscenarioer
                  </ExternalLink>
                  .
                </FormSummary.Value>
              </FormSummary.Answer>
              <FormSummary.Answer>
                <FormSummary.Label>Tiltak</FormSummary.Label>
                <FormSummary.Value>
                  Det er beskrevet totalt sett {alleTiltak.length} tiltak.{' '}
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
