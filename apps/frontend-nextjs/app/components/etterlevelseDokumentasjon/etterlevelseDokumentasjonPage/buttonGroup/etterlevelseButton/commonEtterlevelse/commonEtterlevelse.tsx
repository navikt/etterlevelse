'use client'

import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import {
  etterlevelsesDokumentasjonRisikoeierGodkjenningUrl,
  etterlevelsesDokumentasjonSendTilGodkjenningUrl,
} from '@/routes/etterlevelseDokumentasjon/etterlevelseDokumentasjonRoutes'
import { ActionMenu } from '@navikt/ds-react'
import { FunctionComponent, useState } from 'react'
import { ExportEtterlevelseModal } from '../../../export/exportEtterlevelseModal'
import {
  ActionMenuButtonEtterlevelse,
  RedigerEgenskaperActionMenuItem,
} from './commonActionMenuComponents'

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
}

export const EtterlevelseReadOnlyActionMenuVariant: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
}) => {
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false)
  return (
    <>
      <ActionMenu>
        <ActionMenuButtonEtterlevelse />
        <ActionMenu.Content>
          <ActionMenu.Item as='button' onSelect={() => setIsExportModalOpen(true)}>
            Eksporter til Word
          </ActionMenu.Item>
        </ActionMenu.Content>
      </ActionMenu>
      <ExportEtterlevelseModal
        etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
        isExportModalOpen={isExportModalOpen}
        setIsExportModalOpen={setIsExportModalOpen}
      />
    </>
  )
}

export const RisikoeierOgEtterleverGodkjenningAvEtterlevelseActionMenuVariant: FunctionComponent<
  TProps
> = ({ etterlevelseDokumentasjon }) => {
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false)
  return (
    <>
      <ActionMenu>
        <ActionMenuButtonEtterlevelse />
        <ActionMenu.Content>
          <ActionMenu.Item
            as='a'
            href={etterlevelsesDokumentasjonSendTilGodkjenningUrl(etterlevelseDokumentasjon.id)}
          >
            Les innsending til risikoeier
          </ActionMenu.Item>
          <RedigerEgenskaperActionMenuItem
            etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
          />
          <ActionMenu.Item
            as='a'
            href={etterlevelsesDokumentasjonRisikoeierGodkjenningUrl(etterlevelseDokumentasjon.id)}
          >
            Godkjenn etterlevelsen
          </ActionMenu.Item>
          <ActionMenu.Item as='button' onSelect={() => setIsExportModalOpen(true)}>
            Eksporter til Word
          </ActionMenu.Item>
        </ActionMenu.Content>
      </ActionMenu>
      <ExportEtterlevelseModal
        etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
        isExportModalOpen={isExportModalOpen}
        setIsExportModalOpen={setIsExportModalOpen}
      />
    </>
  )
}
