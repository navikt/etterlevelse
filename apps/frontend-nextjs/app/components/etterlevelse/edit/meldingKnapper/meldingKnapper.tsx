import { tilbakemeldingSlettMelding } from '@/api/krav/tilbakemelding/tilbakemeldingApi'
import PersonNavn from '@/components/common/personNavn/personNavn'
import {
  ITilbakemelding,
  ITilbakemeldingMelding,
} from '@/constants/krav/tilbakemelding/tilbakemeldingConstants'
import { user } from '@/services/user/userService'
import { DocPencilIcon, TrashIcon } from '@navikt/aksel-icons'
import { BodyShort, Button, Modal } from '@navikt/ds-react'
import moment from 'moment'
import { FunctionComponent, useState } from 'react'
import { TilbakemeldingEdit } from '../../tilbakemeldingEdit/tilbakemeldingEdit'

type TProps = {
  melding: ITilbakemeldingMelding
  tilbakemeldingId: string
  oppdater: (t: ITilbakemelding) => void
  remove: (t: ITilbakemelding) => void
  marginLeft?: boolean
}

export const MeldingKnapper: FunctionComponent<TProps> = (props) => {
  const { melding, tilbakemeldingId, oppdater, remove } = props
  const meldingNr = melding.meldingNr
  const [deleteModal, setDeleteModal] = useState(false)
  const [editModal, setEditModal] = useState(false)
  if ((!user.isAdmin() && melding.fraIdent !== user.getIdent()) || !user.canWrite()) return null

  return (
    <div>
      <div className={`${props.marginLeft ? 'ml-10' : undefined} w-1/2 flex`}>
        <Button
          variant='tertiary'
          size='xsmall'
          icon={<DocPencilIcon aria-label='' aria-hidden />}
          onClick={() => setEditModal(true)}
        >
          Redigér
        </Button>
        <Button
          className='ml-2.5'
          variant='tertiary'
          size='xsmall'
          icon={<TrashIcon aria-label='' aria-hidden />}
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
            <BodyShort className='flex'>
              {moment(melding.tid).format('LL')}{' '}
              <div className='ml-1'>
                <PersonNavn ident={melding.fraIdent} />
              </div>
            </BodyShort>
            <BodyShort>{melding.innhold}</BodyShort>
          </Modal.Body>
          <Modal.Footer>
            <Button variant='secondary' onClick={() => setDeleteModal(false)}>
              Avbryt
            </Button>
            <Button
              className='ml-2.5'
              onClick={() =>
                tilbakemeldingSlettMelding({ tilbakemeldingId, meldingNr }).then(
                  (tilbakemelding: ITilbakemelding) => {
                    if (meldingNr === 1) {
                      remove({ ...tilbakemelding, meldinger: [] })
                    } else {
                      remove(tilbakemelding)
                    }
                    setDeleteModal(false)
                  }
                )
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
          className='w-2/3'
          header={{ heading: 'Redigér melding', closeButton: false }}
        >
          <Modal.Body>
            <BodyShort className='flex'>
              {moment(melding.tid).format('LL')}{' '}
              <div className='ml-1'>
                <PersonNavn ident={melding.fraIdent} />
              </div>
            </BodyShort>
            <TilbakemeldingEdit
              tilbakemeldingId={tilbakemeldingId}
              melding={melding}
              close={(tilbakemelding: ITilbakemelding) => {
                setEditModal(false)
                oppdater(tilbakemelding)
              }}
              setEditModal={setEditModal}
            />
          </Modal.Body>
        </Modal>
      )}
    </div>
  )
}
