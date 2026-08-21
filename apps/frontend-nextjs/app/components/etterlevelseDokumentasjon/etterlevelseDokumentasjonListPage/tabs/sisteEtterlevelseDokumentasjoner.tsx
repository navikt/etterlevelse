import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { sortEtterlevelseDokumentasjonerByUsersLastModifiedDate } from '@/util/etterlevelseDokumentasjon/etterlevelseDokumentasjonUtil'
import { BodyShort, Loader } from '@navikt/ds-react'
import { EtterlevelseDokumentasjonsPanels } from '../panels/etterlevelseDokumentasjonPanels'

interface ISisteEtterlevelseDokumentasjoner {
  etterlevelseDokumentasjoner: TEtterlevelseDokumentasjonQL[]
  loading: boolean
}

export const SisteEtterlevelseDokumentasjoner = ({
  etterlevelseDokumentasjoner,
  loading,
}: ISisteEtterlevelseDokumentasjoner) => {
  const mineDokumenterte = sortEtterlevelseDokumentasjonerByUsersLastModifiedDate([
    ...etterlevelseDokumentasjoner,
  ]).filter((etterlevelseDokumentasjon) => !!etterlevelseDokumentasjon.sistEndretEtterlevelseAvMeg)

  return (
    <div className='my-5'>
      {loading && <Loader size='large' className='flex justify-self-center' />}
      {!mineDokumenterte.length && !loading && <BodyShort>Ingen dokumentasjoner</BodyShort>}
      {mineDokumenterte.length > 0 && !loading && (
        <EtterlevelseDokumentasjonsPanels
          etterlevelseDokumentasjoner={mineDokumenterte}
          loading={loading}
        />
      )}
    </div>
  )
}
