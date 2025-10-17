'use client'

import RisikoscenarioAccordianAlertModal from '@/components/risikoscenario/common/risikoscenarioAccordianAlertModal'
import RisikoscenarioAccordianHeader from '@/components/risikoscenario/common/risikoscenarioAccordionHeader'
import { IRisikoscenario } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import { ITiltak } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/tiltak/tiltakConstants'
import {
  pvkDokumentasjonTabFilterRisikoscenarioUrl,
  pvkDokumentasjonTabFilterUrl,
} from '@/routes/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensvurderingRoutes'
import { Accordion } from '@navikt/ds-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FunctionComponent, RefObject, useEffect, useRef, useState } from 'react'
import OppsumeringAccordianContent from './oppsumeringAccordianContent'

type TProps = {
  risikoscenarioList: IRisikoscenario[]
  setRisikosenarioList: (state: IRisikoscenario[]) => void
  allRisikoscenarioList: IRisikoscenario[]
  etterlevelseDokumentasjonId: string
  setAllRisikoscenarioList: (state: IRisikoscenario[]) => void
  tiltakList: ITiltak[]
  setTiltakList: (state: ITiltak[]) => void
  formRef: RefObject<any>
  isUnsaved: boolean
  setIsUnsaved: (state: boolean) => void
}

export const OppsumeringAccordianList: FunctionComponent<TProps> = ({
  risikoscenarioList,
  setRisikosenarioList,
  allRisikoscenarioList,
  setAllRisikoscenarioList,
  etterlevelseDokumentasjonId,
  tiltakList,
  setTiltakList,
  formRef,
  isUnsaved,
  setIsUnsaved,
}) => {
  const router = useRouter()
  const queryParams = useSearchParams()
  const steg: string | null = queryParams.get('steg')
  const risikoscenarioId: string | null = queryParams.get('risikoscenario')
  const tabQuery: string | null = queryParams.get('tab')
  const filterQuery: string | null = queryParams.get('filter')
  const accordionRef = useRef<HTMLButtonElement>(null)

  const [navigateUrl, setNavigateUrl] = useState<string>('')

  useEffect(() => {
    if (risikoscenarioId) {
      setTimeout(() => {
        const element: HTMLElement | null = document.getElementById(risikoscenarioId)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }, 200)
    }
  }, [])

  const handleAccordionChange = (risikoscenarioId?: string): void => {
    if (risikoscenarioId) {
      setNavigateUrl(
        pvkDokumentasjonTabFilterRisikoscenarioUrl(steg, tabQuery, filterQuery, risikoscenarioId)
      )
      if (formRef.current?.dirty) {
        setIsUnsaved(true)
      } else {
        router.push(
          pvkDokumentasjonTabFilterRisikoscenarioUrl(steg, tabQuery, filterQuery, risikoscenarioId),
          { scroll: false }
        )
      }
      setTimeout(() => {
        if (accordionRef.current) {
          window.scrollTo({ top: accordionRef.current.offsetTop - 30, behavior: 'smooth' })
        }
      }, 200)
    } else {
      setNavigateUrl(pvkDokumentasjonTabFilterUrl(steg, tabQuery, filterQuery))
      if (formRef.current?.dirty) {
        setIsUnsaved(true)
      } else {
        router.push(pvkDokumentasjonTabFilterUrl(steg, tabQuery, filterQuery), { scroll: false })
      }
    }
  }

  return (
    <div>
      <Accordion>
        {risikoscenarioList.map((risikoscenario: IRisikoscenario, index: number) => {
          const expanded: boolean = risikoscenarioId === risikoscenario.id

          return (
            <Accordion.Item
              id={risikoscenario.id}
              key={`${index}_${risikoscenario.id}`}
              open={expanded}
              onOpenChange={(open: boolean) => {
                handleAccordionChange(open ? risikoscenario.id : undefined)
              }}
            >
              <RisikoscenarioAccordianHeader
                risikoscenario={risikoscenario}
                ref={expanded ? accordionRef : undefined}
              />
              <Accordion.Content>
                {expanded && (
                  <OppsumeringAccordianContent
                    risikoscenario={risikoscenario}
                    risikoscenarioList={risikoscenarioList}
                    setRisikosenarioList={setRisikosenarioList}
                    etterlevelseDokumentasjonId={etterlevelseDokumentasjonId}
                    allRisikoscenarioList={allRisikoscenarioList}
                    setAllRisikoscenarioList={setAllRisikoscenarioList}
                    tiltakList={tiltakList}
                    setTiltakList={setTiltakList}
                    formRef={formRef}
                  />
                )}
              </Accordion.Content>
            </Accordion.Item>
          )
        })}
      </Accordion>

      <RisikoscenarioAccordianAlertModal
        isOpen={isUnsaved}
        setIsOpen={setIsUnsaved}
        navigateUrl={navigateUrl}
        formRef={formRef}
      />
    </div>
  )
}

export default OppsumeringAccordianList
