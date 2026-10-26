'use client'

import { Accordion } from '@navikt/ds-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FunctionComponent, RefObject, useEffect, useRef, useState } from 'react'
import AccordianAlertModal from '@/components/common/accordianAlertModal'
import { RisikoscenarioAccordianHeader } from '@/components/risikoscenario/common/risikoscenarioAccordionHeader'
import { IRisikoscenario } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import { ITiltak } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/tiltak/tiltakConstants'
import {
  pvkDokumentasjonTabFilterRisikoscenarioUrl,
  pvkDokumentasjonTabFilterUrl,
} from '@/routes/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensvurderingRoutes'
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

const OppsumeringAccordianList: FunctionComponent<TProps> = ({
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
  const selectedRisikoscenarioIndex = risikoscenarioList.findIndex(
    (risikoscenario) => risikoscenario.id === risikoscenarioId
  )

  useEffect(() => {
    if (risikoscenarioId && selectedRisikoscenarioIndex !== -1 && accordionRef.current) {
      accordionRef.current.focus({ preventScroll: true })
      accordionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [risikoscenarioId, selectedRisikoscenarioIndex])

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
        {risikoscenarioList.map((risikoscenario: IRisikoscenario) => {
          const expanded: boolean = risikoscenarioId === risikoscenario.id

          return (
            <Accordion.Item
              id={risikoscenario.id}
              key={risikoscenario.id}
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

      <AccordianAlertModal
        isOpen={isUnsaved}
        setIsOpen={setIsUnsaved}
        navigateUrl={navigateUrl}
        formRef={formRef}
      />
    </div>
  )
}

export default OppsumeringAccordianList
