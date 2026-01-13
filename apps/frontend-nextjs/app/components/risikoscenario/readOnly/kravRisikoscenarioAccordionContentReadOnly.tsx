'use client'

import TiltakView from '@/components/tiltak/common/tiltakView'
import { IRisikoscenario } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import { ITiltak } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/tiltak/tiltakConstants'
import { IVurdering } from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { BodyLong, BodyShort, ReadMore } from '@navikt/ds-react'
import moment from 'moment'
import { FunctionComponent, useState } from 'react'
import NyttInnholdTag from '../common/NyttInnholdTag'
import { RisikoscenarioTiltakHeader } from '../common/risikoscenarioTiltakHeader'
import RisikoscenarioViewReadOnly from './RisikoscenarioViewReadOnly'

type TProps = {
  risikoscenario: IRisikoscenario
  alleRisikoscenarioer: IRisikoscenario[]
  tiltakList: ITiltak[]
  previousVurdering?: IVurdering
}

export const KravRisikoscenarioAccordionContentReadOnly: FunctionComponent<TProps> = ({
  risikoscenario,
  alleRisikoscenarioer,
  tiltakList,
  previousVurdering,
}) => {
  const [openedTiltakId, setOpenedTiltakId] = useState<string>('')
  const filterTiltakId: ITiltak[] = tiltakList.filter((tiltak: ITiltak) =>
    risikoscenario.tiltakIds.includes(tiltak.id)
  )

  return (
    <div>
      <RisikoscenarioViewReadOnly risikoscenario={risikoscenario} noCopyButton={true} />

      <div className='mt-12'>
        <RisikoscenarioTiltakHeader />

        {!risikoscenario.ingenTiltak && filterTiltakId.length !== 0 && (
          <div>
            {filterTiltakId.map((tiltak: ITiltak, index: number) => {
              const isChangesMade: boolean =
                !!previousVurdering &&
                moment(tiltak.changeStamp.lastModifiedDate).isAfter(previousVurdering.sendtDato)
              return (
                <div className='mt-3' key={risikoscenario.id + '_' + tiltak.id + '_' + index}>
                  <ReadMore
                    open={openedTiltakId === tiltak.id}
                    id={risikoscenario.id + '_' + tiltak.id}
                    className='mb-3'
                    onOpenChange={(open) => {
                      if (open) {
                        setOpenedTiltakId(tiltak.id)
                      } else {
                        setOpenedTiltakId('')
                      }
                    }}
                    header={
                      <>
                        {tiltak.navn} &nbsp;&nbsp;{isChangesMade && <NyttInnholdTag />}
                      </>
                    }
                  >
                    <TiltakView tiltak={tiltak} risikoscenarioList={alleRisikoscenarioer} />
                  </ReadMore>
                </div>
              )
            })}
          </div>
        )}

        {!risikoscenario.ingenTiltak && filterTiltakId.length === 0 && (
          <BodyShort>Risikoscenario mangler tiltak</BodyShort>
        )}

        {risikoscenario.ingenTiltak && (
          <div className='mt-3'>
            {!risikoscenario.ingenTiltak && <BodyLong>Vi skal ikke ha tiltak</BodyLong>}
          </div>
        )}
      </div>
    </div>
  )
}

export default KravRisikoscenarioAccordionContentReadOnly
