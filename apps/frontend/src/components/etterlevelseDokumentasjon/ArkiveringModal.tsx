import { BodyLong, Button, Modal } from '@navikt/ds-react'
import { Block } from 'baseui/block'
import { ModalBody } from 'baseui/modal'
import moment from 'moment'
import React, { useState } from 'react'
import { createEtterlevelseArkiv, updateEtterlevelseArkiv } from '../../api/ArkiveringApi'
import { EEtterlevelseArkivStatus, IEtterlevelseArkiv } from '../../constants'
import { user } from '../../services/User'

type TArkiveringModalProps = {
  arkivModal: boolean
  setArkivModal: React.Dispatch<React.SetStateAction<boolean>>
  etterlevelseDokumentasjonId: string
  etterlevelseArkiv?: IEtterlevelseArkiv
  setEtterlevelseArkiv: (etterlevelseArkiv: IEtterlevelseArkiv | undefined) => void
}

export const ArkiveringModal = ({
  arkivModal,
  setArkivModal,
  etterlevelseDokumentasjonId,
  etterlevelseArkiv,
  setEtterlevelseArkiv,
}: TArkiveringModalProps) => {
  const [isArchivingCancelled, setIsArchivingCancelled] = useState<boolean>(false)

  const getStatustext = (etterlevelseArkivStatus: EEtterlevelseArkivStatus) => {
    switch (etterlevelseArkivStatus) {
      case EEtterlevelseArkivStatus.TIL_ARKIVERING:
        return (
          <>
            <Block>Bestilt: {moment(etterlevelseArkiv?.tilArkiveringDato).format('lll')}</Block>
            <Block>
              Arkivert av:{' '}
              {etterlevelseArkiv && etterlevelseArkiv.arkivertAv
                ? etterlevelseArkiv.arkivertAv.split('-')[1]
                : ''}
            </Block>
          </>
        )
      case EEtterlevelseArkivStatus.ARKIVERT:
        return (
          <>
            <Block>Sist arkivert: {moment(etterlevelseArkiv?.arkiveringDato).format('lll')}</Block>

            <Block>
              Arkivert av:{' '}
              {etterlevelseArkiv && etterlevelseArkiv.arkivertAv
                ? etterlevelseArkiv.arkivertAv.split('-')[1]
                : ''}
            </Block>
          </>
        )
      case EEtterlevelseArkivStatus.BEHANDLER_ARKIVERING:
        return 'Arkivering er under behandling.'
      case EEtterlevelseArkivStatus.ERROR:
        return 'Det oppstod en feil ved forrige arkivering, vi er på saken. Ta kontakt i #etterlevelse på Slack hvis du lurer på noe.'
      default:
        return ''
    }
  }

  const isStatusTilArkivering =
    etterlevelseArkiv && etterlevelseArkiv.status === EEtterlevelseArkivStatus.TIL_ARKIVERING

  return (
    <Modal
      open={arkivModal}
      onClose={() => {
        setIsArchivingCancelled(false)
        setArkivModal(false)
      }}
      aria-label="Arkiverings modal"
      header={{
        heading: isStatusTilArkivering ? 'Arkivering bestilt' : 'Arkivér i Websak',
        closeButton: false,
      }}
    >
      <ModalBody>
        <BodyLong className="mb-4">
          Arkiveringen skjer puljevis hver dag klokka 12.00 og 00.00. Etter disse tidspunktene vil
          du finne din etterlevelsesdokumentasjon i WebSak ved å søke på ditt etterlevelsesnummer.
          Etterlevelsesnummeret begynner med E etterfulgt av tre tall.
        </BodyLong>

        {etterlevelseArkiv &&
          etterlevelseArkiv.status === EEtterlevelseArkivStatus.IKKE_ARKIVER && (
            <BodyLong className="mb-4">
              Arkivering av etterlevelsesdokumentasjon i Websak gir sporbarhet og dokumenterer
              grunnlaget for risikovurderinger og rapportering.
            </BodyLong>
          )}
        <div>{etterlevelseArkiv ? getStatustext(etterlevelseArkiv.status) : ''}</div>
        {isArchivingCancelled && etterlevelseArkiv?.arkiveringAvbruttDato && (
          <div>Avbrutt dato: {moment(etterlevelseArkiv?.arkiveringAvbruttDato).format('lll')}</div>
        )}
        <div className="flex justify-end pt-4 mt-4">
          <Button
            className="mr-2.5"
            type="button"
            variant="secondary"
            onClick={() => {
              setIsArchivingCancelled(false)
              setArkivModal(false)
            }}
          >
            Lukk
          </Button>
          {etterlevelseArkiv &&
            etterlevelseArkiv.status !== EEtterlevelseArkivStatus.BEHANDLER_ARKIVERING &&
            etterlevelseArkiv.status !== EEtterlevelseArkivStatus.ERROR && (
              <Button
                onClick={() => {
                  const newEtterlevelseArkivering = {
                    etterlevelseDokumentasjonId: etterlevelseDokumentasjonId,
                    arkivertAv: user.getIdent() + ' - ' + user.getName(),
                    status:
                      etterlevelseArkiv &&
                      etterlevelseArkiv.status === EEtterlevelseArkivStatus.TIL_ARKIVERING
                        ? EEtterlevelseArkivStatus.IKKE_ARKIVER
                        : EEtterlevelseArkivStatus.TIL_ARKIVERING,
                  }

                  ;(async () => {
                    if (etterlevelseArkiv && etterlevelseArkiv.id) {
                      await updateEtterlevelseArkiv({
                        ...etterlevelseArkiv,
                        arkivertAv: user.getIdent() + ' - ' + user.getName(),
                        status:
                          etterlevelseArkiv &&
                          etterlevelseArkiv.status === EEtterlevelseArkivStatus.TIL_ARKIVERING
                            ? EEtterlevelseArkivStatus.IKKE_ARKIVER
                            : EEtterlevelseArkivStatus.TIL_ARKIVERING,
                      }).then(setEtterlevelseArkiv)
                    } else {
                      await createEtterlevelseArkiv(
                        newEtterlevelseArkivering as IEtterlevelseArkiv
                      ).then(setEtterlevelseArkiv)
                    }
                  })()

                  if (etterlevelseArkiv.status === EEtterlevelseArkivStatus.TIL_ARKIVERING) {
                    setIsArchivingCancelled(true)
                  } else {
                    setIsArchivingCancelled(false)
                  }
                }}
                variant={
                  etterlevelseArkiv.status !== EEtterlevelseArkivStatus.TIL_ARKIVERING
                    ? 'primary'
                    : 'secondary'
                }
              >
                {etterlevelseArkiv &&
                etterlevelseArkiv.status === EEtterlevelseArkivStatus.TIL_ARKIVERING
                  ? 'Avbryt arkivering i WebSak'
                  : 'Arkivér i WebSak'}
              </Button>
            )}
        </div>
      </ModalBody>
    </Modal>
  )
}
