import { Block } from 'baseui/block'
import { Option } from 'baseui/select'
import _ from 'lodash'
import { ReactElement } from 'react'
import {
  EKravFilterType,
  TEtterlevelseDokumentasjonQL,
  TKravEtterlevelseData,
} from '../../constants'
import { user } from '../../services/User'
import { CustomPanelDivider } from '../common/CustomizedAccordion'
import { KravCard } from './KravCard'

type KravListProps = {
  kravList: TKravEtterlevelseData[]
  EmptyMessage?: ReactElement
  sortingAvailable?: boolean
  noStatus?: boolean
  sorting: readonly Option[]
  sortingOptions: Option[]
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  noVarsling?: boolean
  kravFilter: EKravFilterType
}

export const KravList = ({
  kravList,
  EmptyMessage,
  sortingAvailable,
  noStatus,
  sorting,
  sortingOptions,
  etterlevelseDokumentasjon,
  noVarsling,
  kravFilter,
}: KravListProps) => {
  if (kravList.length) {
    let sortedKravList = _.cloneDeep(kravList)
    if (sortingAvailable && sorting[0].id === sortingOptions[1].id) {
      sortedKravList.sort((a, b) => {
        if (
          a.etterlevelseChangeStamp?.lastModifiedBy.split(' ')[0] === user.getIdent() &&
          b.etterlevelseChangeStamp?.lastModifiedBy.split(' ')[0] === user.getIdent()
        ) {
          return a.etterlevelseChangeStamp.lastModifiedDate <
            b.etterlevelseChangeStamp.lastModifiedDate
            ? 1
            : -1
        } else if (
          a.etterlevelseChangeStamp?.lastModifiedBy.split(' ')[0] === user.getIdent() &&
          b.etterlevelseChangeStamp?.lastModifiedBy.split(' ')[0] !== user.getIdent()
        ) {
          return -1
        } else if (
          a.etterlevelseChangeStamp?.lastModifiedBy.split(' ')[0] !== user.getIdent() &&
          b.etterlevelseChangeStamp?.lastModifiedBy.split(' ')[0] === user.getIdent()
        ) {
          return 1
        } else {
          return 0
        }
      })
    } else {
      sortedKravList = kravList
    }

    return (
      <Block $style={{ backgroundColor: 'white' }}>
        {etterlevelseDokumentasjon &&
          sortedKravList.map((k) => {
            return (
              <CustomPanelDivider key={`${k.navn}_${k.kravNummer}_${k.kravVersjon}`}>
                <KravCard
                  krav={k}
                  key={`${k.navn}_${k.kravNummer}_${k.kravVersjon}_card`}
                  noStatus={noStatus}
                  etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
                  noVarsling={noVarsling}
                  kravFilter={kravFilter}
                />
              </CustomPanelDivider>
            )
          })}
      </Block>
    )
  } else {
    return (
      <CustomPanelDivider>
        <Block display="flex" width="100%" marginLeft="24px">
          {EmptyMessage}
        </Block>
      </CustomPanelDivider>
    )
  }
}
