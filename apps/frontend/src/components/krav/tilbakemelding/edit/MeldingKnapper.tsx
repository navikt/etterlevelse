import { faPencilAlt, faTrashAlt } from '@fortawesome/free-solid-svg-icons'
import { Block } from 'baseui/block'
import Button from '../../../common/Button'
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'baseui/modal'
import { ParagraphMedium, ParagraphSmall } from 'baseui/typography'
import moment from 'moment'
import { useState } from 'react'
import { tilbakemeldingslettMelding } from '../../../../api/TilbakemeldingApi'
import { Tilbakemelding, TilbakemeldingMelding } from '../../../../constants'
import { user } from '../../../../services/User'
import { pageWidth } from '../../../../util/theme'
import { PersonName } from '../../../common/PersonName'
import TilbakemeldingEdit from './TilbakemeldingEdit'

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
    <>
      <Block marginLeft={props.marginLeft ? '42px' : undefined} width="50%">
        <Button kind={'underline-hover'} size={'mini'} icon={faPencilAlt} onClick={() => setEditModal(true)}>
          Rediger
        </Button>
        <Button kind={'underline-hover'} size={'mini'} icon={faTrashAlt} marginLeft onClick={() => setDeleteModal(true)}>
          Slett
        </Button>
      </Block>

      {deleteModal && (
        <Modal closeable={false} isOpen onClose={() => setDeleteModal(false)}>
          <ModalHeader>Er du sikker på at du vil slette meldingen?</ModalHeader>
          <ModalBody>
            {meldingNr === 1 && <ParagraphMedium>Hele meldingstråden vil bli slettet.</ParagraphMedium>}
            <ParagraphSmall>
              {moment(melding.tid).format('ll')} <PersonName ident={melding.fraIdent} />
            </ParagraphSmall>
            <ParagraphMedium>{melding.innhold}</ParagraphMedium>
          </ModalBody>
          <ModalFooter>
            <Button kind={'secondary'} size={'compact'} onClick={() => setDeleteModal(false)}>
              Avbryt
            </Button>
            <Button
              kind={'primary'}
              size={'compact'}
              marginLeft
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
          </ModalFooter>
        </Modal>
      )}

      {editModal && (
        <Modal
          isOpen
          onClose={() => setEditModal(false)}
          overrides={{
            Dialog: {
              style: {
                width: '60%',
                maxWidth: pageWidth,
              },
            },
          }}
        >
          <ModalHeader>Rediger melding</ModalHeader>
          <ModalBody>
            <ParagraphSmall>
              {moment(melding.tid).format('ll')} <PersonName ident={melding.fraIdent} />
            </ParagraphSmall>
            <TilbakemeldingEdit
              tilbakemeldingId={tilbakemeldingId}
              melding={melding}
              close={(t) => {
                setEditModal(false)
                oppdater(t)
              }}
            />
          </ModalBody>
        </Modal>
      )}
    </>
  )
}
export default MeldingKnapper
