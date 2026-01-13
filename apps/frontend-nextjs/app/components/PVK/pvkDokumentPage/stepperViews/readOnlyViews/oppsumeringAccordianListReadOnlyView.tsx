'use client'

import NyttInnholdTag from '@/components/risikoscenario/common/NyttInnholdTag'
import RisikoscenarioView from '@/components/risikoscenario/common/RisikoscenarioView'
import RisikoscenarioAccordianHeader from '@/components/risikoscenario/common/risikoscenarioAccordionHeader'
import RisikoscenarioTag from '@/components/risikoscenario/common/risikoscenarioTag'
import { RisikoscenarioTiltakHeader } from '@/components/risikoscenario/common/risikoscenarioTiltakHeader'
import TiltakView from '@/components/tiltak/common/tiltakView'
import { IRisikoscenario } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import { ITiltak } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/tiltak/tiltakConstants'
import { IVurdering } from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import {
  pvkDokumentasjonTabFilterRisikoscenarioUrl,
  pvkDokumentasjonTabFilterUrl,
} from '@/routes/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensvurderingRoutes'
import {
  getKonsekvenssnivaaText,
  getSannsynlighetsnivaaText,
} from '@/util/risikoscenario/risikoscenarioUtils'
import { Accordion, Alert, BodyLong, Label, ReadMore } from '@navikt/ds-react'
import moment from 'moment'
import { useRouter, useSearchParams } from 'next/navigation'
import { FunctionComponent, RefObject, useEffect, useRef } from 'react'

type TProps = {
  risikoscenarioList: IRisikoscenario[]
  allRisikoscenarioList: IRisikoscenario[]
  etterlevelseDokumentasjonId: string
  tiltakList: ITiltak[]
  noMarkdownCopyLinkButton?: boolean
  previousVurdering?: IVurdering
}

