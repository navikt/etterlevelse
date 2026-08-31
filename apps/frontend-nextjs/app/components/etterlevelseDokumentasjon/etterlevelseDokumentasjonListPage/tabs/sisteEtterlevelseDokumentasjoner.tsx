import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { sortEtterlevelseDokumentasjonerByUsersLastModifiedDate } from '@/util/etterlevelseDokumentasjon/etterlevelseDokumentasjonUtil'
import { PlusIcon } from '@navikt/aksel-icons'
import { BodyShort, Button, Label, Loader } from '@navikt/ds-react'
import { useMemo, useState } from 'react'
import { EtterlevelseDokumentasjonsPanels } from '../panels/etterlevelseDokumentasjonPanels'

const PAGE_SIZE = 20

interface ISisteEtterlevelseDokumentasjoner {
  etterlevelseDokumentasjoner: TEtterlevelseDokumentasjonQL[]
  loading: boolean
}

export const SisteEtterlevelseDokumentasjoner = ({
  etterlevelseDokumentasjoner,
  loading,
}: ISisteEtterlevelseDokumentasjoner) => {
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE)

  const mineDokumenterte = sortEtterlevelseDokumentasjonerByUsersLastModifiedDate([
    ...etterlevelseDokumentasjoner,
  ]).filter((etterlevelseDokumentasjon) => !!etterlevelseDokumentasjon.sistEndretEtterlevelseAvMeg)

  const visibleDokumenterte = useMemo<TEtterlevelseDokumentasjonQL[]>(
    () => mineDokumenterte.slice(0, visibleCount),
    [mineDokumenterte, visibleCount]
  )

  return (
    <div className='my-5'>
      {loading && <Loader size='large' className='flex justify-self-center' />}
      {!mineDokumenterte.length && !loading && <BodyShort>Ingen dokumentasjoner</BodyShort>}
      {mineDokumenterte.length > 0 && !loading && (
        <>
          <EtterlevelseDokumentasjonsPanels
            etterlevelseDokumentasjoner={visibleDokumenterte}
            loading={loading}
          />

          <div className='flex justify-between mt-10'>
            <Button
              onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
              icon={<PlusIcon title='' aria-label='' aria-hidden />}
              variant='secondary'
              disabled={visibleCount >= mineDokumenterte.length}
            >
              Vis flere
            </Button>
            <Label className='mr-2.5'>
              Viser {visibleDokumenterte.length}/{mineDokumenterte.length}
            </Label>
          </div>
        </>
      )}
    </div>
  )
}
