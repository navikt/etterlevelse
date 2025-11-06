import DataTextWrapper from '@/components/common/DataTextWrapper/DataTextWrapper'
import { Markdown } from '@/components/common/markdown/markdown'
import { ICode } from '@/constants/kodeverk/kodeverkConstants'
import { IVurdering } from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { Heading, Label, List } from '@navikt/ds-react'
import { FunctionComponent } from 'react'

type TProps = {
  relevantVurdering: IVurdering
  pvoVurderingList: ICode[]
}

export const BeskjedFraPvoReadOnly: FunctionComponent<TProps> = ({
  relevantVurdering,
  pvoVurderingList,
}) => {
  const getPvoVurdering = () => {
    const vurderingen = pvoVurderingList.filter(
      (vurdering) => vurdering.code === relevantVurdering.pvoVurdering
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
          {relevantVurdering.merknadTilEtterleverEllerRisikoeier ? (
            <Markdown source={relevantVurdering.merknadTilEtterleverEllerRisikoeier} />
          ) : (
            'Ingen beskjed'
          )}
        </DataTextWrapper>
      </div>

      <div className='mb-3'>
        <Label>Anbefales det at arbeidet går videre som planlagt?</Label>
        <DataTextWrapper>
          {relevantVurdering.arbeidGarVidere === null
            ? null
            : relevantVurdering.arbeidGarVidere === true
              ? 'Ja'
              : 'Nei'}
        </DataTextWrapper>
      </div>

      <div className='mb-3'>
        <Label>Beskriv anbefalingen nærmere:</Label>
        <DataTextWrapper customEmptyMessage='Ingen beskrivelse'>
          {relevantVurdering.arbeidGarVidereBegrunnelse}
        </DataTextWrapper>
      </div>

      <div className='mb-3'>
        <Label>Er det behov for forhåndskonsultasjon med Datatilsynet?</Label>
        <DataTextWrapper>
          {relevantVurdering.behovForForhandskonsultasjon === null
            ? null
            : relevantVurdering.behovForForhandskonsultasjon === true
              ? 'Ja'
              : 'Nei'}
        </DataTextWrapper>
      </div>

      <div className='mb-3'>
        <Label>Beskriv anbefalingen nærmere:</Label>
        <DataTextWrapper customEmptyMessage='Ingen beskrivelse'>
          {relevantVurdering.behovForForhandskonsultasjonBegrunnelse}
        </DataTextWrapper>
      </div>

      <div className='mb-3'>
        <Label>Personvernombudets vurdering</Label>
        <DataTextWrapper>
          {getPvoVurdering()}
          {(relevantVurdering.pvoFolgeOppEndringer || relevantVurdering.vilFaPvkIRetur) && (
            <List>
              {relevantVurdering.pvoFolgeOppEndringer && (
                <List.Item>PVO vil følge opp endringer dere gjør.</List.Item>
              )}
              {relevantVurdering.vilFaPvkIRetur && (
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
