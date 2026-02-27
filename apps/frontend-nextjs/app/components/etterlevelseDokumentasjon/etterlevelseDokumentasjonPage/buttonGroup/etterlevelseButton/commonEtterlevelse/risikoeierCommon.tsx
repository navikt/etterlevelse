'use client'

import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { ActionMenu } from '@navikt/ds-react'
import { FunctionComponent, useState } from 'react'
import { ExportEtterlevelseModal } from '../../../export/exportEtterlevelseModal'
import {
  ActionMenuButtonEtterlevelse,
  GodkjennEtterlevelseActionMenuItem,
} from './commonActionMenuComponents'

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
}

export const RisikoeierGodkjenningAvEtterlevelseActionMenuVariant: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
}) => {
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false)

  return (
    <>
      <ActionMenu>
        <ActionMenuButtonEtterlevelse />
        <ActionMenu.Content>
          <GodkjennEtterlevelseActionMenuItem etterlevelseDokumentasjon={etterlevelseDokumentasjon}>
            Godkjenn etterlevelsen
          </GodkjennEtterlevelseActionMenuItem>
          <ActionMenu.Item as='button' onSelect={() => setIsExportModalOpen(true)}>
            Eksporter til Word
          </ActionMenu.Item>
        </ActionMenu.Content>
      </ActionMenu>
      <ExportEtterlevelseModal
        etterlevelseDokumentasjon={etterlevelseDokumentasjon}
        isExportModalOpen={isExportModalOpen}
        setIsExportModalOpen={setIsExportModalOpen}
      />
    </>
  )
}
