import { Heading, Label } from '@navikt/ds-react'
import { FunctionComponent } from 'react'
import { IPvoTilbakemelding } from '../../../../constants'
import DataTextWrapper from '../../../PvoTilbakemelding/common/DataTextWrapper'

type TProps = {
  pvoTilbakemelding: IPvoTilbakemelding
}

export const BeskjedFraPvoReadOnly: FunctionComponent<TProps> = ({ pvoTilbakemelding }) => {
  return (
    <div className='pt-9 mb-3 max-w-[75ch]'>
      <Heading level='2' size='small' className='mb-5'>
        Tilbakemelding til etterlever
      </Heading>
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
        <Label>Er det behov for forhåndskonsultasjon med Datatilsynet?</Label>
        <DataTextWrapper>
          {pvoTilbakemelding.behovForForhandskonsultasjon === null
            ? null
            : pvoTilbakemelding.behovForForhandskonsultasjon === true
              ? 'Ja'
              : 'Nei'}
        </DataTextWrapper>
      </div>

      <Label>Beskjed til etterlever</Label>
      <DataTextWrapper>
        {pvoTilbakemelding.merknadTilEtterleverEllerRisikoeier
          ? pvoTilbakemelding.merknadTilEtterleverEllerRisikoeier
          : 'Ingen beskjed'}
      </DataTextWrapper>
    </div>
  )
}
