import { ParagraphMedium, ParagraphSmall } from 'baseui/typography'
import moment from 'moment'
import { useState } from 'react'
import { tilbakemeldingslettMelding } from '../../../../api/TilbakemeldingApi'
import { Tilbakemelding, TilbakemeldingMelding } from '../../../../constants'
import { user } from '../../../../services/User'
import { PersonName } from '../../../common/PersonName'
import TilbakemeldingEdit from './TilbakemeldingEdit'
import { BodyShort, Button, Modal } from '@navikt/ds-react'
import { DocPencilIcon, TrashIcon } from '@navikt/aksel-icons'

export const MeldingKnapper = (props: {
  melding: TilbakemeldingMelding
  tilbakemeldingId: string
  oppdater: (t: Tilbakemelding) => void
  remove: (t: Tilbakemelding) => void
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
        <Button variant="tertiary" size="xsmall" icon={<DocPencilIcon aria-label="" aria-hidden />} onClick={() => setEditModal(true)}>
          Rediger
        </Button>
        <Button className="ml-2.5" variant="tertiary" size="xsmall" icon={<TrashIcon aria-label="" aria-hidden />} onClick={() => setDeleteModal(true)}>
          Slett
        </Button>
      </div>

      {deleteModal && (
        <Modal open onClose={() => setDeleteModal(false)}>
          <Modal.Header>Er du sikker på at du vil slette meldingen?</Modal.Header>
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
        <Modal open={editModal} onClose={() => setEditModal(false)} className="w-2/3">
          <Modal.Header>Rediger melding</Modal.Header>
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
