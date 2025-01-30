import { PencilIcon, TrashIcon } from '@navikt/aksel-icons'
import { Button, ReadMore } from '@navikt/ds-react'
import { useState } from 'react'
import { IRisikoscenario, ITiltak } from '../../constants'
import TiltakView from './TiltakView'

interface IProps {
  risikoscenario: IRisikoscenario
  tiltakList: ITiltak[]
  setTiltakList: (state: ITiltak[]) => void
  risikoscenarioList: IRisikoscenario[]
}

export const TiltakReadMoreList = (props: IProps) => {
  const { risikoscenario, tiltakList, risikoscenarioList } = props
  const [activeTiltak, setActiveTiltak] = useState<string>('')

  return (
    <div>
      {tiltakList
        .filter((tiltak) => risikoscenario.tiltakIds.includes(tiltak.id))
        .map((tiltak, index) => {
          return (
            <div className="mt-3" key={risikoscenario.id + '_' + tiltak.id + '_' + index}>
              <ReadMore
                open={activeTiltak === tiltak.id}
                onOpenChange={(open) => {
                  if (open) {
                    setActiveTiltak(tiltak.id)
                  } else {
                    setActiveTiltak('')
                  }
                }}
                header={tiltak.navn}
              >
                <TiltakView tiltak={tiltak} risikoscenarioList={risikoscenarioList} />
              </ReadMore>

              {activeTiltak === tiltak.id && (
                <div className="flex gap-2 mt-5">
                  <Button
                    type="button"
                    variant="tertiary"
                    size="small"
                    icon={<PencilIcon title="" aria-hidden />}
                  >
                    Redigér tiltak
                  </Button>

                  <Button
                    type="button"
                    variant="tertiary"
                    size="small"
                    icon={<TrashIcon title="" aria-hidden />}
                  >
                    Slett tiltak
                  </Button>
                </div>
              )}
            </div>
          )
        })}
    </div>
  )
}

export default TiltakReadMoreList
