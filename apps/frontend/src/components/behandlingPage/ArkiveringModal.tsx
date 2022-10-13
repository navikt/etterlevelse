import {Modal, ModalBody, ModalHeader} from "baseui/modal";
import {Block} from "baseui/block";
import {Button} from "baseui/button";
import {EtterlevelseArkiv, EtterlevelseArkivStatus} from "../../constants";
import {createEtterlevelseArkiv, updateEtterlevelseArkiv, updateToArkivert} from "../../api/ArkiveringApi";
import React from "react";
import {ParagraphMedium} from "baseui/typography";

type ArkiveringModalProps = {
  arkivModal: boolean
  setArkivModal: React.Dispatch<React.SetStateAction<boolean>>
  behandlingsId: string
  etterlevelseArkiv?: EtterlevelseArkiv
  setEtterlevelseArkiv: (etterlevelseArkiv: (EtterlevelseArkiv | undefined)) => void
}

export const ArkiveringModal = ({arkivModal, setArkivModal, behandlingsId, etterlevelseArkiv, setEtterlevelseArkiv}: ArkiveringModalProps) => {
  return (
    <Modal
      isOpen={arkivModal}
      onClose={() => setArkivModal(false)}
    >
      <ModalHeader>Arkivering til Websak</ModalHeader>
      <ModalBody>
        <Block>
          <ParagraphMedium>Websakarkivering skjer to ganger hver dag (kl1200 og kl0000)</ParagraphMedium>
        </Block>
        <Block>
          <Button
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
          <Button
            onClick={() => {
              ;(async () => {
                await updateToArkivert(['2022-10-13_10-33-54_Etterlevelse_B104']).then(console.log)
              })()
            }}
            size={'compact'}
            kind={'secondary'}
          >
            Bytt status til arkivert (Testing)
          </Button>
        </Block>
      </ModalBody>
    </Modal>
  )
}
