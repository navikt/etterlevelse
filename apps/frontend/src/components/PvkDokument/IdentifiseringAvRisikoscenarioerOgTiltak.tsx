import { Alert, BodyLong, Button, Heading, ReadMore } from '@navikt/ds-react'
import { useEffect, useState } from 'react'
import { getRisikoscenarioByPvkDokumentId } from '../../api/RisikoscenarioApi'
import { ERisikoscenarioType, IPvkDokument, IRisikoscenario } from '../../constants'
import CreateRisikoscenarioModal from './edit/CreateRisikoscenarioModal'
import FormButtons from './edit/FormButtons'
import RisikoscenarioAccordianList from './risikoscenario/RisikoscenarioAccordianList'

interface IProps {
  etterlevelseDokumentasjonId: string
  pvkDokument: IPvkDokument
  activeStep: number
  setActiveStep: (step: number) => void
}

export const IdentifiseringAvRisikoscenarioerOgTiltak = (props: IProps) => {
  const { etterlevelseDokumentasjonId, pvkDokument, activeStep, setActiveStep } = props
  const [risikoscenarioList, setRisikoscenarioList] = useState<IRisikoscenario[]>([])
  const [defaultOpen, setDefaultOpen] = useState<boolean>(false)

  useEffect(() => {
    if (pvkDokument) {
      ;(async () => {
        await getRisikoscenarioByPvkDokumentId(pvkDokument.id, ERisikoscenarioType.GENERAL).then(
          (risikoscenarioer) => {
            setRisikoscenarioList(risikoscenarioer.content)
          }
        )
      })()
    }
  }, [pvkDokument])

  useEffect(() => {
    if (window.location.hash) {
      setDefaultOpen(true)
    } else {
      setDefaultOpen(false)
    }
  }, [])

  return (
    <div>
      <ReadMore header="Vis behandlingens livsløp">Her kommer Behandlingens livsløp.</ReadMore>

      <Heading level="1" size="medium" className="my-5">
        Identifisering av risikoscenarioer og tiltak
      </Heading>

      <BodyLong>
        I en PVK må dere vurdere sannsynligheten for at personvern ikke ivaretas på tilstrekkelig
        vis, og konsekvensene det vil føre til. Hvor dette risikoscenarioet er av betydning, må dere
        identifisere forebyggende tiltak som reduserer risiko.
      </BodyLong>

      <Alert variant="info" inline className="mt-5">
        <strong>Godt å vite:</strong> risikoscenarioer og tiltak som dere har dokumentert et sted,
        kan dere finne og gjenbruke andre steder hvor det er aktuelt.
      </Alert>

      <Heading spacing size="small" level="2" className="my-5">
        Legg til risikoscenarioer og tiltak med en tilknytning til etterlevelseskrav
      </Heading>

      <BodyLong className="mb-5">
        Disse vil nok utgjøre hovedparten av deres PVK. Slike risikoscenarioer, samt motvirkende
        tiltak, beskriver dere på den aktuelle kravsiden.
      </BodyLong>

      <Button variant="secondary" type="button">
        Gå til liste over PVK-relaterte krav
      </Button>

      <Heading level="2" size="small" className="my-5">
        Legg til øvrige risikoscenarioer
      </Heading>

      <BodyLong>
        Noen risikoscenarioer vil ikke har en direkte tilknytning til etterlevelseskrav. Disse, samt
        motvirkende tiltak, legger dere inn på denne siden. Vi anbefaler at dette gjøres etter at
        dere har vurderert kravspesifikke risikoscenarioer.
      </BodyLong>

      {risikoscenarioList.length === 0 && (
        <Alert variant="info" className="mt-10 w-fit">
          Dere har ikke lagt inn noen øvrige risikoscenarioer.
        </Alert>
      )}

      {risikoscenarioList.length > 0 && (
        <div className="my-5">
          <RisikoscenarioAccordianList
            risikoscenarioList={risikoscenarioList}
            defaultOpen={defaultOpen}
          />
        </div>
      )}

      <CreateRisikoscenarioModal
        pvkDokument={pvkDokument}
        onSubmitStateUpdate={(risikoscenario: IRisikoscenario) => {
          setRisikoscenarioList([...risikoscenarioList, risikoscenario])
        }}
      />

      <FormButtons
        etterlevelseDokumentasjonId={etterlevelseDokumentasjonId}
        activeStep={activeStep}
        setActiveStep={setActiveStep}
      />
    </div>
  )
}

export default IdentifiseringAvRisikoscenarioerOgTiltak
