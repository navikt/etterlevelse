'use client'

import { TiltakViewWithIverksetting } from '@/components/tiltak/common/tiltakView'
import { IRisikoscenario } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import { ITiltak } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/tiltak/tiltakConstants'
import { IVurdering } from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { risikoscenarioUrl } from '@/routes/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensvurderingRoutes'
import { Accordion, Alert, BodyLong, ReadMore } from '@navikt/ds-react'
import moment from 'moment'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { FunctionComponent, useEffect, useRef, useState } from 'react'
import NyttInnholdTag from './NyttInnholdTag'
import RisikoscenarioView from './RisikoscenarioView'
import { IdentifiseringAvRisikoscenarioAccordianHeader } from './risikoscenarioAccordionHeader'
import { RisikoscenarioTiltakHeader } from './risikoscenarioTiltakHeader'

type TProps = {
  risikoscenarioList: IRisikoscenario[]
  etterlevelseDokumentasjonId: string
  allRisikoscenarioList: IRisikoscenario[]
  tiltakList: ITiltak[]
  setTiltakList: (state: ITiltak[]) => void
  previousVurdering?: IVurdering
}

export const RisikoscenarioAccordianListReadOnlyWithIverksetting: FunctionComponent<TProps> = ({
  risikoscenarioList,
  allRisikoscenarioList,
  tiltakList,
  setTiltakList,
  etterlevelseDokumentasjonId,
  previousVurdering,
}) => {
  const router = useRouter()
  const pathName = usePathname()
  const accordionRef = useRef<HTMLButtonElement>(null)
  const queryParams = useSearchParams()
  const steg: string | undefined = queryParams.get('steg') || undefined
  const risikoscenarioId: string | null = queryParams.get('risikoscenario')
  const tiltakId: string | null = queryParams.get('tiltak')
  const [expandedReadMore, setExpandedReadMore] = useState<Set<string>>(new Set())

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

          const hasNewContent = tiltakList
            .filter((tiltak: ITiltak) => risikoscenario.tiltakIds.includes(tiltak.id))
            .some(
              (tiltak: ITiltak) =>
                previousVurdering &&
                moment(tiltak.changeStamp.lastModifiedDate).isAfter(previousVurdering.sendtDato)
            )

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
                previousVurdering={previousVurdering}
                hasNewContent={hasNewContent}
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
                          {risikoscenario.tiltakIds
                            .map((tiltakId: string) => tiltakList.find((t) => t.id === tiltakId))
                            .filter(
                              (tiltak: ITiltak | undefined): tiltak is ITiltak =>
                                tiltak !== undefined
                            )
                            .map((tiltak: ITiltak) => {
                              const isChangesMade =
                                (previousVurdering &&
                                  moment(tiltak.changeStamp.lastModifiedDate).isAfter(
                                    previousVurdering.sendtDato
                                  )) ||
                                false

                              return (
                                <ReadMore
                                  key={risikoscenario.id + '_' + tiltak.id}
                                  header={
                                    <>
                                      {tiltak.navn} &nbsp;&nbsp;{' '}
                                      {isChangesMade && <NyttInnholdTag />}
                                    </>
                                  }
                                  className='mb-3'
                                  open={expandedReadMore.has(risikoscenario.id + '_' + tiltak.id)}
                                  onOpenChange={(open: boolean) => {
                                    const id = risikoscenario.id + '_' + tiltak.id
                                    setExpandedReadMore((prev) => {
                                      const newSet = new Set(prev)
                                      if (open) {
                                        newSet.add(id)
                                      } else {
                                        newSet.delete(id)
                                      }
                                      return newSet
                                    })
                                  }}
                                >
                                  <TiltakViewWithIverksetting
                                    tiltak={tiltak}
                                    risikoscenarioList={allRisikoscenarioList}
                                    tiltakList={tiltakList}
                                    setTiltakList={setTiltakList}
                                  />
                                </ReadMore>
                              )
                            })}
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

export default RisikoscenarioAccordianListReadOnlyWithIverksetting
