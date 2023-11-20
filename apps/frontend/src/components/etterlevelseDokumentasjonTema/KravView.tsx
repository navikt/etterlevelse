import { getKravByKravNumberAndVersion, KravId } from '../../api/KravApi'
import { Behandling, Etterlevelse, KRAV_FILTER_TYPE, Team } from '../../constants'
import { getEtterlevelserByEtterlevelseDokumentasjonIdKravNumber, mapEtterlevelseToFormValue } from '../../api/EtterlevelseApi'
import React, { useEffect, useState } from 'react'

import { Section } from '../../pages/EtterlevelseDokumentasjonPage'
import { toKravId } from './common/utils'
import { EditEtterlevelse } from '../etterlevelse/EditEtterlevelse'
import { Loader } from '@navikt/ds-react'

export const KravView = (props: {
  temaName?: string
  kravId: KravId
  etterlevelseDokumentasjonTitle: string
  etterlevelseDokumentasjonId: string
  etterlevelseNummer: number
  behandlinger: Behandling[] | undefined
  teams: Team[] | undefined
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
    ;(async () => {
      setLoadingEtterlevelseData(true)
      if (props.kravId.kravNummer && props.kravId.kravVersjon) {
        const krav = await getKravByKravNumberAndVersion(props.kravId.kravNummer, props.kravId.kravVersjon)
        if (krav) {
          setVarsleMelding(krav.varselMelding || '')
        }

        if (props.etterlevelseDokumentasjonId) {
          const kravVersjon = props.kravId.kravVersjon
          const etterlevelser = await getEtterlevelserByEtterlevelseDokumentasjonIdKravNumber(props.etterlevelseDokumentasjonId, props.kravId.kravNummer)
          const etterlevelserList = etterlevelser.content.sort((a, b) => (a.kravVersjon > b.kravVersjon ? -1 : 1))
          setTidligereEtterlevelser(etterlevelserList.filter((e) => e.kravVersjon < kravVersjon))

          if (etterlevelserList.filter((e) => e.kravVersjon === kravVersjon).length > 0) {
            setEtterlevelse(mapEtterlevelseToFormValue(etterlevelserList.filter((e) => e.kravVersjon === kravVersjon)[0]))
          } else {
            setEtterlevelse(
              mapEtterlevelseToFormValue({
                etterlevelseDokumentasjonId: props.etterlevelseDokumentasjonId,
                kravVersjon: kravVersjon,
                kravNummer: props.kravId.kravNummer,
              }),
            )
          }
        }
      }
      setLoadingEtterlevelseData(false)
    })()
  }, [])

  return (
    <div className='w-full'>
      {loadingEtterlevelseData && (
        <div className='flex justify-center'>
          <Loader size={'large'} />
        </div>
      )}
      {!loadingEtterlevelseData && etterlevelse && (
          <EditEtterlevelse
            temaName={props.temaName}
            tidligereEtterlevelser={tidligereEtterlevelser}
            etterlevelseDokumentasjonTitle={props.etterlevelseDokumentasjonTitle}
            etterlevelseDokumentasjonId={props.etterlevelseDokumentasjonId}
            etterlevelseNummer={props.etterlevelseNummer}
            kravId={toKravId(etterlevelse)}
            etterlevelse={etterlevelse}
            behandlinger={props.behandlinger}
            teams={props.teams}
            varsleMelding={varsleMelding}
            navigatePath={props.navigatePath}
            kravFilter={props.kravFilter}
          />
      )}
    </div>
  )
}
