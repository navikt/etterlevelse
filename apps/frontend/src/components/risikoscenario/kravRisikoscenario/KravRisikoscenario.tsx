import { Accordion, Alert, BodyLong, Button, List, ReadMore } from '@navikt/ds-react'
import { RefObject, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getRisikoscenarioByPvkDokumentId } from '../../../api/RisikoscenarioApi'
import { getTiltakByPvkDokumentId } from '../../../api/TiltakApi'
import {
  ERisikoscenarioType,
  IPvkDokument,
  IRisikoscenario,
  ITiltak,
  TKravQL,
} from '../../../constants'
import AccordianAlertModal from '../AccordianAlertModal'
import CreateRisikoscenario from '../edit/CreateRisikoscenario'
import LeggTilEksisterendeRisikoscenario from '../edit/LeggTilEksisterendeRisikoscenario'
import KravRisikoscenarioAccordionContent from './KravRisikoscenarioAccordionContent'

interface IProps {
  krav: TKravQL
  pvkDokument: IPvkDokument
  formRef: RefObject<any>
}

const unsavedAction = {
  createRisikoscenario: 'createRisikoscenario',
  leggTilEksisterendeRisikoscenario: 'leggTilEksisterendeRisikoscenario',
}

export const KravRisikoscenario = (props: IProps) => {
  const { krav, pvkDokument, formRef } = props
  const [isCreateMode, setIsCreateMode] = useState<boolean>(false)
  const [isLeggTilEksisterendeMode, setIsLeggTilEksisterendeMode] = useState<boolean>(false)
  const [isUnsaved, setIsUnsaved] = useState<boolean>(false)
  const [alleRisikoscenarioer, setAlleRisikoscenarioer] = useState<IRisikoscenario[]>([])
  const [risikoscenarioer, setRisikoscenarioer] = useState<IRisikoscenario[]>([])
  const [risikoscenarioForKrav, setRisikoscenarioForKrav] = useState<IRisikoscenario[]>([])
  const [tiltakList, setTiltakList] = useState<ITiltak[]>([])
  const [activeRisikoscenarioId, setActiveRisikoscenarioId] = useState<string>('')
  const [selectedRisikoscenarioId, setSelectedRisikoscenarioId] = useState<string>('')
  const [editButtonClicked, setEditButtonClicked] = useState<string>('')
  const navigate = useNavigate()

  useEffect(() => {
    ;(async () => {
      if (pvkDokument && krav) {
        await getRisikoscenarioByPvkDokumentId(pvkDokument.id, ERisikoscenarioType.ALL).then(
          (response) => {
            setAlleRisikoscenarioer(response.content)

            setRisikoscenarioer(
              response.content.filter(
                (risikoscenario) =>
                  !risikoscenario.generelScenario &&
                  risikoscenario.relevanteKravNummer.filter(
                    (relevantekrav) => relevantekrav.kravNummer === krav.kravNummer
                  ).length === 0
              )
            )
            setRisikoscenarioForKrav(
              response.content.filter(
                (risikoscenario) =>
                  !risikoscenario.generelScenario &&
                  risikoscenario.relevanteKravNummer.filter(
                    (relevantekrav) =>
                      relevantekrav.kravNummer === krav.kravNummer &&
                      relevantekrav.kravVersjon === krav.kravVersjon
                  ).length > 0
              )
            )
          }
        )

        await getTiltakByPvkDokumentId(pvkDokument.id).then((response) => {
          setTiltakList(response.content)
        })
      }
    })()
  }, [krav, pvkDokument])

  const handleAccordionChange = (risikoscenarioId?: string) => {
    if (risikoscenarioId) {
      if (formRef.current?.dirty) {
        setIsUnsaved(true)
      } else {
        setActiveRisikoscenarioId(risikoscenarioId)
        navigate(window.location.pathname + '?risikoscenario=' + risikoscenarioId)
      }
    } else {
      if (formRef.current?.dirty) {
        setIsUnsaved(true)
      } else {
        setActiveRisikoscenarioId('')
        navigate(window.location.pathname)
      }
    }
  }

  return (
    <div className="w-full">
      <ReadMore header="Slik dokumenterer dere risikoscenarioer og tiltak">
        <BodyLong>
          Her dokumenter dere risikoscenarioer og tiltak som gjelder for dette kravet. Her kan dere:
        </BodyLong>
        <List>
          <List.Item>Opprette nye risikoscenarioer.</List.Item>
          <List.Item>
            Koble på eksisterende risikoscenarioer som dere har beskrevet andre steder i løsninga.
          </List.Item>
          <List.Item>Opprette nye tiltak.</List.Item>
          <List.Item>
            Koble på eksisterende tiltak som dere har beskrevet andre steder i løsninga.
          </List.Item>
        </List>
      </ReadMore>

      <div className="mt-5">
        {!isCreateMode && !isLeggTilEksisterendeMode && risikoscenarioForKrav.length === 0 && (
          <Alert variant="info" className="mb-5">
            Foreløpig finnes det ingen risikoscenarioer tilknyttet dette kravet.
          </Alert>
        )}

        {isLeggTilEksisterendeMode && (
          <LeggTilEksisterendeRisikoscenario
            kravnummer={krav.kravNummer}
            risikoscenarioer={risikoscenarioer}
            setRisikoscenarioer={setRisikoscenarioer}
            risikoscenarioForKrav={risikoscenarioForKrav}
            setRisikoscenarioForKrav={setRisikoscenarioForKrav}
            setIsLeggTilEksisterendeMode={setIsLeggTilEksisterendeMode}
            formRef={formRef}
          />
        )}

        {!isLeggTilEksisterendeMode && (
          <div className="mb-5">
            <Accordion>
              {risikoscenarioForKrav.map((risikoscenario, index) => {
                const expanded = activeRisikoscenarioId === risikoscenario.id
                return (
                  <Accordion.Item
                    open={expanded}
                    id={risikoscenario.id}
                    key={index + '_' + risikoscenario.navn}
                    onOpenChange={(open) => {
                      setSelectedRisikoscenarioId(open ? risikoscenario.id : '')
                      handleAccordionChange(open ? risikoscenario.id : '')
                    }}
                  >
                    <Accordion.Header id={risikoscenario.id}>
                      {risikoscenario.navn}
                    </Accordion.Header>
                    {expanded && (
                      <Accordion.Content>
                        <KravRisikoscenarioAccordionContent
                          risikoscenario={risikoscenario}
                          alleRisikoscenarioer={alleRisikoscenarioer}
                          isCreateMode={isCreateMode}
                          kravnummer={krav.kravNummer}
                          risikoscenarioer={risikoscenarioer}
                          setRisikoscenarioer={setRisikoscenarioer}
                          risikoscenarioForKrav={risikoscenarioForKrav}
                          setRisikoscenarioForKrav={setRisikoscenarioForKrav}
                          tiltakList={tiltakList}
                          setTiltakList={setTiltakList}
                          formRef={formRef}
                        />
                      </Accordion.Content>
                    )}
                  </Accordion.Item>
                )
              })}
            </Accordion>
          </div>
        )}

        {isCreateMode && (
          <CreateRisikoscenario
            krav={krav}
            pvkDokumentId={pvkDokument.id}
            risikoscenarioer={risikoscenarioForKrav}
            setRisikoscenarioer={setRisikoscenarioForKrav}
            setIsCreateMode={setIsCreateMode}
            formRef={formRef}
            setActiveRisikoscenarioId={setActiveRisikoscenarioId}
          />
        )}

        {!isCreateMode && !isLeggTilEksisterendeMode && (
          <div className="flex gap-2 mt-8 lg:flex-row flex-col">
            <Button
              size="small"
              type="button"
              onClick={() => {
                if (formRef.current?.dirty) {
                  setIsUnsaved(true)
                  setEditButtonClicked(unsavedAction.createRisikoscenario)
                } else {
                  setIsCreateMode(true)
                }
              }}
            >
              Opprett nytt risikoscenario
            </Button>
            <Button
              size="small"
              variant="secondary"
              type="button"
              onClick={() => {
                if (formRef.current?.dirty) {
                  setIsUnsaved(true)
                  setEditButtonClicked(unsavedAction.leggTilEksisterendeRisikoscenario)
                } else {
                  setIsLeggTilEksisterendeMode(true)
                }
              }}
            >
              Legg til eksisterende risikoscenario
            </Button>
          </div>
        )}

        <AccordianAlertModal
          isOpen={isUnsaved}
          setIsOpen={setIsUnsaved}
          formRef={formRef}
          customOnClick={() => {
            if (selectedRisikoscenarioId) {
              setActiveRisikoscenarioId(selectedRisikoscenarioId)
            }
            if (editButtonClicked) {
              if (editButtonClicked === unsavedAction.createRisikoscenario) {
                setIsCreateMode(true)
              } else if (editButtonClicked === unsavedAction.leggTilEksisterendeRisikoscenario) {
                setIsLeggTilEksisterendeMode(true)
              }
            }
          }}
        />
      </div>
    </div>
  )
}
export default KravRisikoscenario
