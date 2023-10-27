import { BodyShort, Button, Heading, Modal } from '@navikt/ds-react'
import { Etterlevelse, Krav } from '../../constants'
import { ViewEtterlevelse } from './ViewEtterlevelse'
import { kravNumView } from '../../pages/KravPage'

export const EtterlevelseModal = ({
  isModalOpen,
  setIsModalOpen,
  etterlevelse,
  kravData,
}: {
  isModalOpen: boolean
  setIsModalOpen: (state: boolean) => void
  etterlevelse: Etterlevelse
  kravData: Krav
}) => {
  return (
    <Modal
      className="w-full max-w-4xl"
      onClose={() => setIsModalOpen(false)}
      open={isModalOpen}
    >
      <Modal.Header className="w-full">
        <BodyShort>
          {kravNumView(kravData)}
        </BodyShort>
        <Heading size="xlarge">{kravData.navn}</Heading>
      </Modal.Header>
      <Modal.Body>
        <ViewEtterlevelse etterlevelse={etterlevelse} viewMode krav={kravData} modalVersion />
        <div className="flex justify-end pb-8 pt-24">
          <Button
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
}

export default EtterlevelseModal
