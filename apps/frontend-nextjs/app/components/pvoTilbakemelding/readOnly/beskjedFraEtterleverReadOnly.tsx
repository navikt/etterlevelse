import DataTextWrapper from '@/components/common/DataTextWrapper/DataTextWrapper'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { Label } from '@navikt/ds-react'
import { FunctionComponent } from 'react'

type TBeskjedFraEtterleverReadOnlyProps = {
  pvkDokument: IPvkDokument
  innsendingId?: number
}

export const BeskjedFraEtterleverReadOnly: FunctionComponent<
  TBeskjedFraEtterleverReadOnlyProps
> = ({ pvkDokument, innsendingId }) => {
  const relevantMeldingTilPvo = pvkDokument.meldingerTilPvo.filter((melding) => {
    if (innsendingId) {
      return melding.innsendingId === innsendingId
    } else {
      return (
        melding.innsendingId === pvkDokument.antallInnsendingTilPvo &&
        melding.etterlevelseDokumentVersjon === pvkDokument.currentEtterlevelseDokumentVersjon
      )
    }
  })

  return (
    <>
      <div className='my-5 max-w-[75ch]'>
        <Label>Beskjed fra etterlever</Label>
        <DataTextWrapper customEmptyMessage='Ingen beskjed'>
          {relevantMeldingTilPvo[0].merknadTilPvo}
        </DataTextWrapper>
      </div>
    </>
  )
}
