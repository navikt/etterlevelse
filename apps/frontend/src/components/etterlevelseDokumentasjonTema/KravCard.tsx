import { BodyShort, Detail, LinkPanel } from '@navikt/ds-react'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { getEtterlevelserByEtterlevelseDokumentasjonIdKravNumber } from '../../api/EtterlevelseApi'
import {
  getEtterlevelseMetadataByEtterlevelseDokumentasjonAndKravNummerAndKravVersion,
  mapEtterlevelseMetadataToFormValue,
} from '../../api/EtterlevelseMetadataApi'
import {
  EEtterlevelseStatus,
  EKravFilterType,
  IEtterlevelseMetadata,
  TKravEtterlevelseData,
} from '../../constants'
import { getNumberOfDaysBetween } from '../../util/checkAge'
import { warningAlert } from '../Images'
import StatusView from '../common/StatusTag'
import {
  getEtterlevelseStatus,
  getStatusLabelColor,
} from '../etterlevelseDokumentasjon/common/utils'

interface IProps {
  krav: TKravEtterlevelseData
  noStatus?: boolean
  etterlevelseDokumentasjonId: string
  noVarsling?: boolean
  kravFilter: EKravFilterType
  temaCode?: string
}

export const KravCard = (props: IProps) => {
  const { noVarsling, krav, kravFilter, temaCode, etterlevelseDokumentasjonId } = props

  const isIngenEtterlevelse = krav.etterlevelseStatus === undefined
  const isOppfyllesSenereEtterlevelse =
    krav.etterlevelseStatus === EEtterlevelseStatus.OPPFYLLES_SENERE
  const isVarslingStatus = !noVarsling && (isIngenEtterlevelse || isOppfyllesSenereEtterlevelse)

  const [nyVersionFlag, setNyVersionFlag] = useState<boolean>(false)
  const [kravAge, setKravAge] = useState<number>(0)

  const [etterlevelseMetadata, setEtterlevelseMetadata] = useState<IEtterlevelseMetadata>(
    mapEtterlevelseMetadataToFormValue({
      id: 'ny',
      etterlevelseDokumentasjonId: etterlevelseDokumentasjonId,
      kravNummer: krav.kravNummer,
      kravVersjon: krav.kravVersjon,
    })
  )

  const getEtterlevelseMetaData = () => {
    getEtterlevelseMetadataByEtterlevelseDokumentasjonAndKravNummerAndKravVersion(
      etterlevelseDokumentasjonId,
      krav.kravNummer,
      krav.kravVersjon
    ).then((resp) => {
      if (resp.content.length) {
        setEtterlevelseMetadata(resp.content[0])
      } else {
        setEtterlevelseMetadata(
          mapEtterlevelseMetadataToFormValue({
            id: 'ny',
            etterlevelseDokumentasjonId: etterlevelseDokumentasjonId,
            kravNummer: krav.kravNummer,
            kravVersjon: krav.kravVersjon,
          })
        )
      }
    })
  }

  useEffect(() => {
    const today = new Date()
    setKravAge(getNumberOfDaysBetween(krav.aktivertDato, today))
    ;(async () => {
      getEtterlevelseMetaData()
      if (krav.kravVersjon > 1 && (isIngenEtterlevelse || isOppfyllesSenereEtterlevelse)) {
        setNyVersionFlag(
          (
            await getEtterlevelserByEtterlevelseDokumentasjonIdKravNumber(
              etterlevelseDokumentasjonId,
              krav.kravNummer
            )
          ).content.length >= 1
        )
      }
    })()
  }, [])

  return (
    <LinkPanel
      href={`/dokumentasjon/${etterlevelseDokumentasjonId}/${temaCode}/RELEVANTE_KRAV/krav/${krav.kravNummer}/${krav.kravVersjon}/`}
    >
      <div className="md:flex justify-between">
        <div className="self-start">
          <div className="flex items-center">
            <Detail weight="semibold">
              K{krav.kravNummer}.{krav.kravVersjon}
            </Detail>
            <div className="ml-4">
              {isVarslingStatus && krav.kravVersjon === 1 && kravAge < 30 && (
                <ShowWarningMessage warningMessage="Nytt krav" />
              )}
              {isVarslingStatus &&
                nyVersionFlag &&
                kravFilter === EKravFilterType.RELEVANTE_KRAV &&
                kravAge < 30 && <ShowWarningMessage warningMessage="Ny versjon" />}
            </div>
          </div>
          <BodyShort>{krav.navn}</BodyShort>
          <div className="flex gap-2">
            {!krav.isIrrelevant && (
              <div className="md:flex w-full gap-2">
                {krav.etterlevelseChangeStamp?.lastModifiedDate && (
                  <Detail className="whitespace-nowrap">
                    {'Sist utfylt: ' +
                      moment(krav.etterlevelseChangeStamp?.lastModifiedDate).format('ll')}
                  </Detail>
                )}
                {etterlevelseMetadata &&
                  etterlevelseMetadata.tildeltMed &&
                  etterlevelseMetadata.tildeltMed.length >= 1 && (
                    <Detail className="whitespace-nowrap">
                      Tildelt:{' '}
                      {etterlevelseMetadata.tildeltMed[0].length > 12
                        ? etterlevelseMetadata.tildeltMed[0].substring(0, 11) + '...'
                        : etterlevelseMetadata.tildeltMed[0]}
                    </Detail>
                  )}
              </div>
            )}
          </div>
        </div>
        {kravFilter === EKravFilterType.RELEVANTE_KRAV && krav && krav.etterlevelseStatus && (
          <div className="self-center">
            <StatusView
              status={getEtterlevelseStatus(krav.etterlevelseStatus, krav.frist)}
              variant={getStatusLabelColor(krav.etterlevelseStatus)}
            />
          </div>
        )}

        {kravFilter !== EKravFilterType.RELEVANTE_KRAV && (
          <div className="self-center">
            <StatusView
              status={kravFilter === EKravFilterType.BORTFILTTERTE_KRAV ? 'Bortfiltrert' : 'Utgått'}
            />
          </div>
        )}
      </div>
    </LinkPanel>
  )
}

export const ShowWarningMessage = ({ warningMessage }: { warningMessage: string }) => (
  <div className="flex items-center gap-2">
    <img src={warningAlert} width="1.125rem" height="1.125rem" alt="warning icon" />
    <Detail className="whitespace-nowrap">{warningMessage}</Detail>
  </div>
)
