'use client'

import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { ChevronDownIcon } from '@navikt/aksel-icons'
import { ActionMenu, Button } from '@navikt/ds-react'
import { FunctionComponent, PropsWithChildren, useState } from 'react'
import TillatGjenbrukModal from '../../../gjenbruk/TillatGjenbrukModal'
import TilretteleggForGjenbrukModal from '../../../gjenbruk/TilretteleggForGjenbrukModal'

interface IGjenbrukProps extends PropsWithChildren {
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

export const TilretteleggForGjenbrukActionMenu: FunctionComponent<TGjenbrukProps> = ({
  etterlevelseDokumentasjon,
  setEtterlevelseDokumentasjon,
  children,
}) => {
  const [isGjenbrukModalOpen, setIsGjenbrukModalOpen] = useState<boolean>(false)

  return (
    <>
      <ActionMenu>
        <GjenbrukKnapp />
        <ActionMenu.Content>
          <ActionMenu.Item
            onSelect={() => setIsGjenbrukModalOpen(true)}
            aria-haspopup='dialog'
            aria-controls={isGjenbrukModalOpen ? 'dialog-popup-gjenbrukmodal' : undefined}
          >
            {children}
          </ActionMenu.Item>
        </ActionMenu.Content>
      </ActionMenu>

      {isGjenbrukModalOpen && (
        <TilretteleggForGjenbrukModal
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
          setEtterlevelseDokumentasjon={setEtterlevelseDokumentasjon}
          isGjenbrukModalOpen={isGjenbrukModalOpen}
          setIsGjenbrukModalOpen={setIsGjenbrukModalOpen}
        />
      )}
    </>
  )
}

export const GjenbrukActionMenu: FunctionComponent<IGjenbrukProps> = ({
  etterlevelseDokumentasjon,
  setEtterlevelseDokumentasjon,
  children,
}) => {
  const [isTillatGjenbrukOpen, setIsTillatGjenbrukOpen] = useState(false)

  return (
    <>
      <ActionMenu>
        <GjenbrukKnapp />
        <ActionMenu.Content>
          <ActionMenu.Item onSelect={() => setIsTillatGjenbrukOpen(true)}>
            {children}
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
