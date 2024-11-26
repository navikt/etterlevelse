import { Button, Heading, Radio, RadioGroup, ReadMore, TextField } from '@navikt/ds-react'
import { useState } from 'react'
import { EKonsekvensnivaa, ESannsynlighetsnivaa } from '../../../constants'
import { TextAreaField } from '../../common/Inputs'

export const CreateRisikoscenario = () => {
  const [isEdit, setIsEdit] = useState<boolean>(false)
  return (
    <div className="mt-5">
      {!isEdit && (
        <Button onClick={() => setIsEdit(true)} variant="secondary">
          Opprett nytt øvrig risikoscenario
        </Button>
      )}

      {isEdit && (
        <div>
          <Heading level="2" size="small" className="mb-3">
            Opprett nytt øvirg risikoscenario
          </Heading>

          <TextField
            label="Navngi risikoscenarioet"
            description="Velg et navn som gjør scenarioet lett å skille fra andre "
          />

          <div className="mt-3">
            <TextAreaField
              rows={3}
              noPlaceholder
              label="Beskriv risikoscenarioet"
              name="genereltRisikoscenarioBeskrivelse"
            />
          </div>

          <Heading level="2" size="small" className="my-5">
            Risikoscenarioets sannsynlighet
          </Heading>

          <ReadMore header="Hva menes med de ulike sannsynlighetsnivåene?" className="my-5">
            ???????? WIP
          </ReadMore>

          <RadioGroup legend="Vurdér risikoscenarioets sannsynlighetsnivå">
            <Radio value={ESannsynlighetsnivaa.MEGET_LITE_SANNSYNILIG}>Meget lite sannsynlig</Radio>
            <Radio value={ESannsynlighetsnivaa.LITE_SANNSYNLIG}>Lite sannsynlig</Radio>
            <Radio value={ESannsynlighetsnivaa.MODERAT_SANNSYNLIG}>Moderat sannsynlig </Radio>
            <Radio value={ESannsynlighetsnivaa.SANNSYNLIG}>Sannsynlig</Radio>
            <Radio value={ESannsynlighetsnivaa.NESTEN_SIKKERT}>Nesten sikkert</Radio>
          </RadioGroup>

          <div className="mt-3">
            <TextAreaField rows={3} noPlaceholder label="Begrunn sannsynlighetsnivået" name="WIP" />
          </div>

          <Heading level="2" size="small" className="my-5">
            Risikoscenarioets konsekvensnivå
          </Heading>

          <ReadMore header="Hva menes med de ulike konsekvensnivåene?" className="my-5">
            ???????? WIP
          </ReadMore>

          <RadioGroup legend="Vurdér risikoscenarioets konsekvensnivå">
            <Radio value={EKonsekvensnivaa.UBETYDELIG}>Ubetydelig</Radio>
            <Radio value={EKonsekvensnivaa.LAV_KONSEKVENS}>Lav konsekvens</Radio>
            <Radio value={EKonsekvensnivaa.MODERAT_KONSEKVENS}>Moderat konsekvens</Radio>
            <Radio value={EKonsekvensnivaa.ALVORLIG_KONSEKVENS}>Alvorlig konsekvens</Radio>
            <Radio value={EKonsekvensnivaa.SVAERT_ALVORLIG_KONSEKVENS}>
              Svært alvorlig konsekvens
            </Radio>
          </RadioGroup>

          <div className="mt-3">
            <TextAreaField rows={3} noPlaceholder label="Begrunn konsekvensnivået" name="WIP" />
          </div>

          <div className="flex gap-2 mt-5">
            <Button type="button">Lagre risikoscenario</Button>
            <Button onClick={() => setIsEdit(false)} type="button" variant="secondary">
              Avbryt, ikke lagre
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CreateRisikoscenario
