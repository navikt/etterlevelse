import {getKravByKravNumberAndVersion, KravId} from '../../api/KravApi'
import {Etterlevelse, KRAV_FILTER_TYPE} from '../../constants'
import {getEtterlevelserByBehandlingsIdKravNumber, mapEtterlevelseToFormValue} from '../../api/EtterlevelseApi'
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
  navigatePath: string
  setNavigatePath: (state: string) => void
  tab: Section
  setTab: (s: Section) => void
  kravFilter: KRAV_FILTER_TYPE
}) => {
  const [varsleMelding, setVarsleMelding] = useState('')

  const [etterlevelse, setEtterlevelse] = useState<Etterlevelse>()
  const [loadingEtterlevelseData, setLoadingEtterlevelseData] = useState<boolean>(false)
  const [tidligereEtterlevelser, setTidligereEtterlevelser] = React.useState<Etterlevelse[]>()

  useEffect(() => {
    (async () => {
      setLoadingEtterlevelseData(true)
      if (props.kravId.kravNummer && props.kravId.kravVersjon) {
        const krav = await getKravByKravNumberAndVersion(props.kravId.kravNummer, props.kravId.kravVersjon)
        if (krav) {
          setVarsleMelding(krav.varselMelding || '')
        }

        if (props.behandlingId) {
          const kravVersjon = props.kravId.kravVersjon
          const etterlevelser = await getEtterlevelserByBehandlingsIdKravNumber(props.behandlingId, props.kravId.kravNummer)
          const etterlevelserList = etterlevelser.content.sort((a, b) => (a.kravVersjon > b.kravVersjon ? -1 : 1))
          setTidligereEtterlevelser(etterlevelserList.filter((e) => e.kravVersjon < kravVersjon))

          if (etterlevelserList.filter((e) => e.kravVersjon === kravVersjon).length > 0) {
            setEtterlevelse(etterlevelserList.filter((e) => e.kravVersjon === kravVersjon)[0])
          } else {
            setEtterlevelse(mapEtterlevelseToFormValue({
              behandlingId: props.behandlingId,
              kravVersjon: kravVersjon,
              kravNummer: props.kravId.kravNummer,
            }))
          }
        }
      }
      setLoadingEtterlevelseData(false)
    })()
  }, [])

  console.log(props.kravFilter)
  return (
    <Block width="100%">
      {loadingEtterlevelseData && (
        <Block width="100%" display="flex" justifyContent="center" marginTop="50px">
          <Spinner size={theme.sizing.scale1200}/>
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
            navigatePath={props.navigatePath}
            setNavigatePath={props.setNavigatePath}
            tab={props.tab}
            setTab={props.setTab}
            kravFilter={props.kravFilter}
          />
        </Block>
      )}
    </Block>
  )
}
