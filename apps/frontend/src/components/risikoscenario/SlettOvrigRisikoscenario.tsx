import { TrashIcon } from '@navikt/aksel-icons'
import { Button, List, Modal } from '@navikt/ds-react'
import { FunctionComponent, useState } from 'react'
import { NavigateFunction, useNavigate } from 'react-router-dom'
import {
  deleteRisikoscenario,
  getRisikoscenario,
  removeTiltakToRisikoscenario,
} from '../../api/RisikoscenarioApi'
import { deleteTiltak, getTiltak } from '../../api/TiltakApi'
import { IRisikoscenario, ITiltak } from '../../constants'

type TProps = {
  risikoscenario: IRisikoscenario
  tiltakList: ITiltak[]
  risikoscenarioer?: IRisikoscenario[]
  setRisikoscenarioer?: (state: IRisikoscenario[]) => void
}

export const SlettOvrigRisikoscenario: FunctionComponent<TProps> = ({
  risikoscenario,
  tiltakList,
  risikoscenarioer,
  setRisikoscenarioer,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const navigate: NavigateFunction = useNavigate()

  const submit = async (): Promise<void> => {
    await getRisikoscenario(risikoscenario.id).then(async (response: IRisikoscenario) => {
      if (response.tiltakIds.length > 0) {
        for await (const tiltakId of response.tiltakIds) {
          await getTiltak(tiltakId).then(async (tiltakResponse: ITiltak) => {
            await removeTiltakToRisikoscenario(risikoscenario.id, tiltakId).then(async () => {
              if (tiltakResponse.risikoscenarioIds.length === 1) {
                await deleteTiltak(tiltakId)
              }
            })
          })
        }
      }

      await deleteRisikoscenario(response.id).then((response: IRisikoscenario) => {
        if (risikoscenarioer && setRisikoscenarioer) {
          const updatedRisikoscenarioForKrav: IRisikoscenario[] = risikoscenarioer.filter(
            (risikoscenario: IRisikoscenario) => risikoscenario.id !== response.id
          )

          setRisikoscenarioer([...updatedRisikoscenarioForKrav])
        }
        setIsOpen(false)
        navigate(window.location.pathname)
        window.location.reload()
      })
    })
  }

  return (
    <div>
      <Button
        type='button'
        variant='tertiary'
        onClick={() => setIsOpen(true)}
        icon={<TrashIcon aria-hidden title='' />}
      >
        Slett risikoscenario
      </Button>

      {isOpen && (
        <Modal
          width='medium'
          header={{ heading: 'Vil dere slette dette risikoscenarioet?' }}
          open={isOpen}
          onClose={() => setIsOpen(false)}
        >
          {risikoscenario.tiltakIds.length !== 0 && (
            <Modal.Body>
              Dette risikoscenarioet brukes ikke noe annet sted i dokumentasjonen deres.
              <br />
              <br />
              {tiltakList
                .filter((tiltak: ITiltak) => risikoscenario.tiltakIds.includes(tiltak.id))
                .filter((tiltak: ITiltak) => tiltak.risikoscenarioIds.length === 1).length !==
                0 && (
                <List
                  as='ul'
                  title='Følgende tiltak er unike for dette risikoscenarioet, og vil også slettes:'
                >
                  {tiltakList
                    .filter((tiltak: ITiltak) => risikoscenario.tiltakIds.includes(tiltak.id))
                    .filter((tiltak: ITiltak) => tiltak.risikoscenarioIds.length === 1)
                    .map((tiltak: ITiltak, index: number) => (
                      <List.Item key={`${risikoscenario.id}_${tiltak.id}_${index}`}>
                        {tiltak.navn}
                      </List.Item>
                    ))}
                </List>
              )}
              {tiltakList
                .filter((tiltak: ITiltak) => risikoscenario.tiltakIds.includes(tiltak.id))
                .filter((tiltak: ITiltak) => tiltak.risikoscenarioIds.length === 1).length !== 0 &&
                'Hvis disse tiltakene er tenkt brukt ved andre scenarioer, koble tiltakene på de scenarioene først, og kom så tilbake og slette scenarioet.'}
            </Modal.Body>
          )}
          {risikoscenario.tiltakIds.length === 0 && (
            <Modal.Body>
              Risikoscenariet slettes helt og blir ikke lenger tilgjengelig i PVK-dokumentasjonen
              deres.
              <br />
              <br />
              Hvis risikoscenarioet er tenkt brukt andre steder i samme PVK-dokumentasjon, lag den
              koblingen først, og kom så tilbake og slett scenarioet herfra.
            </Modal.Body>
          )}
          <Modal.Footer>
            <Button type='button' onClick={() => submit}>
              Slett risikoscenario
            </Button>
            <Button type='button' variant='secondary' onClick={() => setIsOpen(false)}>
              Avbryt
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  )
}

export default SlettOvrigRisikoscenario
