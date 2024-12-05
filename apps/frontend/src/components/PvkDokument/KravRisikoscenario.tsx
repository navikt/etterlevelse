import { Alert, BodyLong, Button, ReadMore } from '@navikt/ds-react'
import { useEffect, useState } from 'react'
import { IPvkDokument, IRisikoscenario, TKravQL } from '../../constants'
import CreateRisikoscenario from './edit/CreateRisikoscenario'

interface IProps {
  krav: TKravQL
  pvkDokument: IPvkDokument
  setIsPreview: (state: boolean) => void
}

export const KravRisikoscenario = (props: IProps) => {
  const { krav, pvkDokument, setIsPreview } = props
  const [risikoscenarioer, setRisikoscenarioer] = useState<IRisikoscenario[]>([])
  const [isCreateMode, setIsCreateMode] = useState<boolean>(false)
  const [isLeggTilEksisterendeMode, setIsLeggTilEksisterendeMode] = useState<boolean>(false)

  useEffect(() => {
    //logic for å hente alle risikoscenarioer knyttet til kravet
    setRisikoscenarioer([])
  }, [krav, pvkDokument])

  return (
    <div className="w-full">
      <ReadMore header="Må vi dokumentere risikoscenarioer for alle PVK-relaterte krav?">
        WIP
      </ReadMore>
      <ReadMore header="Slik dokumenterer dere risikoscenarioer og tiltak">WIP</ReadMore>

      <div className="mt-5">
        {!isCreateMode && !isLeggTilEksisterendeMode && risikoscenarioer.length === 0 && (
          <Alert variant="info">
            Foreløpig finnes det ingen risikoscenarioer koblet på dette kravet.
          </Alert>
        )}

        {isCreateMode && (
          <CreateRisikoscenario
            krav={krav}
            pvkDokumentId={pvkDokument.id}
            risikoscenarioer={risikoscenarioer}
            setRisikoscenarioer={setRisikoscenarioer}
            setIsCreateMode={setIsCreateMode}
          />
        )}

        {isLeggTilEksisterendeMode && (
          <div>
            <BodyLong>Legg til eksisterende risikoscenario</BodyLong>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsLeggTilEksisterendeMode(false)}
            >
              avbyrt
            </Button>
          </div>
        )}

        {!isCreateMode && !isLeggTilEksisterendeMode && (
          <div>
            {risikoscenarioer.map((risikoscenario) => (
              <BodyLong key={risikoscenario.id}>{risikoscenario.navn}</BodyLong>
            ))}
          </div>
        )}

        {!isCreateMode && !isLeggTilEksisterendeMode && (
          <div className="flex gap-2 mt-8">
            <Button
              size="small"
              type="button"
              onClick={() => {
                setIsPreview(true)
                setIsCreateMode(true)
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
                setIsLeggTilEksisterendeMode(true)
              }}
            >
              Legg til eksisterende risikoscenario
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
export default KravRisikoscenario
