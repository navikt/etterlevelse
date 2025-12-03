import { updatePvkDokument } from '@/api/pvkDokument/pvkDokumentApi'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { Button } from '@navikt/ds-react'
import { FunctionComponent } from 'react'

type TProps = {
  pvkDokument: IPvkDokument
}

export const TempAdminOverwrite: FunctionComponent<TProps> = ({ pvkDokument }) => {
  return (
    <Button
      type='button'
      onClick={async () => {
        const updatedPvk = pvkDokument
        const meldingTilPvo = { ...updatedPvk.meldingerTilPvo[0] }
        meldingTilPvo.innsendingId = 2

        updatedPvk.meldingerTilPvo.push(meldingTilPvo)

        await updatePvkDokument(updatedPvk)
      }}
    >
      add melding til pvo
    </Button>
  )
}

export default TempAdminOverwrite
