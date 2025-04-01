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
}: IEtterlevelseDokumentasjonsPanel) => {
  const hasDateForLastModifiedByUser =
    etterlevelseDokumentasjon.sistEndretEtterlevelseAvMeg !== null &&
    etterlevelseDokumentasjon.sistEndretEtterlevelseAvMeg !== ''
  const hasDateForLastModified =
    etterlevelseDokumentasjon.sistEndretEtterlevelse !== null &&
    etterlevelseDokumentasjon.sistEndretEtterlevelse !== ''

  const hasNoLastModifiedDate = !hasDateForLastModifiedByUser && !hasDateForLastModified

  return (
    <LinkPanel href={`/dokumentasjon/${etterlevelseDokumentasjon.id}`} onClick={onClick}>
      <LinkPanel.Title className='text-xl'>
        E{etterlevelseDokumentasjon.etterlevelseNummer} {etterlevelseDokumentasjon.title}
      </LinkPanel.Title>
      <LinkPanel.Description>
        {hasDateForLastModifiedByUser &&
          `Sist endret: ${moment(etterlevelseDokumentasjon.sistEndretEtterlevelseAvMeg).format('ll')}`}
        {hasDateForLastModified &&
          !hasDateForLastModifiedByUser &&
          `Sist endret: ${moment(etterlevelseDokumentasjon.sistEndretEtterlevelse).format('ll')}`}
        {hasNoLastModifiedDate && 'Ikke påbegynt'}
      </LinkPanel.Description>
    </LinkPanel>
  )
}
