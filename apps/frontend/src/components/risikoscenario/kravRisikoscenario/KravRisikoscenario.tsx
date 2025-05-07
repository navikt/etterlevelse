import { Accordion, Alert, Button } from '@navikt/ds-react'
import { FunctionComponent, RefObject, useEffect, useState } from 'react'
import { NavigateFunction, useNavigate } from 'react-router-dom'
import { getRisikoscenarioByPvkDokumentId } from '../../../api/RisikoscenarioApi'
import { getTiltakByPvkDokumentId } from '../../../api/TiltakApi'
import {
  ERisikoscenarioType,
  IPageResponse,
  IPvkDokument,
  IRisikoscenario,
  ITiltak,
  TKravQL,
} from '../../../constants'
import { risikoscenarioUrl } from '../../common/RouteLinkPvk'
import AccordianAlertModal from '../AccordianAlertModal'
import CreateRisikoscenario from '../edit/CreateRisikoscenario'
import LeggTilEksisterendeRisikoscenario from '../edit/LeggTilEksisterendeRisikoscenario'
import KravRisikoscenarioAccordionContent from './KravRisikoscenarioAccordionContent/KravRisikoscenarioAccordionContent'
import { KravRisikoscenarioOvrigeRisikoscenarier } from './KravRisikoscenarioOvrigeRisikoscenarier/KravRisikoscenarioOvrigeRisikoscenarier'
import { KravRisikoscenarioReadMore } from './KravRisikoscenarioReadMore/KravRisikoscenarioReadMore'

type TProps = {
  krav: TKravQL
  pvkDokument: IPvkDokument
  setIsPvkFormActive: (state: boolean) => void
  formRef: RefObject<any>
}

