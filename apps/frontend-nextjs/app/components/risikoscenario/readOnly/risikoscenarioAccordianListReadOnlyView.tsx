'use client'

import TiltakView from '@/components/tiltak/common/tiltakView'
import { IRisikoscenario } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import { ITiltak } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/tiltak/tiltakConstants'
import { risikoscenarioUrl } from '@/routes/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensvurderingRoutes'
import { Accordion, Alert, BodyLong, ReadMore } from '@navikt/ds-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { FunctionComponent, useEffect, useRef } from 'react'
import RisikoscenarioView from '../common/RisikoscenarioView'
import { IdentifiseringAvRisikoscenarioAccordianHeader } from '../common/risikoscenarioAccordionHeader'
import { RisikoscenarioTiltakHeader } from '../common/risikoscenarioTiltakHeader'

type TProps = {
  risikoscenarioList: IRisikoscenario[]
  etterlevelseDokumentasjonId: string
  allRisikoscenarioList: IRisikoscenario[]
  tiltakList: ITiltak[]
}

export const RisikoscenarioAccordianListReadOnlyView: FunctionComponent<TProps> = ({
  risikoscenarioList,
  allRisikoscenarioList,
  tiltakList,
  etterlevelseDokumentasjonId,
}) => {
  const router = useRouter()
  const pathName = usePathname()
  const accordionRef = useRef<HTMLButtonElement>(null)
  const queryParams = useSearchParams()
  const steg: string | undefined = queryParams.get('steg') || undefined
  const risikoscenarioId: string | null = queryParams.get('risikoscenario')
  const tiltakId: string | null = queryParams.get('tiltak')

  useEffect(() => {
    if (risikoscenarioId) {
      setTimeout(() => {
        const element: HTMLElement | null = document.getElementById(risikoscenarioId)

        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })

          if (tiltakId) {
            const tiltakElement: HTMLElement | null = document.getElementById(
              `${risikoscenarioId}_${tiltakId}`
            )

            if (tiltakElement) {
              tiltakElement.focus()
              tiltakElement.scrollIntoView({ behavior: 'smooth' })
            }
          }
        }
      }, 200)
    }
  }, [])

  const handleAccordionChange = (risikoscenarioId?: string): void => {
    if (risikoscenarioId) {
      router.push(risikoscenarioUrl(risikoscenarioId, steg), { scroll: false })
      setTimeout(() => {
        if (accordionRef.current) {
          window.scrollTo({ top: accordionRef.current.offsetTop - 30, behavior: 'smooth' })
        }
      }, 200)
    } else {
      router.push(`${pathName}?steg=${steg}`, { scroll: false })
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
              key={`${index}_${risikoscenario.navn}`}
              open={expanded}
              onOpenChange={(open: boolean) => {
                handleAccordionChange(open ? risikoscenario.id : undefined)
              }}
            >
              <IdentifiseringAvRisikoscenarioAccordianHeader
                risikoscenario={risikoscenario}
                ref={expanded ? accordionRef : undefined}
              />
              <Accordion.Content>
                {expanded && (
                  <div>
                    <RisikoscenarioView
                      risikoscenario={risikoscenario}
                      etterlevelseDokumentasjonId={etterlevelseDokumentasjonId}
                      markdownCopyLinkButton={true}
                    />
                    <div className='mt-12'>
                      <RisikoscenarioTiltakHeader />
                      {risikoscenario.ingenTiltak && <BodyLong>Vi skal ikke ha tiltak.</BodyLong>}

                      {!risikoscenario.ingenTiltak && risikoscenario.tiltakIds.length !== 0 && (
                        <div className='mt-5'>
                          {tiltakList
                            .filter((tiltak: ITiltak) =>
                              risikoscenario.tiltakIds.includes(tiltak.id)
                            )
                            .map((tiltak: ITiltak, index: number) => (
                              <ReadMore
                                key={risikoscenario.id + '_' + tiltak.id + '_' + index}
                                header={tiltak.navn}
                                className='mb-3'
                              >
                                <TiltakView
                                  tiltak={tiltak}
                                  risikoscenarioList={allRisikoscenarioList}
                                />
                              </ReadMore>
                            ))}
                        </div>
                      )}

                      {!risikoscenario.ingenTiltak && risikoscenario.tiltakIds.length === 0 && (
                        <div className='mt-5'>
                          <Alert className='mt-3' variant='warning'>
                            Dere må legge inn tiltak under Identifisering av risikoscenarioer og
                            tiltak.
                          </Alert>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Accordion.Content>
            </Accordion.Item>
          )
        })}
      </Accordion>
    </div>
  )
}

export default RisikoscenarioAccordianListReadOnlyView
