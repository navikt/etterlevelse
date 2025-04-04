import { Alert, BodyLong, Button, Heading } from '@navikt/ds-react'
import { FunctionComponent, RefObject, useEffect, useState } from 'react'
import { NavigateFunction, useNavigate } from 'react-router-dom'
import { getRisikoscenarioByPvkDokumentId } from '../../api/RisikoscenarioApi'
import { getTiltakByPvkDokumentId } from '../../api/TiltakApi'
import {
  ERisikoscenarioType,
  IPageResponse,
  IPvkDokument,
  IRisikoscenario,
  ITiltak,
} from '../../constants'
import RisikoscenarioAccordianList from '../risikoscenario/RisikoscenarioAccordianList'
import CreateRisikoscenarioModal from '../risikoscenario/edit/CreateRisikoscenarioModal'
import FormButtons from './edit/FormButtons'

type TProps = {
  etterlevelseDokumentasjonId: string
  pvkDokument: IPvkDokument
  activeStep: number
  setActiveStep: (step: number) => void
  setSelectedStep: (step: number) => void
  formRef: RefObject<any>
}

export const IdentifiseringAvRisikoscenarioerOgTiltak: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjonId,
  pvkDokument,
  activeStep,
  setActiveStep,
  setSelectedStep,
  formRef,
}) => {
  const navigate: NavigateFunction = useNavigate()

  const [risikoscenarioList, setRisikoscenarioList] = useState<IRisikoscenario[]>([])
  const [allRisikoscenarioList, setAllRisikoscenarioList] = useState<IRisikoscenario[]>([])
  const [tiltakList, setTiltakList] = useState<ITiltak[]>([])
  const [isTiltakFormActive, setIsTiltakFormActive] = useState<boolean>(false)

  useEffect(() => {
    if (pvkDokument) {
      ;(async () => {
        await getRisikoscenarioByPvkDokumentId(pvkDokument.id, ERisikoscenarioType.ALL).then(
          (risikoscenarioer: IPageResponse<IRisikoscenario>) => {
            setAllRisikoscenarioList(risikoscenarioer.content)
            setRisikoscenarioList(
              risikoscenarioer.content.filter(
                (risikoscenario: IRisikoscenario) => risikoscenario.generelScenario
              )
            )
          }
        )
        await getTiltakByPvkDokumentId(pvkDokument.id).then((response: IPageResponse<ITiltak>) => {
          setTiltakList(response.content)
        })
      })()
    }
  }, [pvkDokument])

  return (
    <div className='flex justify-center w-full'>
      <div className='flex-col justify-items-center'>
        <div className='w-4/5'>
          <Heading level='1' size='medium' className='my-5'>
            Identifisering av risikoscenarioer og tiltak
          </Heading>

          <BodyLong>
            I en PVK må dere vurdere sannsynligheten for at personvern ikke ivaretas på
            tilstrekkelig vis, og konsekvensene det vil føre til. Hvor dette risikoscenarioet er av
            betydning, må dere identifisere forebyggende tiltak som reduserer risiko.
          </BodyLong>

          <Alert variant='info' inline className='mt-5'>
            <strong>Godt å vite:</strong> risikoscenarioer og tiltak som dere har dokumentert et
            sted, kan dere finne og gjenbruke andre steder hvor det er aktuelt.
          </Alert>

          <Heading spacing size='small' level='2' className='mb-5 mt-10'>
            Legg til risikoscenarioer og tiltak med en tilknytning til etterlevelseskrav
          </Heading>

          <BodyLong className='mb-5'>
            Disse vil nok utgjøre hovedparten av deres PVK. Slike risikoscenarioer, samt motvirkende
            tiltak, beskriver dere på den aktuelle kravsiden.
          </BodyLong>

          <Button
            variant='secondary'
            type='button'
            onClick={() => {
              if (etterlevelseDokumentasjonId)
                navigate('/dokumentasjon/' + etterlevelseDokumentasjonId + '?tab=pvk')
            }}
          >
            Gå til liste over PVK-relaterte krav
          </Button>

          <Heading level='2' size='small' className='mb-5 mt-10'>
            Legg til øvrige risikoscenarioer
          </Heading>

          <BodyLong>
            Noen risikoscenarioer vil ikke har en direkte tilknytning til etterlevelseskrav. Disse,
            samt motvirkende tiltak, legger dere inn på denne siden. Vi anbefaler at dette gjøres
            etter at dere har vurderert kravspesifikke risikoscenarioer.
          </BodyLong>

          {risikoscenarioList.length === 0 && (
            <Alert variant='info' className='my-5 w-fit'>
              Dere har ikke lagt inn noen øvrige risikoscenarioer.
            </Alert>
          )}
        </div>
        <div className='w-full'>
          {risikoscenarioList.length !== 0 && (
            <div className='my-5'>
              <RisikoscenarioAccordianList
                risikoscenarioList={risikoscenarioList}
                allRisikoscenarioList={allRisikoscenarioList}
                tiltakList={tiltakList}
                etterlevelseDokumentasjonId={etterlevelseDokumentasjonId}
                setTiltakList={setTiltakList}
                setRisikoscenarioList={setRisikoscenarioList}
                setIsTiltakFormActive={setIsTiltakFormActive}
                formRef={formRef}
              />
            </div>
          )}

          {!isTiltakFormActive && (
            <CreateRisikoscenarioModal
              pvkDokument={pvkDokument}
              onSubmitStateUpdate={(risikoscenario: IRisikoscenario) => {
                setRisikoscenarioList([...risikoscenarioList, risikoscenario])
              }}
            />
          )}
        </div>

        <FormButtons
          etterlevelseDokumentasjonId={etterlevelseDokumentasjonId}
          activeStep={activeStep}
          setActiveStep={setActiveStep}
          setSelectedStep={setSelectedStep}
        />
      </div>
    </div>
  )
}

export default IdentifiseringAvRisikoscenarioerOgTiltak
