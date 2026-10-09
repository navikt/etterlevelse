'use client'

import { FileTextIcon } from '@navikt/aksel-icons'
import { LinkCard } from '@navikt/ds-react'
import moment from 'moment'
import { FunctionComponent } from 'react'
import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { etterlevelseDokumentasjonIdUrl } from '@/routes/etterlevelseDokumentasjon/etterlevelseDokumentasjonRoutes'

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
}

export const SistDokumentertCard: FunctionComponent<TProps> = ({ etterlevelseDokumentasjon }) => {
  const sistEndretAvMeg: string | undefined = etterlevelseDokumentasjon.sistEndretEtterlevelseAvMeg
  const sistEndret: string | undefined = etterlevelseDokumentasjon.sistEndretEtterlevelse
  const sistEndretDato: string | null =
    sistEndretAvMeg && sistEndretAvMeg !== ''
      ? sistEndretAvMeg
      : sistEndret && sistEndret !== ''
        ? sistEndret
        : null

  return (
    <LinkCard className='h-full w-full' arrowPosition='center'>
      <LinkCard.Icon>
        <FileTextIcon aria-hidden fontSize='1.5rem' />
      </LinkCard.Icon>
      <LinkCard.Title as='h3'>
        <LinkCard.Anchor href={etterlevelseDokumentasjonIdUrl(etterlevelseDokumentasjon.id)}>
          E{etterlevelseDokumentasjon.etterlevelseNummer}.
          {etterlevelseDokumentasjon.etterlevelseDokumentVersjon} {etterlevelseDokumentasjon.title}
        </LinkCard.Anchor>
      </LinkCard.Title>
      {sistEndretDato && (
        <LinkCard.Description>
          Sist endret: {moment(sistEndretDato).format('LL')}
        </LinkCard.Description>
      )}
    </LinkCard>
  )
}
