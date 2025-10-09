'use client'

import { getPvkDokument } from '@/api/pvkDokument/pvkDokumentApi'
import { getRisikoscenarioByPvkDokumentId } from '@/api/risikoscenario/risikoscenarioApi'
import { getTiltakByPvkDokumentId } from '@/api/tiltak/tiltakApi'
import AlertPvoUnderarbeidModal from '@/components/pvoTilbakemelding/alertPvoUnderarbeidModal'
import { IPageResponse } from '@/constants/commonConstants'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import {
  ERisikoscenarioType,
  IRisikoscenario,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import { ITiltak } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/tiltak/tiltakConstants'
import { TKravQL } from '@/constants/krav/kravConstants'
import { risikoscenarioUrl } from '@/routes/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensvurderingRoutes'
import { isReadOnlyPvkStatus } from '@/util/etterlevelseDokumentasjon/pvkDokument/pvkDokumentUtils'
import { Accordion, Alert, Button, Loader } from '@navikt/ds-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { FunctionComponent, RefObject, useEffect, useState } from 'react'
import { KravRisikoscenarioOvrigeRisikoscenarierLink } from '../common/kravRisikoscenarioOvrigeRisikoscenarierLink'
import { KravRisikoscenarioReadMore } from '../common/kravRisikoscenarioReadMore'
import CreateRisikoscenario from '../edit/createRisikoscenario'
import LeggTilEksisterendeRisikoscenario from '../edit/leggTilEksisterendeRisikoscenario'
import { KravRisikoscenarioAccordionContent } from './kravRisikoscenarioAccordionContent'

type TProps = {
  krav: TKravQL
  pvkDokument: IPvkDokument
  setIsPvkFormActive: (state: boolean) => void
  formRef: RefObject<any>
}

export const KravRisikoscenarioer: FunctionComponent<TProps> = ({
  krav,
  pvkDokument,
  setIsPvkFormActive,
  formRef,
}) => {
  const [isCreateMode, setIsCreateMode] = useState<boolean>(false)
  const [isLeggTilEksisterendeMode, setIsLeggTilEksisterendeMode] = useState<boolean>(false)
  const [, setIsUnsaved] = useState<boolean>(false)
  const [alleRisikoscenarioer, setAlleRisikoscenarioer] = useState<IRisikoscenario[]>([])
  const [risikoscenarioer, setRisikoscenarioer] = useState<IRisikoscenario[]>([])
  const [risikoscenarioForKrav, setRisikoscenarioForKrav] = useState<IRisikoscenario[]>([])
  const [tiltakList, setTiltakList] = useState<ITiltak[]>([])
  const [activeRisikoscenarioId, setActiveRisikoscenarioId] = useState<string>('')
  const [, setSelectedRisikoscenarioId] = useState<string>('')
  const [isTiltakFormActive, setIsTiltakFormActive] = useState<boolean>(false)
  const [isPvoAlertModalOpen, setIsPvoAlertModalOpen] = useState<boolean>(false)
  const pathName = usePathname()
  const queryParams = useSearchParams()
  const risikoscenarioId: string | null = queryParams.get('risikoscenario')
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const activateFormButton = async (runFunction: () => void) => {
    await getPvkDokument(pvkDokument.id).then((response) => {
      if (isReadOnlyPvkStatus(response.status)) {
        setIsPvoAlertModalOpen(true)
      } else {
        runFunction()
      }
    })
  }

  useEffect(() => {
    ;(async () => {
      if (pvkDokument && krav) {
        setIsLoading(true)
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
        setIsLoading(false)
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
        router.push(risikoscenarioUrl(risikoscenarioId))
      }
    } else {
      if (formRef.current?.dirty && !isCreateMode) {
        setIsUnsaved(true)
      } else {
        setIsTiltakFormActive(false)
        setActiveRisikoscenarioId('')
        router.push(pathName)
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
      {isLoading && (
        <div className='flex justify-center items-center w-full'>
          <Loader size='2xlarge' title='Loading' />
        </div>
      )}
      {!isLoading && (
        <div className='w-full'>
          <KravRisikoscenarioReadMore defaultOpen={risikoscenarioForKrav.length === 0} />

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
                              setAlleRisikoscenarioer={setAlleRisikoscenarioer}
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
                  onClick={async () =>
                    await activateFormButton(() => {
                      if (formRef.current?.dirty) {
                        setIsUnsaved(true)
                      } else {
                        setIsCreateMode(true)
                      }
                    })
                  }
                >
                  Opprett nytt risikoscenario
                </Button>
                {risikoscenarioer.length !== 0 && (
                  <Button
                    size='small'
                    variant='secondary'
                    type='button'
                    onClick={async () =>
                      await activateFormButton(() => {
                        if (formRef.current?.dirty) {
                          setIsUnsaved(true)
                        } else {
                          setIsLeggTilEksisterendeMode(true)
                        }
                      })
                    }
                  >
                    Legg til eksisterende risikoscenario
                  </Button>
                )}
              </div>
            )}

            {!isCreateMode && !isLeggTilEksisterendeMode && pvkDokument && (
              <KravRisikoscenarioOvrigeRisikoscenarierLink pvkDokument={pvkDokument} />
            )}

            {isPvoAlertModalOpen && (
              <AlertPvoUnderarbeidModal
                isOpen={isPvoAlertModalOpen}
                onClose={() => setIsPvoAlertModalOpen(false)}
                pvkDokumentId={pvkDokument.id}
              />
            )}

            {/* <AccordianAlertModal
              isOpen={isUnsaved}
              setIsOpen={setIsUnsaved}
              formRef={formRef}
              customOnClick={() => {
                if (selectedRisikoscenarioId !== '') {
                  setActiveRisikoscenarioId(selectedRisikoscenarioId)
                  setIsTiltakFormActive(false)
                  router.push(risikoscenarioUrl(selectedRisikoscenarioId))
                } else if (selectedRisikoscenarioId === '') {
                  setActiveRisikoscenarioId('')
                  setIsTiltakFormActive(false)
                  router.push(pathName)
                }
              }}
            /> */}
          </div>
        </div>
      )}
    </div>
  )
}

export default KravRisikoscenarioer
