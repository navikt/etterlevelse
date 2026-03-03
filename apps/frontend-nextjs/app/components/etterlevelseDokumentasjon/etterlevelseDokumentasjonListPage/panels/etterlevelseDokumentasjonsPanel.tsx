import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { etterlevelseDokumentasjonIdUrl } from '@/routes/etterlevelseDokumentasjon/etterlevelseDokumentasjonRoutes'
import { LinkPanel } from '@navikt/ds-react'
import moment from 'moment'
import { FunctionComponent } from 'react'

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

  return (
    <LinkPanel
      href={etterlevelseDokumentasjonIdUrl(etterlevelseDokumentasjon.id)}
      onClick={onClick}
    >
      <LinkPanel.Title className='text-xl'>
        E{etterlevelseDokumentasjon.etterlevelseNummer}.
        {etterlevelseDokumentasjon.etterlevelseDokumentVersjon} {etterlevelseDokumentasjon.title}
      </LinkPanel.Title>
      <LinkPanel.Description className='h-7'>
        {hasDateForLastModifiedByUser &&
          `Sist endret: ${moment(etterlevelseDokumentasjon.sistEndretEtterlevelseAvMeg).format('LL')}`}
        {hasDateForLastModified &&
          !hasDateForLastModifiedByUser &&
          `Sist endret: ${moment(etterlevelseDokumentasjon.sistEndretEtterlevelse).format('LL')}`}
      </LinkPanel.Description>
    </LinkPanel>
  )
}
