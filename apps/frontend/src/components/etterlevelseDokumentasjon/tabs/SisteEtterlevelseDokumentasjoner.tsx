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
  const sorted = [...etterlevelseDokumentasjoner].sort((a, b) => {
    if (a.sistEndretEtterlevelseAvMeg === null && b.sistEndretEtterlevelseAvMeg) {
      return 1
    }
    if (b.sistEndretEtterlevelseAvMeg === null && a.sistEndretEtterlevelseAvMeg) {
      return -1
    }
    if (!a.sistEndretDokumentasjon && !b.sistEndretEtterlevelseAvMeg) {
      return (
        moment(b.changeStamp.createdDate).valueOf() - moment(a.changeStamp.createdDate).valueOf()
      )
    } else {
      return (
        moment(b.sistEndretEtterlevelseAvMeg).valueOf() -
        moment(a.sistEndretEtterlevelseAvMeg).valueOf()
      )
    }
  })

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
