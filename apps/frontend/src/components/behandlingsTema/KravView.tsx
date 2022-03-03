import {getKravByKravNumberAndVersion, KravId} from '../../api/KravApi'
import {Etterlevelse} from '../../constants'
import {useEtterlevelse} from '../../api/EtterlevelseApi'
import React, {useEffect, useState} from 'react'
import {Block} from 'baseui/block'
import {Spinner} from '../common/Spinner'
import {theme} from '../../util'
import {EditEtterlevelseV2} from '../etterlevelse/EditEtterlevelseV2'
import {Section} from '../../pages/EtterlevelseDokumentasjonPage'
import {toKravId} from './utils'

export const KravView = (props: {
  kravId: KravId
  close: (e?: Etterlevelse) => void
  behandlingNavn: string
  behandlingId: string
  behandlingformaal: string
  behandlingNummer: number
  setIsAlertUnsavedModalOpen: (state: boolean) => void
  setIsNavigateButtonClicked: (state: boolean) => void
  isAlertUnsavedModalOpen: boolean
  isNavigateButtonClicked: boolean
  tab: Section
  setTab: (s: Section) => void
}) => {
  const [etterlevelse] = useEtterlevelse('ny', props.behandlingId, props.kravId)
  const [varsleMelding, setVarsleMelding] = useState('')

  useEffect(() => {
    ; (async () => {
      if (etterlevelse) {
        const kravId = toKravId(etterlevelse)
        if (kravId.kravNummer && kravId.kravVersjon) {
          const krav = await getKravByKravNumberAndVersion(kravId.kravNummer, kravId.kravVersjon)
          if (krav) {
            setVarsleMelding(krav.varselMelding || '')
          }
        }
      }
    })()
  }, [])

  return (
    <Block width="100%">
      {!etterlevelse && (
        <Block width="100%" display="flex" justifyContent="center" marginTop="50px">
          <Spinner size={theme.sizing.scale1200} />
        </Block>
      )}
      {etterlevelse && (
        <Block width="100%" display="flex" justifyContent="center">
          <EditEtterlevelseV2
            behandlingNavn={props.behandlingNavn}
            behandlingId={props.behandlingId}
            behandlingformaal={props.behandlingformaal}
            kravId={toKravId(etterlevelse)}
            etterlevelse={etterlevelse}
            behandlingNummer={props.behandlingNummer}
            varsleMelding={varsleMelding}
            close={(e) => {
              props.close(e)
            }}
            setIsAlertUnsavedModalOpen={props.setIsAlertUnsavedModalOpen}
            isAlertUnsavedModalOpen={props.isAlertUnsavedModalOpen}
            isNavigateButtonClicked={props.isNavigateButtonClicked}
            tab={props.tab}
            setTab={props.setTab}
          />
        </Block>
      )}
    </Block>
  )
}
