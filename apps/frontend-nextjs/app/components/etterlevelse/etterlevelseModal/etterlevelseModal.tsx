import { IEtterlevelse } from '@/constants/etterlevelseDokumentasjon/etterlevelse/etterlevelseConstants'
import { IKrav } from '@/constants/krav/kravConstants'
import { kravNummerView } from '@/util/krav/kravUtil'
import { BodyShort, Button, Heading, Modal } from '@navikt/ds-react'
import { FunctionComponent } from 'react'
import { ViewEtterlevelse } from '../etterlevelseView/etterlevelseView'

type TProps = {
  isModalOpen: boolean
  setIsModalOpen: (state: boolean) => void
  etterlevelse: IEtterlevelse
  kravData: IKrav
}

export const EtterlevelseModal: FunctionComponent<TProps> = ({
  isModalOpen,
  setIsModalOpen,
  etterlevelse,
  kravData,
}) => (
  <Modal
    className='w-full max-w-4xl'
    onClose={() => setIsModalOpen(false)}
    open={isModalOpen}
    aria-label='Etterlevelse Modal'
  >
    <Modal.Header className='w-full'>
      <BodyShort>{kravNummerView(kravData.kravVersjon, kravData.kravNummer)}</BodyShort>
      <Heading size='medium' level='1'>
        {kravData.navn}
      </Heading>
    </Modal.Header>
    <Modal.Body>
      <ViewEtterlevelse etterlevelse={etterlevelse} krav={kravData} modalVersion />
      <div className='flex justify-end pb-8 pt-24'>
        <Button
          type='button'
          onClick={() => {
            setIsModalOpen(false)
          }}
        >
          Lukk visning
        </Button>
      </div>
    </Modal.Body>
  </Modal>
)

export default EtterlevelseModal
