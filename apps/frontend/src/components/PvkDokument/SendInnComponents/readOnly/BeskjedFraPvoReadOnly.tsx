import { Heading, Label } from '@navikt/ds-react'
import { FunctionComponent } from 'react'
import { IPvoTilbakemelding } from '../../../../constants'
import { ICode } from '../../../../services/Codelist'
import DataTextWrapper from '../../../PvoTilbakemelding/common/DataTextWrapper'

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
      <Heading level='2' size='small' className='mb-5'>
        Tilbakemelding til etterlever
      </Heading>

      <div className='mb-3'>
        <Label>Beskjed til etterlever</Label>
        <DataTextWrapper>
          {pvoTilbakemelding.merknadTilEtterleverEllerRisikoeier
            ? pvoTilbakemelding.merknadTilEtterleverEllerRisikoeier
            : 'Ingen beskjed'}
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
        <DataTextWrapper>{getPvoVurdering()}</DataTextWrapper>
      </div>

      <div className='mb-3'>
        <Label>PVO vil følge opp endringer dere gjør.</Label>
        <DataTextWrapper>
          {pvoTilbakemelding.pvoFolgeOppEndringer === true ? 'Ja' : 'Nei'}
        </DataTextWrapper>
      </div>

      <div className='mb-3'>
        <Label>PVO vil få PVK i retur etter at dere har gjennomgått tilbakemeldinger.</Label>
        <DataTextWrapper>
          {pvoTilbakemelding.vilFaPvkIRetur === true ? 'Ja' : 'Nei'}
        </DataTextWrapper>
      </div>
    </div>
  )
}
