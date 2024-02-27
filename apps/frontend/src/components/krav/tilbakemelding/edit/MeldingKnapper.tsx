import { DocPencilIcon, TrashIcon } from '@navikt/aksel-icons'
import { BodyShort, Button, Modal } from '@navikt/ds-react'
import moment from 'moment'
import { useState } from 'react'
import { tilbakemeldingslettMelding } from '../../../../api/TilbakemeldingApi'
import { ITilbakemelding, ITilbakemeldingMelding } from '../../../../constants'
import { user } from '../../../../services/User'
import { PersonName } from '../../../common/PersonName'
import TilbakemeldingEdit from './TilbakemeldingEdit'

export const MeldingKnapper = (props: {
  melding: ITilbakemeldingMelding
  tilbakemeldingId: string
  oppdater: (t: ITilbakemelding) => void
  remove: (t: ITilbakemelding) => void
  marginLeft?: boolean
}) => {
  const { melding, tilbakemeldingId, oppdater, remove } = props
  const meldingNr = melding.meldingNr
  const [deleteModal, setDeleteModal] = useState(false)
  const [editModal, setEditModal] = useState(false)
  if ((!user.isAdmin() && melding.fraIdent !== user.getIdent()) || !user.canWrite()) return null

  return (
    <div>
      <div className={`${props.marginLeft ? 'ml-10' : undefined} w-1/2 flex`}>
        <Button
          variant="tertiary"
          size="xsmall"
          icon={<DocPencilIcon aria-label="" aria-hidden />}
          onClick={() => setEditModal(true)}
        >
          Rediger
        </Button>
        <Button
          className="ml-2.5"
          variant="tertiary"
          size="xsmall"
          icon={<TrashIcon aria-label="" aria-hidden />}
          onClick={() => setDeleteModal(true)}
        >
          Slett
        </Button>
      </div>

      {deleteModal && (
        <Modal
          open
          onClose={() => setDeleteModal(false)}
          header={{ heading: 'Er du sikker på at du vil slette meldingen?', closeButton: false }}
        >
          <Modal.Body>
            {meldingNr === 1 && <BodyShort>Hele meldingstråden vil bli slettet.</BodyShort>}
            <BodyShort className="flex">
              {moment(melding.tid).format('ll')}{' '}
              <div className="ml-1">
                <PersonName ident={melding.fraIdent} />
              </div>
            </BodyShort>
            <BodyShort>{melding.innhold}</BodyShort>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setDeleteModal(false)}>
              Avbryt
            </Button>
            <Button
              className="ml-2.5"
              onClick={() =>
                tilbakemeldingslettMelding({ tilbakemeldingId, meldingNr }).then((t) => {
                  if (meldingNr === 1) {
                    remove({ ...t, meldinger: [] })
                  } else {
                    remove(t)
                  }
                  setDeleteModal(false)
                })
              }
            >
              Slett
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {editModal && (
        <Modal
          open={editModal}
          onClose={() => setEditModal(false)}
          className="w-2/3"
          header={{ heading: 'Rediger melding', closeButton: false }}
        >
          <Modal.Body>
            <BodyShort className="flex">
              {moment(melding.tid).format('ll')}{' '}
              <div className="ml-1">
                <PersonName ident={melding.fraIdent} />
              </div>
            </BodyShort>
            <TilbakemeldingEdit
              tilbakemeldingId={tilbakemeldingId}
              melding={melding}
              close={(t) => {
                setEditModal(false)
                oppdater(t)
              }}
              setEditModal={setEditModal}
            />
          </Modal.Body>
        </Modal>
      )}
    </div>
  )
}
export default MeldingKnapper
