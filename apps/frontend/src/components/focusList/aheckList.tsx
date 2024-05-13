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
              </div>
              <BodyShort>{krav.navn}</BodyShort>
            {krav && krav.etterlevelseStatus && (
              <div className="self-center">
                <StatusView
                  status={getEtterlevelseStatus(krav.etterlevelseStatus, krav.frist)}
                  variant={getStatusLabelColor(krav.etterlevelseStatus)}
                />
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
