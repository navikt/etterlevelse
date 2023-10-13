import { ModalBody, ModalHeader } from 'baseui/modal'
import { Block } from 'baseui/block'
import { EtterlevelseArkiv, EtterlevelseArkivStatus } from '../../constants'
import { createEtterlevelseArkiv, updateEtterlevelseArkiv } from '../../api/ArkiveringApi'
import React, { useState } from 'react'
import moment from 'moment'
import CustomizedModal from '../common/CustomizedModal'
import { borderRadius } from '../common/Style'
import Button from '../common/Button'
import { BodyLong } from '@navikt/ds-react'
import { user } from '../../services/User'

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
            <Block>Arkivert av: {etterlevelseArkiv && etterlevelseArkiv.arkivertAv ? etterlevelseArkiv.arkivertAv.split('-')[1] : ''}</Block>
          </>
        )
      case EtterlevelseArkivStatus.ARKIVERT:
        return (
          <>
            <Block>Sist arkivert: {moment(etterlevelseArkiv?.arkiveringDato).format('lll')}</Block>

            <Block>Arkivert av: {etterlevelseArkiv && etterlevelseArkiv.arkivertAv ? etterlevelseArkiv.arkivertAv.split('-')[1] : ''}</Block>
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
      <ModalHeader>{etterlevelseArkiv && etterlevelseArkiv.status === EtterlevelseArkivStatus.TIL_ARKIVERING ? 'Arkivering bestilt' : 'Arkivér i Websak'}</ModalHeader>
      <ModalBody>
        <BodyLong className="mb-4">
             Arkiveringen skjer puljevis hver dag klokka 12.00 og 00.00. 
             Etter disse tidspunktene vil du finne din etterlevelsesdokumentasjon i WebSak ved å søke på ditt etterlevelsesnummer. 
             Etterlevelsesnummeret begynner med E etterfulgt av tre tall.
        </BodyLong>
        
        {etterlevelseArkiv && etterlevelseArkiv.status === EtterlevelseArkivStatus.IKKE_ARKIVER && (
          <BodyLong className="mb-4">Arkivering av etterlevelsesdokumentasjon i Websak gir sporbarhet og dokumenterer grunnlaget for risikovurderinger og rapportering.</BodyLong>
        )}
        <Block>{etterlevelseArkiv ? getStatustext(etterlevelseArkiv.status) : ''}</Block>
        {isArchivingCancelled && etterlevelseArkiv?.arkiveringAvbruttDato && <Block>Avbrutt dato: {moment(etterlevelseArkiv?.arkiveringAvbruttDato).format('lll')}</Block>}
        <Block marginTop="16px" display="flex" $style={{ justifyContent: 'flex-end', paddingTop: '16px' }}>
          {etterlevelseArkiv && etterlevelseArkiv.status !== EtterlevelseArkivStatus.BEHANDLER_ARKIVERING && etterlevelseArkiv.status !== EtterlevelseArkivStatus.ERROR && (
            <Button
              onClick={() => {
                const newEtterlevelseArkivering = {
                  etterlevelseDokumentasjonId: etterlevelseDokumentasjonId,
                  arkivertAv: user.getIdent() + ' - ' + user.getName(),
                  status:
                    etterlevelseArkiv && etterlevelseArkiv.status === EtterlevelseArkivStatus.TIL_ARKIVERING
                      ? EtterlevelseArkivStatus.IKKE_ARKIVER
                      : EtterlevelseArkivStatus.TIL_ARKIVERING,
                }

                ;(async () => {
                  if (etterlevelseArkiv && etterlevelseArkiv.id) {
                    await updateEtterlevelseArkiv({
                      ...etterlevelseArkiv,
                      arkivertAv: user.getIdent() + ' - ' + user.getName(),
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
              kind={etterlevelseArkiv.status !== EtterlevelseArkivStatus.TIL_ARKIVERING ? 'primary' : 'secondary'}
              $style={{
                borderWidth: '2px',
                marginRight: '16px',
                padding: '14px 16px',
              }}
            >
              {etterlevelseArkiv && etterlevelseArkiv.status === EtterlevelseArkivStatus.TIL_ARKIVERING ? 'Avbryt arkivering i WebSak' : 'Arkivér i WebSak'}
            </Button>
          )}
          {etterlevelseArkiv && etterlevelseArkiv.status === EtterlevelseArkivStatus.TIL_ARKIVERING && (
            <Button
              onClick={() => {
                setIsArchivingCancelled(false)
                setArkivModal(false)
              }}
              kind="primary"
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
