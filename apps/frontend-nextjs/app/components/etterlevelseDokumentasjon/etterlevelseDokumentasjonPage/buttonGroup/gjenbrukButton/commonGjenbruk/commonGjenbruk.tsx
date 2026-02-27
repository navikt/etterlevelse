'use client'

import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { etterlevelsesDokumentasjonEditUrl } from '@/routes/etterlevelseDokumentasjon/etterlevelseDokumentasjonRoutes'
import { ChevronDownIcon } from '@navikt/aksel-icons'
import { ActionMenu, Button } from '@navikt/ds-react'
import { FunctionComponent, useState } from 'react'
import TillatGjenbrukModal from '../../../gjenbruk/TillatGjenbrukModal'

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  setEtterlevelseDokumentasjon: (e: TEtterlevelseDokumentasjonQL) => void
  canManage: boolean
}

export const CommonVariantOneGjenbruk: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  setEtterlevelseDokumentasjon,
  canManage,
}) => {
  const [isTillatGjenbrukOpen, setIsTillatGjenbrukOpen] = useState(false)

  const tillatGjenbrukLabel =
    etterlevelseDokumentasjon.gjenbrukBeskrivelse &&
    etterlevelseDokumentasjon.tilgjengeligForGjenbruk
      ? 'Endre gjenbruk'
      : 'Slå på gjenbruk'

  return (
    <>
      <ActionMenu>
        <ActionMenu.Trigger>
          <Button
            variant='secondary-neutral'
            icon={<ChevronDownIcon aria-hidden />}
            iconPosition='right'
          >
            Gjenbruk
          </Button>
        </ActionMenu.Trigger>
        <ActionMenu.Content>
          <ActionMenu.Item
            as='a'
            href={etterlevelsesDokumentasjonEditUrl(etterlevelseDokumentasjon.id)}
            disabled={!canManage}
          >
            Tilrettelegg for gjenbruk
          </ActionMenu.Item>
          <ActionMenu.Item onSelect={() => setIsTillatGjenbrukOpen(true)} disabled={!canManage}>
            {tillatGjenbrukLabel}
          </ActionMenu.Item>
        </ActionMenu.Content>
      </ActionMenu>

      <TillatGjenbrukModal
        etterlevelseDokumentasjon={etterlevelseDokumentasjon}
        setEtterlevelseDokumentasjon={setEtterlevelseDokumentasjon}
        isOpen={isTillatGjenbrukOpen}
        setIsOpen={setIsTillatGjenbrukOpen}
        renderTrigger={false}
      />
    </>
  )
}
