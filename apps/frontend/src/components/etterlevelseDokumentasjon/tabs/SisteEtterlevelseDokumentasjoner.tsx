import { Loader } from '@navikt/ds-react'

/* TODO USIKKER */
import { ParagraphSmall } from 'baseui/typography'
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
  const sorted: TEtterlevelseDokumentasjonQL[] = [...etterlevelseDokumentasjoner].sort(
    (a, b) =>
      moment(b.sistEndretEtterlevelse).valueOf() - moment(a.sistEndretEtterlevelse).valueOf()
  )
  return (
    <div className="my-5">
      {loading && <Loader size="large" />}
      {!etterlevelseDokumentasjoner.length && !loading && (
        <ParagraphSmall>Du har ikke dokumentert etterlevelse på krav</ParagraphSmall>
      )}
      {etterlevelseDokumentasjoner.length > 0 && !loading && (
        <EtterlevelseDokumentasjonsPanels etterlevelseDokumentasjoner={sorted} loading={loading} />
      )}
    </div>
  )
}
