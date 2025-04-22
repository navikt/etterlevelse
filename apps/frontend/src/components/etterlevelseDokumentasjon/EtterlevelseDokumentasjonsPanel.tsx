import { LinkPanel } from '@navikt/ds-react'
import moment from 'moment'
import { FunctionComponent } from 'react'
import { TEtterlevelseDokumentasjonQL } from '../../constants'
import { etterlevelseDokumentasjonIdUrl } from '../common/RouteLinkEtterlevelsesdokumentasjon'

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  onClick?: () => void
}

export const EtterlevelseDokumentasjonsPanel: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  onClick,
}) => {
  const hasDateForLastModifiedByUser =
    etterlevelseDokumentasjon.sistEndretEtterlevelseAvMeg !== null &&
    etterlevelseDokumentasjon.sistEndretEtterlevelseAvMeg !== ''
  const hasDateForLastModified =
    etterlevelseDokumentasjon.sistEndretEtterlevelse !== null &&
    etterlevelseDokumentasjon.sistEndretEtterlevelse !== ''

  const hasNoLastModifiedDate = !hasDateForLastModifiedByUser && !hasDateForLastModified

  return (
    <LinkPanel
      href={etterlevelseDokumentasjonIdUrl(etterlevelseDokumentasjon.id)}
      onClick={onClick}
    >
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
