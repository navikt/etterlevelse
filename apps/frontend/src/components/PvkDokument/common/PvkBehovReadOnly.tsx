import { Label, List } from '@navikt/ds-react'
import { FunctionComponent } from 'react'
import { IPvkDokument } from '../../../constants'
import { ICode } from '../../../services/Codelist'
import DataTextWrapper from '../../PvoTilbakemelding/common/DataTextWrapper'

type TProps = {
  pvkDokument: IPvkDokument
  ytterligereEgenskaper: ICode[]
}

export const PvkBehovReadOnly: FunctionComponent<TProps> = ({
  pvkDokument,
  ytterligereEgenskaper,
}) => (
  <>
    <div id='ytterlige-egenskaper'>
      <Label>Øvrige egenskaper for behandlingene:</Label>
      <DataTextWrapper>
        <List>
          {ytterligereEgenskaper.map((egenskap: ICode) => {
            const valgtEgenskap: boolean =
              pvkDokument.ytterligereEgenskaper.filter(
                (pvkEgenskap: ICode) => pvkEgenskap.code === egenskap.code
              ).length !== 0

            return (
              <List.Item key={egenskap.code}>
                <strong>Det gjelder {valgtEgenskap ? '' : 'ikke'} for</strong>{' '}
                {egenskap.shortName.toLowerCase()}
              </List.Item>
            )
          })}
        </List>
      </DataTextWrapper>
    </div>

    <div className='my-5'>
      <Label>Hvilken vurdering har dere kommet fram til?</Label>
      <DataTextWrapper>
        {pvkDokument.skalUtforePvk === undefined && 'Ingen vurdering'}
        {pvkDokument.skalUtforePvk === true && 'Vi skal gjennomføre en PVK'}
        {pvkDokument.skalUtforePvk === false && 'Vi skal ikke gjennomføre PVK'}
      </DataTextWrapper>
    </div>

    {pvkDokument.skalUtforePvk !== undefined && !pvkDokument.skalUtforePvk && (
      <div>
        <Label>Begrunnelse av vurderingen</Label>
        <DataTextWrapper>{pvkDokument.pvkVurderingsBegrunnelse}</DataTextWrapper>
      </div>
    )}
  </>
)

export default PvkBehovReadOnly
