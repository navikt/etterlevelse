import { BodyLong, ReadMore } from '@navikt/ds-react'
import { FunctionComponent } from 'react'
import { IRisikoscenario, ITiltak } from '../../../constants'
import TiltakView from '../../tiltak/TiltakView'

type TProps = {
  risikoscenario: IRisikoscenario
  tiltakList: ITiltak[]
  allRisikoscenarioList: IRisikoscenario[]
}

type TContentProps = {
  tiltak: ITiltak
  allRisikoscenarioList: IRisikoscenario[]
}

export const TiltakReadMoreListModalEdit: FunctionComponent<TProps> = ({
  risikoscenario,
  tiltakList,
  allRisikoscenarioList,
}) => {
  return (
    <div>
      {risikoscenario.ingenTiltak && <BodyLong>Vi skal ikke ha tiltak.</BodyLong>}
      {!risikoscenario.ingenTiltak && risikoscenario.tiltakIds.length !== 0 && (
        <div className='mt-5'>
          {tiltakList
            .filter((tiltak: ITiltak) => risikoscenario.tiltakIds.includes(tiltak.id))
            .map((tiltak: ITiltak, index: number) => (
              <TiltakReadMoreContent
                key={`${risikoscenario.id}_${tiltak.id}_${index}`}
                tiltak={tiltak}
                allRisikoscenarioList={allRisikoscenarioList}
              />
            ))}
        </div>
      )}
    </div>
  )
}

export const TiltakReadMoreContent: FunctionComponent<TContentProps> = ({
  tiltak,
  allRisikoscenarioList,
}) => {
  return (
    <ReadMore header={tiltak.navn} className='mb-3'>
      <TiltakView tiltak={tiltak} risikoscenarioList={allRisikoscenarioList} />
    </ReadMore>
  )
}

export default TiltakReadMoreListModalEdit
