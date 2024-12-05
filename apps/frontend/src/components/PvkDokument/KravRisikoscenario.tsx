import { Alert, Button, ReadMore } from '@navikt/ds-react'
import { useState } from 'react'
import { IRisikoscenario } from '../../constants'

interface IProps {
  risikoscenarioer: IRisikoscenario[]
  setIsPreview: (state: boolean) => void
}

export const KravRisikoscenario = (props: IProps) => {
  const { risikoscenarioer, setIsPreview } = props
  const [isEditMode, setIsEditMode] = useState<boolean>(false)

  return (
    <div className="w-full">
      <ReadMore header="Må vi dokumentere risikoscenarioer for alle PVK-relaterte krav?">
        WIP
      </ReadMore>
      <ReadMore header="Slik dokumenterer dere risikoscenarioer og tiltak">WIP</ReadMore>

      <div className="mt-5">
        {risikoscenarioer.length === 0 && (
          <Alert variant="info">
            Foreløpig finnes det ingen risikoscenarioer koblet på dette kravet.
          </Alert>
        )}

        {isEditMode && <div></div>}

        {!isEditMode && (
          <div className="flex gap-2 mt-8">
            <Button
              size="small"
              type="button"
              onClick={() => {
                setIsPreview(true)
                setIsEditMode(true)
              }}
            >
              Opprett nytt risikoscenario
            </Button>
            <Button
              size="small"
              variant="secondary"
              type="button"
              onClick={() => {
                setIsPreview(true)
                setIsEditMode(true)
              }}
            >
              Legg til eksisterende risikoscenario
            </Button>
          </div>
        )}
        {isEditMode && (
          <div className="flex gap-2 mt-8">
            <Button
              size="small"
              type="button"
              onClick={() => {
                setIsPreview(false)
                setIsEditMode(false)
              }}
            >
              Lagre
            </Button>
            <Button
              size="small"
              variant="secondary"
              type="button"
              onClick={() => {
                setIsPreview(false)
                setIsEditMode(false)
              }}
            >
              Avbryt
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
export default KravRisikoscenario
