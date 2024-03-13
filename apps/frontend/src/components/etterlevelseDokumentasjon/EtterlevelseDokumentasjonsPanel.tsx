import { LinkPanel } from '@navikt/ds-react'
import moment from 'moment'
import { TEtterlevelseDokumentasjonQL } from '../../constants'

interface IEtterlevelseDokumentasjonsPanel {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  onClick?: () => void
}

export const EtterlevelseDokumentasjonsPanel = ({
  etterlevelseDokumentasjon,
  onClick,
}: IEtterlevelseDokumentasjonsPanel) => (
  <LinkPanel href={`/dokumentasjon/${etterlevelseDokumentasjon.id}`} onClick={onClick}>
    <LinkPanel.Title className="text-xl">
      E{etterlevelseDokumentasjon.etterlevelseNummer} {etterlevelseDokumentasjon.title}
    </LinkPanel.Title>
    <LinkPanel.Description>
      {etterlevelseDokumentasjon.sistEndretEtterlevelse !== null &&
      etterlevelseDokumentasjon.sistEndretEtterlevelse !== ''
        ? `Sist endret: ${moment(etterlevelseDokumentasjon.sistEndretEtterlevelse).format('ll')}`
        : 'Ikke på begynt'}
    </LinkPanel.Description>
  </LinkPanel>
)
