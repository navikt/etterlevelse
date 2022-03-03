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
}) => {
  const [etterlevelse, setEtterlevelse] = useState<Etterlevelse>()
  const [loadingEtterlevelseData, setLoadingEtterlevelseData] = useState<boolean>(false)
  const [tidligereEtterlevelser, setTidligereEtterlevelser] = React.useState<Etterlevelse[]>()

  const [varsleMelding, setVarsleMelding] = useState('')

  useEffect(() => {
    (async () => {
      setLoadingEtterlevelseData(true)
      if (props.behandlingId && props.kravId.kravNummer && props.kravId.kravVersjon) {
        const kravVersjon = props.kravId.kravVersjon

        const krav = await getKravByKravNumberAndVersion(props.kravId.kravNummer, props.kravId.kravVersjon)
          if (krav) {
            setVarsleMelding(krav.varselMelding || '')
          }
        const etterlevelser = await getEtterlevelserByBehandlingsIdKravNumber(props.behandlingId, props.kravId.kravNummer)
        const etterlevelserList = etterlevelser.content.sort((a, b) => (a.kravVersjon > b.kravVersjon ? -1 : 1))
        setTidligereEtterlevelser(etterlevelserList.filter((e) => e.kravVersjon < kravVersjon))

        if (etterlevelserList.filter((e) => e.kravVersjon === kravVersjon).length > 0) {
          setEtterlevelse(etterlevelserList.filter((e) => e.kravVersjon === kravVersjon)[0])
        } else {
          setEtterlevelse(mapEtterlevelseToFormValue({
            behandlingId: props.behandlingId,
            kravVersjon: props.kravId.kravVersjon,
            kravNummer: props.kravId.kravNummer,
          }))
        }
      }
      
      setLoadingEtterlevelseData(false)
    })()
  }, [])

  return (
    <Block width="100%">
      {loadingEtterlevelseData && (
        <Block width="100%" display="flex" justifyContent="center" marginTop="50px">
          <Spinner size={theme.sizing.scale1200} />
        </Block>
      )}
      {!loadingEtterlevelseData && etterlevelse && (
        <Block width="100%" display="flex" justifyContent="center">
          <EditEtterlevelseV2
            tidligereEtterlevelser={tidligereEtterlevelser}
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
