import {Modal, ModalBody, ModalHeader} from "baseui/modal";
import {Block} from "baseui/block";
import {Button} from "baseui/button";
import {EtterlevelseArkiv, EtterlevelseArkivStatus} from "../../constants";
import {createEtterlevelseArkiv, updateEtterlevelseArkiv} from "../../api/ArkiveringApi";
import React from "react";
import moment from "moment";

type ArkiveringModalProps = {
  arkivModal: boolean
  setArkivModal: React.Dispatch<React.SetStateAction<boolean>>
  behandlingsId: string
  etterlevelseArkiv?: EtterlevelseArkiv
  setEtterlevelseArkiv: (etterlevelseArkiv: (EtterlevelseArkiv | undefined)) => void
}

export const ArkiveringModal = ({arkivModal, setArkivModal, behandlingsId, etterlevelseArkiv, setEtterlevelseArkiv}: ArkiveringModalProps) => {

  const getStatustext = (etterlevelseArkivStatus: EtterlevelseArkivStatus) => {

    switch (etterlevelseArkivStatus) {
      case EtterlevelseArkivStatus.TIL_ARKIVERING:
        return `Arkivering bestilt: ${moment(etterlevelseArkiv?.tilArkiveringDato).format('lll')}`
      case EtterlevelseArkivStatus.ARKIVERT:
        return `Arkivert: ${moment(etterlevelseArkiv?.arkiveringDato).format('lll')}`
      case EtterlevelseArkivStatus.BEHANDLER_ARKIVERING:
        return 'Arkivering blir behandlet.'
      case EtterlevelseArkivStatus.ERROR:
        return 'Forrige arkivering mislykkes. Gi beskjed i #etterlevelse på slack'
      default:
        return ''
    }
  }

  return (
    <Modal
      isOpen={arkivModal}
      onClose={() => setArkivModal(false)}
    >
      <ModalHeader>Arkivering til Websak</ModalHeader>
      <ModalBody>
        <Block>
            {etterlevelseArkiv ? getStatustext(etterlevelseArkiv.status) : ""}
        </Block>
        <Block>
          <Button
            style={{marginTop: '12px'}}
            onClick={() => {
              const newEtterlevelseArkivering = {
                  behandlingId: behandlingsId,
                  status: etterlevelseArkiv && etterlevelseArkiv.status === EtterlevelseArkivStatus.TIL_ARKIVERING ? EtterlevelseArkivStatus.IKKE_ARKIVER : EtterlevelseArkivStatus.TIL_ARKIVERING,
                }

              ;(async () => {
                if (etterlevelseArkiv && etterlevelseArkiv.id) {
                  await updateEtterlevelseArkiv(
                    {...etterlevelseArkiv, status: etterlevelseArkiv && etterlevelseArkiv.status === EtterlevelseArkivStatus.TIL_ARKIVERING ? EtterlevelseArkivStatus.IKKE_ARKIVER : EtterlevelseArkivStatus.TIL_ARKIVERING}
                  ).then(setEtterlevelseArkiv)
                } else {
                  await createEtterlevelseArkiv(newEtterlevelseArkivering as EtterlevelseArkiv).then(setEtterlevelseArkiv)
                }
              })()
            }}
            size={'compact'}
            kind={'primary'}
            disabled={etterlevelseArkiv && etterlevelseArkiv.status === EtterlevelseArkivStatus.BEHANDLER_ARKIVERING}
          >
            {etterlevelseArkiv && etterlevelseArkiv.status === EtterlevelseArkivStatus.TIL_ARKIVERING ? 'Avbestille arkivering' : 'Bestill arkivering'}
          </Button>
        </Block>
      </ModalBody>
    </Modal>
  )
}
