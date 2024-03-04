import { Loader } from '@navikt/ds-react'
import React, { useEffect, useState } from 'react'
import {
  getEtterlevelserByEtterlevelseDokumentasjonIdKravNumber,
  mapEtterlevelseToFormValue,
} from '../../api/EtterlevelseApi'
import { TKravId, getKravByKravNumberAndVersion } from '../../api/KravApi'
import { EKravFilterType, IBehandling, IEtterlevelse, ITeam } from '../../constants'
import { TSection } from '../../pages/EtterlevelseDokumentasjonPage'
import { EtterlevelseKravView } from '../etterlevelse/EtterlevelseKravView'
import { toKravId } from './common/utils'

export const KravView = (props: {
  temaName?: string
  kravId: TKravId
  etterlevelseDokumentasjonTitle: string
  etterlevelseDokumentasjonId: string
  etterlevelseNummer: number
  behandlinger: IBehandling[] | undefined
  teams: ITeam[] | undefined
  navigatePath: string
  setNavigatePath: (state: string) => void
  tab: TSection
  setTab: (section: TSection) => void
  kravFilter: EKravFilterType
  nextKravToDocument: string
}) => {
  const [varsleMelding, setVarsleMelding] = useState('')

  const [etterlevelse, setEtterlevelse] = useState<IEtterlevelse>()
  const [loadingEtterlevelseData, setLoadingEtterlevelseData] = useState<boolean>(false)
  const [tidligereEtterlevelser, setTidligereEtterlevelser] = React.useState<IEtterlevelse[]>()
  useEffect(() => {
    ;(async () => {
      setLoadingEtterlevelseData(true)
      if (props.kravId.kravNummer && props.kravId.kravVersjon) {
        const krav = await getKravByKravNumberAndVersion(
          props.kravId.kravNummer,
          props.kravId.kravVersjon
        )
        if (krav) {
          setVarsleMelding(krav.varselMelding || '')
        }

        if (props.etterlevelseDokumentasjonId) {
          const kravVersjon = props.kravId.kravVersjon
          const etterlevelser = await getEtterlevelserByEtterlevelseDokumentasjonIdKravNumber(
            props.etterlevelseDokumentasjonId,
            props.kravId.kravNummer
          )
          const etterlevelserList = etterlevelser.content.sort((a, b) =>
            a.kravVersjon > b.kravVersjon ? -1 : 1
          )
          setTidligereEtterlevelser(etterlevelserList.filter((e) => e.kravVersjon < kravVersjon))

          if (etterlevelserList.filter((e) => e.kravVersjon === kravVersjon).length > 0) {
            setEtterlevelse(
              mapEtterlevelseToFormValue(
                etterlevelserList.filter((e) => e.kravVersjon === kravVersjon)[0]
              )
            )
          } else {
            setEtterlevelse(
              mapEtterlevelseToFormValue({
                etterlevelseDokumentasjonId: props.etterlevelseDokumentasjonId,
                kravVersjon: kravVersjon,
                kravNummer: props.kravId.kravNummer,
              })
            )
          }
        }
      }
      setLoadingEtterlevelseData(false)
    })()
  }, [])

  return (
    <div className="w-full">
      {loadingEtterlevelseData && (
        <div className="flex justify-center">
          <Loader size={'large'} />
        </div>
      )}
      {!loadingEtterlevelseData && etterlevelse && (
        <EtterlevelseKravView
          nextKravToDocument={props.nextKravToDocument}
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
