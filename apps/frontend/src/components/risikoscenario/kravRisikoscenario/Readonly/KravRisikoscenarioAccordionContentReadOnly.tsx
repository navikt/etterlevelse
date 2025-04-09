import { BodyShort, ReadMore } from '@navikt/ds-react'
import { FunctionComponent, useState } from 'react'
import { IRisikoscenario, ITiltak } from '../../../../constants'
import TiltakView from '../../../tiltak/TiltakView'
import RisikoscenarioViewReadOnly from '../../RisikoscenarioViewReadOnly'
import { RisikoscenarioTiltakHeader } from '../../common/KravRisikoscenarioHeaders'
import KravRisikoscenarioIngenTiltak from '../KravRisikoscenarioIngenTiltak/KravRisikoscenarioIngenTiltak'

type TProps = {
  risikoscenario: IRisikoscenario
  alleRisikoscenarioer: IRisikoscenario[]
  tiltakList: ITiltak[]
}

export const KravRisikoscenarioAccordionContentReadOnly: FunctionComponent<TProps> = ({
  risikoscenario,
  alleRisikoscenarioer,
  tiltakList,
}) => {
  const [openedTiltakId, setOpenedTiltakId] = useState<string>('')
  const filterTiltakId: ITiltak[] = tiltakList.filter((tiltak: ITiltak) =>
    risikoscenario.tiltakIds.includes(tiltak.id)
  )

  return (
    <div>
      <RisikoscenarioViewReadOnly risikoscenario={risikoscenario} noCopyButton={true} />

      <div className='mt-12'>
        <RisikoscenarioTiltakHeader />

        {!risikoscenario.ingenTiltak && filterTiltakId.length !== 0 && (
          <div>
            {filterTiltakId.map((tiltak: ITiltak, index: number) => (
              <div className='mt-3' key={risikoscenario.id + '_' + tiltak.id + '_' + index}>
                <ReadMore
                  open={openedTiltakId === tiltak.id}
                  id={risikoscenario.id + '_' + tiltak.id}
                  className='mb-3'
                  onOpenChange={(open) => {
                    if (open) {
                      setOpenedTiltakId(tiltak.id)
                    } else {
                      setOpenedTiltakId('')
                    }
                  }}
                  header={tiltak.navn}
                >
                  <TiltakView tiltak={tiltak} risikoscenarioList={alleRisikoscenarioer} />
                </ReadMore>
              </div>
            ))}
          </div>
        )}

        {!risikoscenario.ingenTiltak && filterTiltakId.length === 0 && (
          <BodyShort>Risikoscenario mangler tiltak</BodyShort>
        )}

        {risikoscenario.ingenTiltak && (
          <KravRisikoscenarioIngenTiltak risikoscenario={risikoscenario} />
        )}
      </div>
    </div>
  )
}

export default KravRisikoscenarioAccordionContentReadOnly