export const OppsumeringAccordianListReadOnlyView: FunctionComponent<TProps> = ({
  risikoscenarioList,
  allRisikoscenarioList,
  etterlevelseDokumentasjonId,
  tiltakList,
  noMarkdownCopyLinkButton,
  previousVurdering,
}) => {
  const router = useRouter()
  const queryParams = useSearchParams()
  const accordionRef: RefObject<HTMLButtonElement | null> = useRef<HTMLButtonElement>(null)

  const steg: string | null = queryParams.get('steg')
  const risikoscenarioId: string | null = queryParams.get('risikoscenario')
  const tabQuery: string | null = queryParams.get('tab')
  const filterQuery: string | null = queryParams.get('filter')

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
      router.push(
        pvkDokumentasjonTabFilterRisikoscenarioUrl(steg, tabQuery, filterQuery, risikoscenarioId),
        { scroll: false }
      )
      setTimeout(() => {
        if (accordionRef.current) {
          window.scrollTo({ top: accordionRef.current.offsetTop - 30, behavior: 'smooth' })
        }
      }, 200)
    } else {
      router.push(pvkDokumentasjonTabFilterUrl(steg, tabQuery, filterQuery), {
        scroll: false,
      })
    }
  }

  return (
    <div>
      <Accordion>
        {risikoscenarioList.map((risikoscenario: IRisikoscenario, index: number) => {
          const expanded = risikoscenarioId === risikoscenario.id

          const revurdertEffektCheck =
            risikoscenario.sannsynlighetsNivaaEtterTiltak === 0 ||
            risikoscenario.sannsynlighetsNivaaEtterTiltak === null ||
            risikoscenario.konsekvensNivaaEtterTiltak === 0 ||
            risikoscenario.konsekvensNivaaEtterTiltak === null

          const hasNewContent =
            !!previousVurdering &&
            (moment(risikoscenario.changeStamp.lastModifiedDate).isAfter(
              previousVurdering.sendtDato
            ) ||
              tiltakList
                .filter((tiltak: ITiltak) => risikoscenario.tiltakIds.includes(tiltak.id))
                .some((tiltak: ITiltak) =>
                  moment(tiltak.changeStamp.lastModifiedDate).isAfter(previousVurdering.sendtDato)
                ))

          return (
            <Accordion.Item
              id={risikoscenario.id}
              key={`${index}_${risikoscenario.id}`}
              open={expanded}
              onOpenChange={(open) => {
                handleAccordionChange(open ? risikoscenario.id : undefined)
              }}
            >
              <RisikoscenarioAccordianHeader
                risikoscenario={risikoscenario}
                ref={expanded ? accordionRef : undefined}
                hasNewContent={hasNewContent}
              />
              <Accordion.Content>
                <RisikoscenarioView
                  risikoscenario={risikoscenario}
                  etterlevelseDokumentasjonId={etterlevelseDokumentasjonId}
                  markdownCopyLinkButton={!noMarkdownCopyLinkButton}
                />
                <div className='mt-12'>
                  <RisikoscenarioTiltakHeader />
                  {risikoscenario.ingenTiltak && <BodyLong>Vi skal ikke ha tiltak.</BodyLong>}

                  {!risikoscenario.ingenTiltak && risikoscenario.tiltakIds.length !== 0 && (
                    <div className='mt-5'>
                      {tiltakList
                        .filter((tiltak: ITiltak) => risikoscenario.tiltakIds.includes(tiltak.id))
                        .map((tiltak: ITiltak, index: number) => {
                          const isChangesMade =
                            (previousVurdering &&
                              moment(tiltak.changeStamp.lastModifiedDate).isAfter(
                                previousVurdering.sendtDato
                              )) ||
                            false

                          return (
                            <ReadMore
                              key={`${risikoscenario.id}_${tiltak.id}_${index}`}
                              header={
                                <>
                                  {tiltak.navn} &nbsp;&nbsp; {isChangesMade && <NyttInnholdTag />}
                                </>
                              }
                              className='mb-3'
                            >
                              <TiltakView
                                tiltak={tiltak}
                                risikoscenarioList={allRisikoscenarioList}
                              />
                            </ReadMore>
                          )
                        })}
                    </div>
                  )}

                  {!risikoscenario.ingenTiltak && risikoscenario.tiltakIds.length === 0 && (
                    <div className='mt-5'>
                      <Alert className='mt-3' variant='warning'>
                        Dere må legge inn tiltak under Identifisering av risikoscenarioer og tiltak.
                      </Alert>
                    </div>
                  )}

                  <div className='mt-5'>
                    <Label>Antatt risikonivå etter gjennomførte tiltak </Label>

                    {revurdertEffektCheck && (
                      <Alert className='mt-3' variant='warning'>
                        Dere må vurdere tiltakenes effekt
                      </Alert>
                    )}

                    {!revurdertEffektCheck && (
                      <div className='mt-3'>
                        <RisikoscenarioTag
                          level={risikoscenario.sannsynlighetsNivaaEtterTiltak}
                          text={getSannsynlighetsnivaaText(
                            risikoscenario.sannsynlighetsNivaaEtterTiltak
                          )}
                        />

                        <div className='mt-3'>
                          <RisikoscenarioTag
                            level={risikoscenario.konsekvensNivaaEtterTiltak}
                            text={getKonsekvenssnivaaText(
                              risikoscenario.konsekvensNivaaEtterTiltak
                            )}
                          />
                        </div>

                        {risikoscenario.nivaaBegrunnelseEtterTiltak !== '' && (
                          <BodyLong className='mt-3'>
                            {risikoscenario.nivaaBegrunnelseEtterTiltak}
                          </BodyLong>
                        )}

                        {risikoscenario.nivaaBegrunnelseEtterTiltak === '' && (
                          <Alert variant='warning' inline className='mt-3'>
                            Dere må begrunne denne vurderingen av tiltakenes effekt.
                          </Alert>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Accordion.Content>
            </Accordion.Item>
          )
        })}
      </Accordion>
    </div>
  )
}

export default OppsumeringAccordianListReadOnlyView
