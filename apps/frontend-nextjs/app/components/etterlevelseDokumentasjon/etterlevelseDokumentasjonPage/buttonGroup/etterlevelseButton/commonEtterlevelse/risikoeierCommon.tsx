'use client'

import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { etterlevelsesDokumentasjonRisikoeierGodkjenningUrl } from '@/routes/etterlevelseDokumentasjon/etterlevelseDokumentasjonRoutes'
import { ChevronDownIcon } from '@navikt/aksel-icons'
import { ActionMenu, Button } from '@navikt/ds-react'
import { FunctionComponent, useState } from 'react'
import { ExportEtterlevelseModal } from '../../../export/exportEtterlevelseModal'

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
        <ActionMenu.Trigger>
          <Button
            variant='secondary-neutral'
            icon={<ChevronDownIcon aria-hidden />}
            iconPosition='right'
          >
            Etterlevelse
          </Button>
        </ActionMenu.Trigger>
        <ActionMenu.Content>
          <ActionMenu.Group label='Administrer etterlevelsedokument'>
            <ActionMenu.Item
              as='a'
              href={etterlevelsesDokumentasjonRisikoeierGodkjenningUrl(
                etterlevelseDokumentasjon.id
              )}
            >
              Godkjenn etterlevelsen
            </ActionMenu.Item>
            <ActionMenu.Item as='button' onSelect={() => setIsExportModalOpen(true)}>
              Eksporter til Word
            </ActionMenu.Item>
          </ActionMenu.Group>
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
