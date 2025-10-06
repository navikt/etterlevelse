import { getEtterlevelserByEtterlevelseDokumentasjonIdKravNumber } from '@/api/etterlevelse/etterlevelseApi'
import {
  getEtterlevelseMetadataByEtterlevelseDokumentasjonAndKravNummerAndKravVersion,
  mapEtterlevelseMetadataToFormValue,
} from '@/api/etterlevelseMetadata/etterlevelseMetadataApi'
import StatusView from '@/components/common/statusTag/StatusTag'
import { warningAlert } from '@/components/others/images/images'
import { EEtterlevelseStatus } from '@/constants/etterlevelseDokumentasjon/etterlevelse/etterlevelseConstants'
import { IEtterlevelseMetadata } from '@/constants/etterlevelseDokumentasjon/etterlevelse/etterlevelseMetadataConstants'
import { IRisikoscenario } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import { EKravStatus, TKravEtterlevelseData } from '@/constants/krav/kravConstants'
import { etterlevelseDokumentasjonTemaCodeKravStatusFilterUrl } from '@/routes/etterlevelseDokumentasjon/etterlevelse/etterlevelseRoutes'
import { getNumberOfDaysBetween } from '@/util/checkAge/checkAgeUtil'
import {
  getEtterlevelseStatus,
  getStatusLabelColor,
} from '@/util/etterlevelseUtil/etterlevelseUtil'
import { BodyShort, Detail, LinkPanel } from '@navikt/ds-react'
import moment from 'moment'
import Image from 'next/image'
import { useEffect, useState } from 'react'

interface IProps {
  krav: TKravEtterlevelseData
  noStatus?: boolean
  etterlevelseDokumentasjonId: string
  noVarsling?: boolean
  temaCode?: string
  risikoscenarioList: IRisikoscenario[]
}

export const KravCard = (props: IProps) => {
  const { noVarsling, krav, temaCode, etterlevelseDokumentasjonId, risikoscenarioList } = props

  const isIngenEtterlevelse = krav.etterlevelseStatus === undefined
  const isOppfyllesSenereEtterlevelse =
    krav.etterlevelseStatus === EEtterlevelseStatus.OPPFYLLES_SENERE
  const isVarslingStatus = !noVarsling && (isIngenEtterlevelse || isOppfyllesSenereEtterlevelse)

  const [nyVersionFlag, setNyVersionFlag] = useState<boolean>(false)
  const [kravAge, setKravAge] = useState<number>(0)

  const kravMedRelevantRisikoscenario =
    risikoscenarioList.filter(
      (risikoscenario) =>
        risikoscenario.relevanteKravNummer.filter(
          (kravReference) => kravReference.kravNummer === krav.kravNummer
        ).length > 0
    ).length > 0

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
      href={etterlevelseDokumentasjonTemaCodeKravStatusFilterUrl(
        etterlevelseDokumentasjonId,
        temaCode,
        krav.kravNummer,
        krav.kravVersjon
      )}
    >
      <div className='md:flex justify-between'>
        <div className='self-start'>
          <div className='flex items-center'>
            <Detail weight='semibold'>
              K{krav.kravNummer}.{krav.kravVersjon}
            </Detail>
            <div className='ml-4'>
              {krav.status === EKravStatus.UTGAATT && (
                <ShowWarningMessage warningMessage='Utgått krav' />
              )}
              {isVarslingStatus && krav.kravVersjon === 1 && kravAge < 30 && (
                <ShowWarningMessage warningMessage='Nytt krav' />
              )}
              {isVarslingStatus && nyVersionFlag && kravAge < 30 && (
                <ShowWarningMessage warningMessage='Ny versjon' />
              )}
            </div>
          </div>
          <BodyShort>{krav.navn}</BodyShort>
          <div className='flex gap-2'>
            {!krav.isIrrelevant && (
              <div className='md:flex w-full gap-2'>
                {krav.etterlevelseChangeStamp?.lastModifiedDate && (
                  <Detail className='whitespace-nowrap'>
                    {'Sist utfylt: ' +
                      moment(krav.etterlevelseChangeStamp?.lastModifiedDate).format('LL')}
                  </Detail>
                )}
                {etterlevelseMetadata &&
                  etterlevelseMetadata.tildeltMed &&
                  etterlevelseMetadata.tildeltMed.length >= 1 && (
                    <Detail className='whitespace-nowrap'>
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
        {krav && (
          <div className='self-center flex gap-2'>
            {kravMedRelevantRisikoscenario && (
              <StatusView status='Inneholder risikoscenario' variant='alt1' />
            )}

            {krav.etterlevelseStatus && (
              <StatusView
                status={getEtterlevelseStatus(krav.etterlevelseStatus, krav.frist)}
                variant={getStatusLabelColor(krav.etterlevelseStatus)}
              />
            )}
          </div>
        )}
      </div>
    </LinkPanel>
  )
}

export const ShowWarningMessage = ({ warningMessage }: { warningMessage: string }) => (
  <div className='flex items-center gap-2'>
    <Image src={warningAlert} width='18' height='18' alt='warning icon' />
    <Detail className='whitespace-nowrap'>{warningMessage}</Detail>
  </div>
)
