'use client'

import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import {
  etterlevelsesDokumentasjonEditUrl,
  etterlevelsesDokumentasjonSendTilGodkjenningUrl,
} from '@/routes/etterlevelseDokumentasjon/etterlevelseDokumentasjonRoutes'
import { ChevronDownIcon } from '@navikt/aksel-icons'
import { ActionMenu, Button } from '@navikt/ds-react'
import { FunctionComponent, useState } from 'react'
import { ExportEtterlevelseModal } from '../../../export/exportEtterlevelseModal'

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
          <ActionMenu.Group label='Dokumenter'>
            <ActionMenu.Item
              as='a'
              href={etterlevelsesDokumentasjonSendTilGodkjenningUrl(etterlevelseDokumentasjon.id)}
            >
              Få etterlevelsen godkjent av risikoeier
            </ActionMenu.Item>
          </ActionMenu.Group>
          <ActionMenu.Group label='Administrer etterlevelsedokument'>
            <ActionMenu.Item
              as='a'
              href={etterlevelsesDokumentasjonEditUrl(etterlevelseDokumentasjon.id)}
            >
              Rediger dokumentegenskaper
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

export const EtterleverSendtTilGodkjenningVariant: FunctionComponent<TProps> = ({
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
          <ActionMenu.Group label='Dokumenter'>
            <ActionMenu.Item
              as='a'
              href={etterlevelsesDokumentasjonSendTilGodkjenningUrl(etterlevelseDokumentasjon.id)}
            >
              Les innsending til risikoeier
            </ActionMenu.Item>
          </ActionMenu.Group>
          <ActionMenu.Group label='Administrer etterlevelsedokument'>
            <ActionMenu.Item
              as='a'
              href={etterlevelsesDokumentasjonEditUrl(etterlevelseDokumentasjon.id)}
            >
              Rediger dokumentegenskaper
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

export const EtterleverGodkjentVariant: FunctionComponent<TProps> = ({
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
          <ActionMenu.Group label='Dokumenter'>
            <ActionMenu.Item
              as='a'
              href={etterlevelsesDokumentasjonEditUrl(etterlevelseDokumentasjon.id)}
            >
              Rediger dokumentegenskaper
            </ActionMenu.Item>
          </ActionMenu.Group>
          <ActionMenu.Group label='Administrer etterlevelsedokument'>
            <ActionMenu.Item as='a' href=''>
              Oppdater etterlevelsen
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
