import { BodyShort, Checkbox, Detail } from '@navikt/ds-react'
import { TKravEtterlevelseData } from '../../constants'
import StatusView from '../common/StatusTag'
import {
  getEtterlevelseStatus,
  getStatusLabelColor,
} from '../etterlevelseDokumentasjon/common/utils'

interface IProps {
  krav: TKravEtterlevelseData
}

export const CheckList = (props: IProps) => {
  const { krav } = props

  return (
    <div className="flex w-full flex-col">
      <div className="flex w-full items-center gap-8 mb-4">
        <div>
          <Checkbox value={krav.kravNummer.toString()}>&#x20;</Checkbox>
        </div>
        <div>
          <div className="self-start">
            <div className="flex items-center gap-2">
              <Detail weight="semibold">
                K{krav.kravNummer}.{krav.kravVersjon}
              </Detail>
              {krav && krav.etterlevelseStatus && (
                <div className="self-center">
                  <StatusView
                    status={getEtterlevelseStatus(krav.etterlevelseStatus, krav.frist)}
                    variant={getStatusLabelColor(krav.etterlevelseStatus)}
                  />
                </div>
              )}
            </div>
            <BodyShort>{krav.navn}</BodyShort>
          </div>
        </div>
      </div>
    </div>
  )
}
