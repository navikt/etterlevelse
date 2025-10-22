import DataTextWrapper from '@/components/common/DataTextWrapper/DataTextWrapper'
import { Markdown } from '@/components/common/markdown/markdown'
import { ICode } from '@/constants/kodeverk/kodeverkConstants'
import { IPvoTilbakemelding } from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { Heading, Label, List } from '@navikt/ds-react'
import { FunctionComponent } from 'react'

type TProps = {
  pvoTilbakemelding: IPvoTilbakemelding
  pvoVurderingList: ICode[]
}

export const BeskjedFraPvoReadOnly: FunctionComponent<TProps> = ({
  pvoTilbakemelding,
  pvoVurderingList,
}) => {
  const getPvoVurdering = () => {
    const vurderingen = pvoVurderingList.filter(
      (vurdering) => vurdering.code === pvoTilbakemelding.pvoVurdering
    )
    if (vurderingen.length === 0) {
      return ''
    } else {
      return vurderingen[0].description
    }
  }
  return (
    <div className='pt-9 mb-3 max-w-[75ch]'>
      <Heading level='2' size='medium' className='mb-5'>
        Tilbakemelding til etterlever
      </Heading>

      <div className='mb-3'>
        <Label>Beskjed til etterlever</Label>
        <DataTextWrapper>
          {pvoTilbakemelding.merknadTilEtterleverEllerRisikoeier ? (
            <Markdown source={pvoTilbakemelding.merknadTilEtterleverEllerRisikoeier} />
          ) : (
            'Ingen beskjed'
          )}
        </DataTextWrapper>
      </div>

      <div className='mb-3'>
        <Label>Anbefales det at arbeidet går videre som planlagt?</Label>
        <DataTextWrapper>
          {pvoTilbakemelding.arbeidGarVidere === null
            ? null
            : pvoTilbakemelding.arbeidGarVidere === true
              ? 'Ja'
              : 'Nei'}
        </DataTextWrapper>
      </div>

      <div className='mb-3'>
        <Label>Beskriv anbefalingen nærmere:</Label>
        <DataTextWrapper customEmptyMessage='Ingen beskrivelse'>
          {pvoTilbakemelding.arbeidGarVidereBegrunnelse}
        </DataTextWrapper>
      </div>

      <div className='mb-3'>
        <Label>Er det behov for forhåndskonsultasjon med Datatilsynet?</Label>
        <DataTextWrapper>
          {pvoTilbakemelding.behovForForhandskonsultasjon === null
            ? null
            : pvoTilbakemelding.behovForForhandskonsultasjon === true
              ? 'Ja'
              : 'Nei'}
        </DataTextWrapper>
      </div>

      <div className='mb-3'>
        <Label>Beskriv anbefalingen nærmere:</Label>
        <DataTextWrapper customEmptyMessage='Ingen beskrivelse'>
          {pvoTilbakemelding.behovForForhandskonsultasjonBegrunnelse}
        </DataTextWrapper>
      </div>

      <div className='mb-3'>
        <Label>Personvernombudets vurdering</Label>
        <DataTextWrapper>
          {getPvoVurdering()}
          {(pvoTilbakemelding.pvoFolgeOppEndringer || pvoTilbakemelding.vilFaPvkIRetur) && (
            <List>
              {pvoTilbakemelding.pvoFolgeOppEndringer && (
                <List.Item>PVO vil følge opp endringer dere gjør.</List.Item>
              )}
              {pvoTilbakemelding.vilFaPvkIRetur && (
                <List.Item>
                  PVO vil få PVK i retur etter at dere har gjennomgått tilbakemeldinger.
                </List.Item>
              )}
            </List>
          )}
        </DataTextWrapper>
      </div>
    </div>
  )
}
