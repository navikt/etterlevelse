import { ParagraphSmall } from 'baseui/typography'
import moment from 'moment'
import { TEtterlevelseDokumentasjonQL } from '../../../constants'
import { EtterlevelseDokumentasjonerPanels } from '../../../pages/MyEtterlevelseDokumentasjonerPage'

export const SisteEtterlevelseDokumentasjoner = ({
  etterlevelseDokumentasjoner,
  loading,
}: {
  etterlevelseDokumentasjoner: TEtterlevelseDokumentasjonQL[]
  loading: boolean
}) => {
  if (!etterlevelseDokumentasjoner.length && !loading)
    return <ParagraphSmall>Du har ikke dokumentert etterlevelse på krav</ParagraphSmall>
  const sorted = [...etterlevelseDokumentasjoner].sort(
    (a, b) =>
      moment(b.sistEndretEtterlevelse).valueOf() - moment(a.sistEndretEtterlevelse).valueOf()
  )
  return (
    <EtterlevelseDokumentasjonerPanels etterlevelseDokumentasjoner={sorted} loading={loading} />
  )
}
