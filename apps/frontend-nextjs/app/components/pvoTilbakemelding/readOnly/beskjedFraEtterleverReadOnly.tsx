import DataTextWrapper from '@/components/common/DataTextWrapper/DataTextWrapper'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { Label } from '@navikt/ds-react'
import { FunctionComponent } from 'react'

type TBeskjedFraEtterleverReadOnlyProps = {
  pvkDokument: IPvkDokument
  innsendingId?: number
  etterlevelseDokumentVersjon?: number
}

export const BeskjedFraEtterleverReadOnly: FunctionComponent<
  TBeskjedFraEtterleverReadOnlyProps
> = ({ pvkDokument, innsendingId, etterlevelseDokumentVersjon }) => {
  const relevantMeldingTilPvo = pvkDokument.meldingerTilPvo.filter((melding) => {
    const innsendingIdToMatch = innsendingId ?? pvkDokument.antallInnsendingTilPvo
    if (etterlevelseDokumentVersjon !== undefined) {
      return (
        melding.innsendingId === innsendingIdToMatch &&
        melding.etterlevelseDokumentVersjon === etterlevelseDokumentVersjon
      )
    }
    return melding.innsendingId === innsendingIdToMatch
  })

  const fallbackMeldingTilPvo = pvkDokument.meldingerTilPvo.filter((melding) => {
    const innsendingIdToMatch = innsendingId ?? pvkDokument.antallInnsendingTilPvo
    return melding.innsendingId === innsendingIdToMatch
  })

  return (
    <>
      <div className='my-5 max-w-[75ch]'>
        <Label>Beskjed fra etterlever</Label>
        <DataTextWrapper customEmptyMessage='Ingen beskjed'>
          {(relevantMeldingTilPvo[0] ?? fallbackMeldingTilPvo[0])?.merknadTilPvo}
        </DataTextWrapper>
      </div>
    </>
  )
}
