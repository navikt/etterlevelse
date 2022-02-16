import { Behandling, EtterlevelseStatus, KravEtterlevelseData } from "../../constants";
import _ from "lodash";
import { user } from "../../services/User";
import { Block } from "baseui/block";
import CustomizedSelect from "../common/CustomizedSelect";
import { CustomPanelDivider } from "../common/CustomizedAccordion";
import { KravCard } from "./KravCard";
import { Paragraph4 } from "baseui/typography";
import React from "react";
import { Option } from "baseui/select";
import { KravId } from "../../api/KravApi";

type KravListProps = {
  kravList: KravEtterlevelseData[]
  emptyMessage: string
  sortingAvailable?: boolean
  noStatus?: boolean
  sorting: readonly Option[]
  sortingOptions: Option[]
  behandling: Behandling
  setActiveEtterlevelseStatus: React.Dispatch<React.SetStateAction<EtterlevelseStatus | undefined>>
  setEdit: React.Dispatch<React.SetStateAction<string | undefined>>
  setKravId: React.Dispatch<React.SetStateAction<KravId | undefined>>
  edit: string | undefined
  noVarsling?: boolean
}

export const KravList = ({
  kravList,
  emptyMessage,
  sortingAvailable,
  noStatus,
  sorting,
  sortingOptions,
  behandling,
  setActiveEtterlevelseStatus,
  setKravId,
  setEdit,
  edit,
  noVarsling
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
      <Block $style={{ backgroundColor: 'white' }}>
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
                edit={edit}
                noVarsling={noVarsling}
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