export const KravRisikoscenario: FunctionComponent<TProps> = ({
  krav,
  pvkDokument,
  setIsPvkFormActive,
  formRef,
}) => {
  const [isCreateMode, setIsCreateMode] = useState<boolean>(false)
  const [isLeggTilEksisterendeMode, setIsLeggTilEksisterendeMode] = useState<boolean>(false)
  const [isUnsaved, setIsUnsaved] = useState<boolean>(false)
  const [alleRisikoscenarioer, setAlleRisikoscenarioer] = useState<IRisikoscenario[]>([])
  const [risikoscenarioer, setRisikoscenarioer] = useState<IRisikoscenario[]>([])
  const [risikoscenarioForKrav, setRisikoscenarioForKrav] = useState<IRisikoscenario[]>([])
  const [tiltakList, setTiltakList] = useState<ITiltak[]>([])
  const [activeRisikoscenarioId, setActiveRisikoscenarioId] = useState<string>('')
  const [selectedRisikoscenarioId, setSelectedRisikoscenarioId] = useState<string>('')
  const [isTiltakFormActive, setIsTiltakFormActive] = useState<boolean>(false)

  const url: URL = new URL(window.location.href)
  const risikoscenarioId: string | null = url.searchParams.get('risikoscenario')
  const navigate: NavigateFunction = useNavigate()

  useEffect(() => {
    ;(async () => {
      if (pvkDokument && krav) {
        await getRisikoscenarioByPvkDokumentId(pvkDokument.id, ERisikoscenarioType.ALL).then(
          (response: IPageResponse<IRisikoscenario>) => {
            setAlleRisikoscenarioer(response.content)

            setRisikoscenarioer(
              response.content.filter(
                (risikoscenario: IRisikoscenario) =>
                  !risikoscenario.generelScenario &&
                  risikoscenario.relevanteKravNummer.filter(
                    (relevantekrav) => relevantekrav.kravNummer === krav.kravNummer
                  ).length === 0
              )
            )
            setRisikoscenarioForKrav(
              response.content.filter(
                (risikoscenario: IRisikoscenario) =>
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

        await getTiltakByPvkDokumentId(pvkDokument.id).then((response: IPageResponse<ITiltak>) => {
          setTiltakList(response.content)
        })
      }
    })()
  }, [krav, pvkDokument])

  const handleAccordionChange = (risikoscenarioId?: string): void => {
    if (risikoscenarioId) {
      if (formRef.current?.dirty && !isCreateMode) {
        setIsUnsaved(true)
      } else {
        setIsTiltakFormActive(false)
        setActiveRisikoscenarioId(risikoscenarioId)
        navigate(risikoscenarioUrl(risikoscenarioId))
      }
    } else {
      if (formRef.current?.dirty && !isCreateMode) {
        setIsUnsaved(true)
      } else {
        setIsTiltakFormActive(false)
        setActiveRisikoscenarioId('')
        navigate(window.location.pathname)
      }
    }
  }

  useEffect(() => {
    if (isCreateMode || isLeggTilEksisterendeMode || isTiltakFormActive) {
      setIsPvkFormActive(true)
    } else {
      setIsPvkFormActive(false)
    }
  }, [isCreateMode, isLeggTilEksisterendeMode, isTiltakFormActive])

  return (
    <div className='w-full'>
      <KravRisikoscenarioReadMore />

      <div className='mt-5'>
        {!isCreateMode && !isLeggTilEksisterendeMode && risikoscenarioForKrav.length === 0 && (
          <Alert variant='info' className='mb-5'>
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
          <div className='mb-5'>
            <Accordion>
              {risikoscenarioForKrav.map((risikoscenario: IRisikoscenario, index: number) => {
                const expanded: boolean = risikoscenarioId
                  ? risikoscenarioId === risikoscenario.id
                  : activeRisikoscenarioId === risikoscenario.id

                return (
                  <Accordion.Item
                    open={expanded}
                    id={risikoscenario.id}
                    key={`${index} ${risikoscenario.navn}`}
                    onOpenChange={(open: boolean) => {
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
                          etterlevelseDokumentasjonId={pvkDokument.etterlevelseDokumentId}
                          isCreateMode={isCreateMode}
                          kravnummer={krav.kravNummer}
                          risikoscenarioer={risikoscenarioer}
                          setRisikoscenarioer={setRisikoscenarioer}
                          risikoscenarioForKrav={risikoscenarioForKrav}
                          setRisikoscenarioForKrav={setRisikoscenarioForKrav}
                          tiltakList={tiltakList}
                          setTiltakList={setTiltakList}
                          setIsTiltakFormActive={setIsTiltakFormActive}
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

        {!isCreateMode && !isLeggTilEksisterendeMode && !isTiltakFormActive && (
          <div className='flex gap-2 mt-8 lg:flex-row flex-col'>
            <Button
              size='small'
              type='button'
              onClick={() => {
                if (formRef.current?.dirty) {
                  setIsUnsaved(true)
                } else {
                  setIsCreateMode(true)
                }
              }}
            >
              Opprett nytt risikoscenario
            </Button>
            {risikoscenarioer.length !== 0 && (
              <Button
                size='small'
                variant='secondary'
                type='button'
                onClick={() => {
                  if (formRef.current?.dirty) {
                    setIsUnsaved(true)
                  } else {
                    setIsLeggTilEksisterendeMode(true)
                  }
                }}
              >
                Legg til eksisterende risikoscenario
              </Button>
            )}
          </div>
        )}

        {!isCreateMode && !isLeggTilEksisterendeMode && pvkDokument && (
          <KravRisikoscenarioOvrigeRisikoscenarier pvkDokument={pvkDokument} />
        )}

        <AccordianAlertModal
          isOpen={isUnsaved}
          setIsOpen={setIsUnsaved}
          formRef={formRef}
          customOnClick={() => {
            if (selectedRisikoscenarioId) {
              setActiveRisikoscenarioId(selectedRisikoscenarioId)
            }
          }}
        />
      </div>
    </div>
  )
}

export default KravRisikoscenario
