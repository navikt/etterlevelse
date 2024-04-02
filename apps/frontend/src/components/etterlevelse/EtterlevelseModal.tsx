import { BodyShort, Button, Heading, Modal } from '@navikt/ds-react'
import { IEtterlevelse, IKrav } from '../../constants'
import { kravNumView } from '../../pages/KravPage'
import { ViewEtterlevelse } from './ViewEtterlevelse'

export const EtterlevelseModal = ({
  isModalOpen,
  setIsModalOpen,
  etterlevelse,
  kravData,
}: {
  isModalOpen: boolean
  setIsModalOpen: (state: boolean) => void
  etterlevelse: IEtterlevelse
  kravData: IKrav
}) => {
  return (
    <Modal
      className="w-full max-w-4xl"
      onClose={() => setIsModalOpen(false)}
      open={isModalOpen}
      aria-label="Etterlevelse Modal"
    >
      <Modal.Header className="w-full">
        <BodyShort>{kravNumView(kravData)}</BodyShort>
        <Heading size="medium" level="1">
          {kravData.navn}
        </Heading>
      </Modal.Header>
      <Modal.Body>
        <ViewEtterlevelse etterlevelse={etterlevelse} krav={kravData} modalVersion />
        <div className="flex justify-end pb-8 pt-24">
          <Button
            type="button"
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
