import { BodyShort, Checkbox, Detail } from '@navikt/ds-react'
import { EKravFilterType, TKravEtterlevelseData } from '../../constants'

interface IProps {
  krav: TKravEtterlevelseData
  noStatus?: boolean
  etterlevelseDokumentasjonId: string
  noVarsling?: boolean
  kravFilter: EKravFilterType
  temaCode?: string
}

export const CheckList = (props: IProps) => {
  const { krav } = props

  return (
    <div className="flex w-full flex-col">
      <div className="flex w-full items-center gap-8 mb-4">
        <div>&#x20;</div>
        <div>
          <Checkbox value="">&#x20;</Checkbox>
        </div>
        <div>
          <div className="md:flex justify-between">
            <div className="self-start">
              <div className="flex items-center">
                <Detail weight="semibold">
                  K{krav.kravNummer}.{krav.kravVersjon}
                </Detail>
                {/* <div className="ml-4">
                {isVarslingStatus && krav.kravVersjon === 1 && kravAge < 30 && (
                  <ShowWarningMessage warningMessage="Nytt krav" />
                )}
                {isVarslingStatus &&
                  nyVersionFlag &&
                  kravFilter === EKravFilterType.RELEVANTE_KRAV &&
                  kravAge < 30 && <ShowWarningMessage warningMessage="Ny versjon" />}
              </div> */}
              </div>
              <BodyShort>{krav.navn}</BodyShort>
            </div>
            {/* {kravFilter === EKravFilterType.RELEVANTE_KRAV && krav && krav.etterlevelseStatus && (
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
                status={
                  kravFilter === EKravFilterType.BORTFILTTERTE_KRAV ? 'Bortfiltrert' : 'Utgått'
                }
              />
            </div>
          )} */}
          </div>
        </div>
      </div>
    </div>
  )
}
