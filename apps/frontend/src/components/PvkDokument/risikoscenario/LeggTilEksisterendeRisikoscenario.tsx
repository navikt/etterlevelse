import { Button, Chips, Select, VStack } from '@navikt/ds-react'
import { useState } from 'react'
import { IRisikoscenario } from '../../../constants'

interface IProps {
  risikoscenarioer: IRisikoscenario[]
  setIsLeggTilEksisterendeMode: (state: boolean) => void
}

export const LeggTilEksisterendeRisikoscenario = (props: IProps) => {
  const { risikoscenarioer, setIsLeggTilEksisterendeMode } = props
  const [selectedRisikoscenarioer, setSelectedRisikoscenarioer] = useState<string[]>([])

  const addRisikoscenario = (risikoscenarioId: string) => {
    const existingId = selectedRisikoscenarioer.filter(
      (selectedRisikoscenario) => selectedRisikoscenario === risikoscenarioId
    )
    if (existingId.length === 0) {
      setSelectedRisikoscenarioer([...selectedRisikoscenarioer, risikoscenarioId])
    }
  }

  const removeRisikoscenario = (risikoscenarioId: string) => {
    const updatedScenario = selectedRisikoscenarioer.filter((id) => id !== risikoscenarioId)
    setSelectedRisikoscenarioer([...updatedScenario])
  }

  return (
    <div>
      <Select
        label="Legg til eksisterende risikoscenario"
        onChange={(event) => {
          if (event.target.value) {
            addRisikoscenario(event.target.value)
          }
        }}
      >
        <option value=""></option>
        {risikoscenarioer.map((risikoscenario) => {
          return (
            <option key={risikoscenario.id} value={risikoscenario.id}>
              {risikoscenario.navn}
            </option>
          )
        })}
      </Select>

      <VStack gap="10" className="mt-3">
        <Chips>
          {selectedRisikoscenarioer.map((selectedRisikoscenario) => {
            const data = risikoscenarioer.filter(
              (risikoscenario) => risikoscenario.id === selectedRisikoscenario
            )
            return (
              <Chips.Removable
                key={selectedRisikoscenario}
                onClick={() => removeRisikoscenario(selectedRisikoscenario)}
              >
                {data[0].navn}
              </Chips.Removable>
            )
          })}
        </Chips>
      </VStack>

      <div className="mt-5 flex gap-2">
        <Button type="button" onClick={() => setIsLeggTilEksisterendeMode(false)}>
          Lagre
        </Button>

        <Button
          type="button"
          variant="secondary"
          onClick={() => setIsLeggTilEksisterendeMode(false)}
        >
          avbyrt
        </Button>
      </div>
    </div>
  )
}
export default LeggTilEksisterendeRisikoscenario
