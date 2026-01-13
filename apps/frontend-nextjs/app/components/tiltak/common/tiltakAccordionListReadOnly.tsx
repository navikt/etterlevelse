import NyttInnholdTag from '@/components/risikoscenario/common/NyttInnholdTag'
import { IRisikoscenario } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import { ITiltak } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/tiltak/tiltakConstants'
import { IVurdering } from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { Accordion, Tag } from '@navikt/ds-react'
import moment from 'moment'
import TiltakView from './tiltakView'

interface IProps {
  tiltakList: ITiltak[]
  risikoscenarioList: IRisikoscenario[]
  previousVurdering?: IVurdering
}

export const TiltakAccordionListReadOnly = (props: IProps) => {
  const { tiltakList, risikoscenarioList, previousVurdering } = props

  return (
    <Accordion>
      {tiltakList.map((tiltak) => {
        const isChangesMade =
          !!previousVurdering &&
          moment(tiltak.changeStamp.lastModifiedDate).isAfter(previousVurdering.sendtDato)
        return (
          <Accordion.Item key={tiltak.id}>
            <Accordion.Header>
              {tiltak.navn}&nbsp;&nbsp;{isChangesMade && <NyttInnholdTag />}
              <div className='flex gap-2'>
                {!tiltak.ansvarlig.navIdent && !tiltak.ansvarligTeam.name && (
                  <Tag variant='alt2'>Tiltaksansvarlig savnes</Tag>
                )}
                {!tiltak.frist && <Tag variant='alt2'>Tiltaksfrist savnes</Tag>}
              </div>
            </Accordion.Header>
            <Accordion.Content>
              <TiltakView tiltak={tiltak} risikoscenarioList={risikoscenarioList} />
            </Accordion.Content>
          </Accordion.Item>
        )
      })}
    </Accordion>
  )
}

export default TiltakAccordionListReadOnly
