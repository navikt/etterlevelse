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
  setIsEditTiltakFormActive: (state: boolean) => void
  isCreateTiltakFormActive: boolean
}

export const TiltakReadMoreList = (props: IProps) => {
  const {
    risikoscenario,
    tiltakList,
    setTiltakList,
    risikoscenarioList,
    setIsEditTiltakFormActive,
    isCreateTiltakFormActive,
  } = props
  const [activeTiltak, setActiveTiltak] = useState<string>('')

  return (
    <div>
      {tiltakList
        .filter((tiltak) => risikoscenario.tiltakIds.includes(tiltak.id))
        .map((tiltak, index) => {
          return (
            <div className="mt-3" key={risikoscenario.id + '_' + tiltak.id + '_' + index}>
              <TiltakListContent
                activeTiltak={activeTiltak}
                setActiveTiltak={setActiveTiltak}
                risikoscenario={risikoscenario}
                tiltak={tiltak}
                setTiltakList={setTiltakList}
                risikoscenarioList={risikoscenarioList}
                setIsEditTiltakFormActive={setIsEditTiltakFormActive}
                isCreateTiltakFormActive={isCreateTiltakFormActive}
              />
            </div>
          )
        })}
    </div>
  )
}

interface ITiltakListContentProps {
  activeTiltak: string
  setActiveTiltak: (state: string) => void
  risikoscenario: IRisikoscenario
  tiltak: ITiltak
  setTiltakList: (state: ITiltak[]) => void
  risikoscenarioList: IRisikoscenario[]
  setIsEditTiltakFormActive: (state: boolean) => void
  isCreateTiltakFormActive: boolean
}

const TiltakListContent = (props: ITiltakListContentProps) => {
  const {
    activeTiltak,
    setActiveTiltak,
    risikoscenario,
    tiltak,
    risikoscenarioList,
    setIsEditTiltakFormActive,
    isCreateTiltakFormActive,
  } = props
  const [isEditMode, setIsEditMode] = useState<boolean>(false)
  return (
    <div key={risikoscenario.id + '_' + tiltak.id}>
      {!isEditMode && (
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
      )}

      {activeTiltak === tiltak.id && !isEditMode && !isCreateTiltakFormActive && (
        <div className="flex gap-2 mt-5">
          <Button
            type="button"
            variant="tertiary"
            size="small"
            icon={<PencilIcon title="" aria-hidden />}
            onClick={() => {
              setIsEditTiltakFormActive(true)
              setIsEditMode(true)
            }}
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
}

export default TiltakReadMoreList
