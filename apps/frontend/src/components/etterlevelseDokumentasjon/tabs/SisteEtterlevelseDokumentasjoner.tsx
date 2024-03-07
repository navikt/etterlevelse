import { BodyShort, Loader } from '@navikt/ds-react'
import moment from 'moment'
import { TEtterlevelseDokumentasjonQL } from '../../../constants'
import { EtterlevelseDokumentasjonsPanels } from '../EtterlevelseDokumentasjonsPanels'

interface ISisteEtterlevelseDokumentasjoner {
  etterlevelseDokumentasjoner: TEtterlevelseDokumentasjonQL[]
  loading: boolean
}

export const SisteEtterlevelseDokumentasjoner = ({
  etterlevelseDokumentasjoner,
  loading,
}: ISisteEtterlevelseDokumentasjoner) => {
  const sorted = [...etterlevelseDokumentasjoner].sort(
    (a, b) =>
      moment(b.sistEndretEtterlevelse).valueOf() - moment(a.sistEndretEtterlevelse).valueOf()
  )
  return (
    <div className="my-5">
      {loading && <Loader size="large" />}
      {!etterlevelseDokumentasjoner.length && !loading && (
        <BodyShort>Du har ikke dokumentert etterlevelse på krav</BodyShort>
      )}
      {etterlevelseDokumentasjoner.length > 0 && !loading && (
        <EtterlevelseDokumentasjonsPanels etterlevelseDokumentasjoner={sorted} loading={loading} />
      )}
    </div>
  )
}
