'use client'

import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { ActionMenu } from '@navikt/ds-react'
import { FunctionComponent, useState } from 'react'
import { ExportEtterlevelseModal } from '../../../export/exportEtterlevelseModal'
import {
  ActionMenuButtonEtterlevelse,
  EtterlevelseTilGodkjenningActionMenuItem,
  RedigerEgenskaperActionMenuItem,
} from './commonActionMenuComponents'

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
}

export const EtterleverUnderArbeidVariant: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
}) => {
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false)

  return (
    <>
      <ActionMenu>
        <ActionMenuButtonEtterlevelse />
        <ActionMenu.Content>
          <EtterlevelseTilGodkjenningActionMenuItem
            etterlevelseDokumentasjon={etterlevelseDokumentasjon}
          >
            Få etterlevelsen godkjent av risikoeier
          </EtterlevelseTilGodkjenningActionMenuItem>
          <RedigerEgenskaperActionMenuItem etterlevelseDokumentasjon={etterlevelseDokumentasjon}>
            Rediger dokumentegenskaper
          </RedigerEgenskaperActionMenuItem>
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

export const EtterleverSendtTilGodkjenningVariant: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
}) => {
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false)

  return (
    <>
      <ActionMenu>
        <ActionMenuButtonEtterlevelse />
        <ActionMenu.Content>
          <EtterlevelseTilGodkjenningActionMenuItem
            etterlevelseDokumentasjon={etterlevelseDokumentasjon}
          >
            Les innsending til risikoeier
          </EtterlevelseTilGodkjenningActionMenuItem>
          <RedigerEgenskaperActionMenuItem etterlevelseDokumentasjon={etterlevelseDokumentasjon}>
            Rediger dokumentegenskaper
          </RedigerEgenskaperActionMenuItem>
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

export const EtterleverGodkjentVariant: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
}) => {
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false)
  return (
    <>
      <ActionMenu>
        <ActionMenuButtonEtterlevelse />
        <ActionMenu.Content>
          <RedigerEgenskaperActionMenuItem etterlevelseDokumentasjon={etterlevelseDokumentasjon}>
            Rediger dokumentegenskaper
          </RedigerEgenskaperActionMenuItem>

          <ActionMenu.Item as='a' href='????'>
            Oppdater etterlevelsen
          </ActionMenu.Item>
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
