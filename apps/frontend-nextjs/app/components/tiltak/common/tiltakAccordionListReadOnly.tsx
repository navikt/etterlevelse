import { Accordion, Tag } from '@navikt/ds-react'
import moment from 'moment'
import NyttInnholdTag from '@/components/risikoscenario/common/NyttInnholdTag'
import { IRisikoscenario } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import { ITiltak } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/tiltak/tiltakConstants'
import { IVurdering } from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { TiltakView } from './tiltakView'

interface IProps {
  tiltakList: ITiltak[]
  risikoscenarioList: IRisikoscenario[]
  previousVurdering?: IVurdering
  etterlevelseDokumentasjonId?: string
  nyttInnholdFraDato?: string
}

const TiltakAccordionListReadOnly = (props: IProps) => {
  const {
    tiltakList,
    risikoscenarioList,
    previousVurdering,
    etterlevelseDokumentasjonId,
    nyttInnholdFraDato,
  } = props

  const nyttInnholdBaseline = previousVurdering?.sendtDato ?? nyttInnholdFraDato

  return (
    <Accordion className='mt-4'>
      {tiltakList.map((tiltak) => {
        const isChangesMade =
          !!nyttInnholdBaseline &&
          moment(tiltak.changeStamp.lastModifiedDate).isAfter(nyttInnholdBaseline)
        return (
          <Accordion.Item key={tiltak.id}>
            <Accordion.Header className='sticky top-0 z-1 bg-white'>
              {tiltak.navn}&nbsp;&nbsp;{isChangesMade && <NyttInnholdTag />}
              <div className='flex gap-2'>
                {!tiltak.ansvarlig.navIdent && !tiltak.ansvarligTeam.name && (
                  <Tag variant='alt2'>Tiltaksansvarlig savnes</Tag>
                )}
                {!tiltak.frist && <Tag variant='alt2'>Tiltaksfrist savnes</Tag>}
              </div>
            </Accordion.Header>
            <Accordion.Content>
              <TiltakView
                tiltak={tiltak}
                risikoscenarioList={risikoscenarioList}
                etterlevelseDokumentasjonId={etterlevelseDokumentasjonId}
              />
            </Accordion.Content>
          </Accordion.Item>
        )
      })}
    </Accordion>
  )
}

export default TiltakAccordionListReadOnly
