'use client'

import {
  getEtterlevelseDokumentasjon,
  updateEtterlevelseDokumentasjon,
} from '@/api/etterlevelseDokumentasjon/etterlevelseDokumentasjonApi'
import { IEtterlevelseDokumentasjon } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { BodyLong, Button, Dialog, List, LocalAlert } from '@navikt/ds-react'
import { FunctionComponent, useState } from 'react'

type TProps = {
  etterlevelseDokumentasjon: IEtterlevelseDokumentasjon
  isGjenbrukModalOpen: boolean
  setIsGjenbrukModalOpen: (state: boolean) => void
}

export const TilretteleggForGjenbrukModal: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  isGjenbrukModalOpen,
  setIsGjenbrukModalOpen,
}) => {
  const [successMessageOpen, setSuccessMessageOpen] = useState<boolean>(false)

  const submit = async () => {
    await getEtterlevelseDokumentasjon(etterlevelseDokumentasjon.id).then(async (resp) => {
      const updatedEtterlevelseDok: IEtterlevelseDokumentasjon = {
        ...resp,
        forGjenbruk: true,
      } as IEtterlevelseDokumentasjon

      await updateEtterlevelseDokumentasjon(updatedEtterlevelseDok).then((response) => {
        console.debug(response)
        setSuccessMessageOpen(true)
      })
    })
  }

  return (
    <Dialog open={isGjenbrukModalOpen} onOpenChange={setIsGjenbrukModalOpen}>
      <Dialog.Popup id='dialog-popup-gjenbrukmodal' closeOnOutsideClick={false}>
        <Dialog.Header withClosebutton={false}>
          <Dialog.Title>Tilrettelegg for gjenbruk</Dialog.Title>
        </Dialog.Header>
        <Dialog.Body>
          <BodyLong className='mb-5'>
            Dere kan velge om andre, eller dere selv, får gjenbruke dette etterlevelsesdokumentet
            ved å ta en kopi. Tilrettelegging for gjenbruk gjør at dere kan:
          </BodyLong>
          <List as='ul' className='mb-5'>
            <List.Item>
              Skrive veiledning for de som skal gjenbruke dokumentet. Dere velger selv hvilke krav
              dere skriver veiledning til. Veiledning skriver dere på suksesskriteriumnivå.
            </List.Item>
            <List.Item>
              Skrive et utkast til svar som så kan fullføres av den som gjenbruker. Igjen gjøres
              dette pr. aktuelt suksesskriterium.
            </List.Item>
            <List.Item>
              Forhåndsvelge for gjenbrukere om et visst suksesskriterium skal være oppfylt eller ei,
              eventuelt forutsatt at de følger veiledningen deres.
            </List.Item>
            <List.Item>
              Velge om dere vil samle visse krav under “Prioritert kravliste” som så arves når noen
              gjenbruker dokumentet.
            </List.Item>
          </List>
          <BodyLong>
            Tilrettelegging for gjenbruk åpner for disse muligheter, men dokumentet vil ikke være
            tilgjengelig for gjenbruk før dere velger “Slå på gjenbruk”.
          </BodyLong>

          {successMessageOpen && (
            <LocalAlert status='success' className='mt-5'>
              <LocalAlert.Header>
                <LocalAlert.Title>Lagring vellyket</LocalAlert.Title>
              </LocalAlert.Header>
            </LocalAlert>
          )}
        </Dialog.Body>
        <Dialog.Footer>
          <Dialog.CloseTrigger>
            <Button
              type='button'
              onClick={() => {
                setSuccessMessageOpen(false)
                setIsGjenbrukModalOpen(false)
              }}
              variant={successMessageOpen ? 'primary' : 'secondary'}
            >
              {successMessageOpen ? 'Lukk' : 'Avbryt'}
            </Button>
          </Dialog.CloseTrigger>
          {!successMessageOpen && (
            <Button type='button' onClick={async () => submit()}>
              Tilrettelegg for gjenbruk
            </Button>
          )}
        </Dialog.Footer>
      </Dialog.Popup>
    </Dialog>
  )
}
export default TilretteleggForGjenbrukModal
