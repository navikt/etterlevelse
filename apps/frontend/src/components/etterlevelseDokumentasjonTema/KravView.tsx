import { Loader } from '@navikt/ds-react'
import React, { useEffect, useState } from 'react'
import {
  getEtterlevelserByEtterlevelseDokumentasjonIdKravNumber,
  mapEtterlevelseToFormValue,
} from '../../api/EtterlevelseApi'
import { TKravId, getKravByKravNumberAndVersion } from '../../api/KravApi'
import { EKravFilterType, IEtterlevelse, TEtterlevelseDokumentasjonQL } from '../../constants'
import { EtterlevelseKravView } from '../etterlevelse/EtterlevelseKravView'
import { toKravId } from './common/utils'

interface IProps {
  temaName?: string
  kravId: TKravId
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  navigatePath: string
  kravFilter: EKravFilterType
  nextKravToDocument: string
}

export const KravView = (props: IProps) => {
  const {
    temaName,
    kravId,
    etterlevelseDokumentasjon,
    navigatePath,
    kravFilter,
    nextKravToDocument,
  } = props

  const [varsleMelding, setVarsleMelding] = useState('')

  const [etterlevelse, setEtterlevelse] = useState<IEtterlevelse>()
  const [loadingEtterlevelseData, setLoadingEtterlevelseData] = useState<boolean>(false)
  const [tidligereEtterlevelser, setTidligereEtterlevelser] = React.useState<IEtterlevelse[]>()

  useEffect(() => {
    ;(async () => {
      setLoadingEtterlevelseData(true)
      if (kravId.kravNummer && kravId.kravVersjon) {
        const krav = await getKravByKravNumberAndVersion(kravId.kravNummer, kravId.kravVersjon)
        if (krav) {
          setVarsleMelding(krav.varselMelding || '')
        }

        if (etterlevelseDokumentasjon.id) {
          const kravVersjon = kravId.kravVersjon
          const etterlevelser = await getEtterlevelserByEtterlevelseDokumentasjonIdKravNumber(
            etterlevelseDokumentasjon.id,
            kravId.kravNummer
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
                etterlevelseDokumentasjonId: etterlevelseDokumentasjon.id,
                kravVersjon: kravVersjon,
                kravNummer: kravId.kravNummer,
              })
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
        <EtterlevelseKravView
          nextKravToDocument={nextKravToDocument}
          temaName={temaName}
          tidligereEtterlevelser={tidligereEtterlevelser}
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
          kravId={toKravId(etterlevelse)}
          etterlevelse={etterlevelse}
          setEtterlevelse={setEtterlevelse}
          varsleMelding={varsleMelding}
          navigatePath={navigatePath}
          kravFilter={kravFilter}
        />
      )}
    </div>
  )
}
