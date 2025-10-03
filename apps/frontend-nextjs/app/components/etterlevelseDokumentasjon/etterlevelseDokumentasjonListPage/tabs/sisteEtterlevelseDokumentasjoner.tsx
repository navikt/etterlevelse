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
  const sorted = sortEtterlevelseDokumentasjonerByUsersLastModifiedDate([
    ...etterlevelseDokumentasjoner,
  ])

  return (
    <div className='my-5'>
      {loading && <Loader size='large' className='flex justify-self-center' />}
      {!etterlevelseDokumentasjoner.length && !loading && (
        <BodyShort>Du har ikke dokumentert etterlevelse på krav</BodyShort>
      )}
      {etterlevelseDokumentasjoner.length > 0 && !loading && (
        <EtterlevelseDokumentasjonsPanels etterlevelseDokumentasjoner={sorted} loading={loading} />
      )}
    </div>
  )
}
