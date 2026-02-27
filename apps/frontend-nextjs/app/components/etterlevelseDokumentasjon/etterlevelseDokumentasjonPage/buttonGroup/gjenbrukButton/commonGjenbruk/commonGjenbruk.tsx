'use client'

import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { etterlevelsesDokumentasjonEditUrl } from '@/routes/etterlevelseDokumentasjon/etterlevelseDokumentasjonRoutes'
import { ChevronDownIcon } from '@navikt/aksel-icons'
import { ActionMenu, Button } from '@navikt/ds-react'
import { FunctionComponent, useState } from 'react'
import TillatGjenbrukModal from '../../../gjenbruk/TillatGjenbrukModal'

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  setEtterlevelseDokumentasjon: (state: TEtterlevelseDokumentasjonQL) => void
}

const GjenbrukKnapp = () => (
  <ActionMenu.Trigger>
    <Button variant='secondary-neutral' icon={<ChevronDownIcon aria-hidden />} iconPosition='right'>
      Gjenbruk
    </Button>
  </ActionMenu.Trigger>
)

export const TilretteleggForGjenbrukActionMenu: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  setEtterlevelseDokumentasjon,
}) => {
  const [isTillatGjenbrukOpen, setIsTillatGjenbrukOpen] = useState(false)

  return (
    <>
      <ActionMenu>
        <GjenbrukKnapp />
        <ActionMenu.Content>
          <ActionMenu.Item
            as='a'
            href={etterlevelsesDokumentasjonEditUrl(etterlevelseDokumentasjon.id)}
          >
            Tilrettelegg for gjenbruk
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

export const EndreGjenbrukActionMenu: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  setEtterlevelseDokumentasjon,
}) => {
  const [isTillatGjenbrukOpen, setIsTillatGjenbrukOpen] = useState(false)

  return (
    <>
      <ActionMenu>
        <GjenbrukKnapp />
        <ActionMenu.Content>
          <ActionMenu.Item onSelect={() => setIsTillatGjenbrukOpen(true)}>
            Endre gjenbruk
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

export const SlaPaGjenbrukActionMenu: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  setEtterlevelseDokumentasjon,
}) => {
  const [isTillatGjenbrukOpen, setIsTillatGjenbrukOpen] = useState(false)

  return (
    <>
      <ActionMenu>
        <GjenbrukKnapp />
        <ActionMenu.Content>
          <ActionMenu.Item onSelect={() => setIsTillatGjenbrukOpen(true)}>
            Slå på gjenbruk
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
