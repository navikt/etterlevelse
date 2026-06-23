import DataTextWrapper from '@/components/common/DataTextWrapper/DataTextWrapper'
import { IEtterlevelseDokumentasjon } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import {
  EPvkVurdering,
  IPvkDokument,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { ICode } from '@/constants/kodeverk/kodeverkConstants'
import { harKunDpBehandlinger } from '@/util/etterlevelseDokumentasjon/pvkDokument/pvkDokumentUtils'
import { Label, List } from '@navikt/ds-react'
import { FunctionComponent } from 'react'

type TProps = {
  pvkDokument: IPvkDokument
  etterlevelseDokumentasjon: IEtterlevelseDokumentasjon
  ytterligereEgenskaper: ICode[]
}

export const PvkBehovReadOnly: FunctionComponent<TProps> = ({
  pvkDokument,
  etterlevelseDokumentasjon,
  ytterligereEgenskaper,
}) => (
  <>
    <div id='ytterligere-egenskaper'>
      <Label>Øvrige egenskaper for behandlingene:</Label>
      <DataTextWrapper>
        <List>
          {harKunDpBehandlinger(etterlevelseDokumentasjon) && (
            <>
              <List.Item>
                <strong>
                  Profilering benyttes {pvkDokument.dpProcessProfilering ? '' : 'ikke'}
                </strong>
              </List.Item>
              <List.Item>
                <strong>
                  Behandlingen er{pvkDokument.dpProcessHelautomatiskBehandling ? '' : ' ikke'}
                </strong>{' '}
                helautomatisk
              </List.Item>
            </>
          )}
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
        {(pvkDokument.pvkVurdering === undefined ||
          pvkDokument.pvkVurdering === EPvkVurdering.UNDEFINED) &&
          'Ingen vurdering'}
        {pvkDokument.pvkVurdering === EPvkVurdering.SKAL_UTFORE && 'Vi skal gjennomføre en PVK'}
        {pvkDokument.pvkVurdering === EPvkVurdering.SKAL_IKKE_UTFORE &&
          'Vi skal ikke gjennomføre PVK'}
      </DataTextWrapper>
    </div>

    {(pvkDokument.pvkVurdering === undefined ||
      pvkDokument.pvkVurdering === EPvkVurdering.UNDEFINED ||
      pvkDokument.pvkVurdering !== EPvkVurdering.SKAL_UTFORE) && (
      <div>
        <Label>Begrunnelse av vurderingen</Label>
        <DataTextWrapper>{pvkDokument.pvkVurderingsBegrunnelse}</DataTextWrapper>
      </div>
    )}
  </>
)

export default PvkBehovReadOnly
