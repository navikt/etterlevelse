import { getKravByKravNumberAndVersion, KravId } from '../../api/KravApi'
import { Etterlevelse } from '../../constants'
import { getEtterlevelserByBehandlingsIdKravNumber, mapEtterlevelseToFormValue, useEtterlevelse } from '../../api/EtterlevelseApi'
import React, { useEffect, useState } from 'react'
import { Block } from 'baseui/block'
import { Spinner } from '../common/Spinner'
import { theme } from '../../util'
import { EditEtterlevelseV2 } from '../etterlevelse/EditEtterlevelseV2'
import { Section } from '../../pages/EtterlevelseDokumentasjonPage'
import { toKravId } from './utils'

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
  etterlevelse: Etterlevelse
  tidligereEtterlevelser: Etterlevelse[] | undefined
  loadingEtterlevelseData: Boolean
}) => {
  const [varsleMelding, setVarsleMelding] = useState('')

  useEffect(() => {
    (async () => {
      if (props.kravId.kravNummer && props.kravId.kravVersjon) {
        const krav = await getKravByKravNumberAndVersion(props.kravId.kravNummer, props.kravId.kravVersjon)
        if (krav) {
          setVarsleMelding(krav.varselMelding || '')
        }
      }
    })()
  }, [])

  return (
    <Block width="100%">
      {props.loadingEtterlevelseData && (
        <Block width="100%" display="flex" justifyContent="center" marginTop="50px">
          <Spinner size={theme.sizing.scale1200} />
        </Block>
      )}
      {!props.loadingEtterlevelseData && props.etterlevelse && (
        <Block width="100%" display="flex" justifyContent="center">
          <EditEtterlevelseV2
            tidligereEtterlevelser={props.tidligereEtterlevelser}
            behandlingNavn={props.behandlingNavn}
            behandlingId={props.behandlingId}
            behandlingformaal={props.behandlingformaal}
            kravId={toKravId(props.etterlevelse)}
            etterlevelse={props.etterlevelse}
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
