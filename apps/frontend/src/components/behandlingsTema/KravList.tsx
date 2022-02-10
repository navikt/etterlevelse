import {Behandling, EtterlevelseStatus, KravEtterlevelseData} from "../../constants";
import _ from "lodash";
import {user} from "../../services/User";
import {Block} from "baseui/block";
import CustomizedSelect from "../common/CustomizedSelect";
import {CustomPanelDivider} from "../common/CustomizedAccordion";
import {KravCard} from "./KravCard";
import {Paragraph4} from "baseui/typography";
import React from "react";
import {Option} from "baseui/select";
import {KravId} from "../../api/KravApi";

type KravListProps = {
  kravList: KravEtterlevelseData[]
  emptyMessage: string
  sortingAvailable?: boolean
  noStatus?: boolean
  sorting: readonly Option[]
  setSorting: React.Dispatch<React.SetStateAction<readonly Option[]>>
  sortingOptions: Option[]
  behandling: Behandling
  isExpanded: boolean
  setActiveEtterlevelseStatus: React.Dispatch<React.SetStateAction<EtterlevelseStatus | undefined>>
  setEdit: React.Dispatch<React.SetStateAction<string | undefined>>
  setKravId:  React.Dispatch<React.SetStateAction<KravId | undefined>>
}

export const KravList = ({
                       kravList,
                       emptyMessage,
                       sortingAvailable,
                       noStatus,
                       sorting,
                       sortingOptions,
                       isExpanded,
                       setSorting,
                       behandling,
                       setActiveEtterlevelseStatus,
                       setKravId,
                       setEdit
                     }: KravListProps) => {
  if (kravList.length) {
    let sortedKravList = _.cloneDeep(kravList)
    if (sortingAvailable && sorting[0].id === sortingOptions[1].id) {
      sortedKravList.sort((a, b) => {
        if (a.etterlevelseChangeStamp?.lastModifiedBy.split(' ')[0] === user.getIdent() && b.etterlevelseChangeStamp?.lastModifiedBy.split(' ')[0] === user.getIdent()) {
          return a.etterlevelseChangeStamp.lastModifiedDate < b.etterlevelseChangeStamp.lastModifiedDate ? 1 : -1
        } else if (a.etterlevelseChangeStamp?.lastModifiedBy.split(' ')[0] === user.getIdent() && b.etterlevelseChangeStamp?.lastModifiedBy.split(' ')[0] !== user.getIdent()) {
          return -1
        } else if (a.etterlevelseChangeStamp?.lastModifiedBy.split(' ')[0] !== user.getIdent() && b.etterlevelseChangeStamp?.lastModifiedBy.split(' ')[0] === user.getIdent()) {
          return 1
        } else {
          return 0
        }
      })
    } else {
      sortedKravList = kravList
    }

    return (
      <Block $style={{backgroundColor: 'white'}}>
        {isExpanded && sortingAvailable && (
          <Block marginBottom="12px" paddingLeft="20px" paddingRight="20px" width="100%" maxWidth="290px">
            <CustomizedSelect clearable={false} options={sortingOptions} value={sorting} onChange={(params) => setSorting(params.value)}/>
          </Block>
        )}
        {behandling && sortedKravList.map((k) => {
          return (
            <CustomPanelDivider key={`${k.navn}_${k.kravNummer}_${k.kravVersjon}`}>
              <KravCard
                setActiveEtterlevelseStatus={setActiveEtterlevelseStatus}
                krav={k}
                setEdit={setEdit}
                setKravId={setKravId}
                key={`${k.navn}_${k.kravNummer}_${k.kravVersjon}_card`}
                noStatus={noStatus}
                behandlingId={behandling.id}
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
          <Paragraph4> {emptyMessage}</Paragraph4>
        </Block>
      </CustomPanelDivider>
    )
  }
}
