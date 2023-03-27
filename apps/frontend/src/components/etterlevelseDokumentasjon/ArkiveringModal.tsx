import { ModalBody, ModalHeader } from 'baseui/modal'
import { Block } from 'baseui/block'
import { EtterlevelseArkiv, EtterlevelseArkivStatus } from '../../constants'
import { createEtterlevelseArkiv, updateEtterlevelseArkiv } from '../../api/ArkiveringApi'
import React, { useState } from 'react'
import moment from 'moment'
import CustomizedModal from '../common/CustomizedModal'
import { borderRadius } from '../common/Style'
import Button from '../common/Button'

type ArkiveringModalProps = {
  arkivModal: boolean
  setArkivModal: React.Dispatch<React.SetStateAction<boolean>>
  etterlevelseDokumentasjonId: string
  etterlevelseArkiv?: EtterlevelseArkiv
  setEtterlevelseArkiv: (etterlevelseArkiv: EtterlevelseArkiv | undefined) => void
}

export const ArkiveringModal = ({ arkivModal, setArkivModal, etterlevelseDokumentasjonId, etterlevelseArkiv, setEtterlevelseArkiv }: ArkiveringModalProps) => {
  const [isArchivingCancelled, setIsArchivingCancelled] = useState<boolean>(false)

  const getStatustext = (etterlevelseArkivStatus: EtterlevelseArkivStatus) => {
    switch (etterlevelseArkivStatus) {
      case EtterlevelseArkivStatus.TIL_ARKIVERING:
        return (
          <>
            <Block>Bestilt: {moment(etterlevelseArkiv?.tilArkiveringDato).format('lll')}</Block>
            <Block>Arkivert av: {etterlevelseArkiv?.changeStamp.lastModifiedBy.split('-')[1]}</Block>
          </>
        )
      case EtterlevelseArkivStatus.ARKIVERT:
        return (
          <>
            <Block>Sist arkivert: {moment(etterlevelseArkiv?.arkiveringDato).format('lll')}</Block>

            <Block>Arkivert av: {etterlevelseArkiv?.changeStamp.lastModifiedBy.split('-')[1]}</Block>
          </>
        )
      case EtterlevelseArkivStatus.BEHANDLER_ARKIVERING:
        return 'Arkivering er under behandling.'
      case EtterlevelseArkivStatus.ERROR:
        return 'Det oppstod en feil ved forrige arkivering, vi er på saken. Ta kontakt i #etterlevelse på Slack hvis du lurer på noe.'
      default:
        return ''
    }
  }

  return (
    <CustomizedModal
      isOpen={arkivModal}
      onClose={() => {
        setIsArchivingCancelled(false)
        setArkivModal(false)
      }}
      size="default"
      overrides={{
        Dialog: {
          style: {
            width: '375px',
            boxShadow: '0 2px 4px -1px rgba(0, 0, 0, .2), 0 4px 5px 0 rgba(0, 0, 0, .14), 0 1px 3px 0 rgba(0, 0, 0, .12)',
            ...borderRadius('4px'),
          },
        },
      }}
    >
      <ModalHeader>{etterlevelseArkiv && etterlevelseArkiv.status === EtterlevelseArkivStatus.TIL_ARKIVERING ? 'Arkivering bestilt' : 'Arkiver i Websak'}</ModalHeader>
      <ModalBody>
        {etterlevelseArkiv && etterlevelseArkiv.status === EtterlevelseArkivStatus.IKKE_ARKIVER && (
          <Block marginBottom={'16px'}>Arkivering av etterlevelsesdokumentasjon i Websak gir sporbarhet og dokumenterer grunnlaget for risikovurderinger og rapportering.</Block>
        )}
        <Block>{etterlevelseArkiv ? getStatustext(etterlevelseArkiv.status) : ''}</Block>
        {isArchivingCancelled && etterlevelseArkiv?.arkiveringAvbruttDato && <Block>Avbrutt dato: {moment(etterlevelseArkiv?.arkiveringAvbruttDato).format('lll')}</Block>}
        <Block marginTop="16px" display="flex" $style={{ justifyContent: 'flex-end', paddingTop: '16px' }}>
          {etterlevelseArkiv && etterlevelseArkiv.status !== EtterlevelseArkivStatus.BEHANDLER_ARKIVERING && etterlevelseArkiv.status !== EtterlevelseArkivStatus.ERROR && (
            <Button
              onClick={() => {
                const newEtterlevelseArkivering = {
                  etterlevelseDokumentasjonId: etterlevelseDokumentasjonId,
                  status:
                    etterlevelseArkiv && etterlevelseArkiv.status === EtterlevelseArkivStatus.TIL_ARKIVERING
                      ? EtterlevelseArkivStatus.IKKE_ARKIVER
                      : EtterlevelseArkivStatus.TIL_ARKIVERING,
                }

                ;(async () => {
                  if (etterlevelseArkiv && etterlevelseArkiv.id) {
                    await updateEtterlevelseArkiv({
                      ...etterlevelseArkiv,
                      status:
                        etterlevelseArkiv && etterlevelseArkiv.status === EtterlevelseArkivStatus.TIL_ARKIVERING
                          ? EtterlevelseArkivStatus.IKKE_ARKIVER
                          : EtterlevelseArkivStatus.TIL_ARKIVERING,
                    }).then(setEtterlevelseArkiv)
                  } else {
                    await createEtterlevelseArkiv(newEtterlevelseArkivering as EtterlevelseArkiv).then(setEtterlevelseArkiv)
                  }
                })()

                if (etterlevelseArkiv.status === EtterlevelseArkivStatus.TIL_ARKIVERING) {
                  setIsArchivingCancelled(true)
                } else {
                  setIsArchivingCancelled(false)
                }
              }}
              size={'compact'}
              kind={etterlevelseArkiv.status !== EtterlevelseArkivStatus.TIL_ARKIVERING ? 'primary' : 'secondary'}
              $style={{
                borderWidth: '2px',
                marginRight: '16px',
                padding: '14px 16px',
              }}
            >
              {etterlevelseArkiv && etterlevelseArkiv.status === EtterlevelseArkivStatus.TIL_ARKIVERING ? 'Avbryt arkivering' : 'Arkiver'}
            </Button>
          )}
          {etterlevelseArkiv && etterlevelseArkiv.status === EtterlevelseArkivStatus.TIL_ARKIVERING && (
            <Button
              onClick={() => {
                setIsArchivingCancelled(false)
                setArkivModal(false)
              }}
              kind="primary"
              size="compact"
              $style={{
                padding: '14px 16px',
              }}
            >
              Lukk
            </Button>
          )}
        </Block>
      </ModalBody>
    </CustomizedModal>
  )
}
