import {codelist, ListName} from "../../services/Codelist";
import {CustomizedAccordion, CustomizedPanel, CustomPanelDivider} from "../common/CustomizedAccordion";
import React, {useEffect, useState} from "react";
import {getAllKrav} from "../../api/KravApi";
import {Krav} from "../../constants";
import {Block} from "baseui/block";
import {KravPanels} from "../../pages/KravListPageV2";
import {Paragraph4} from "baseui/typography";

export const TemaList = () => {
  const [allKrav, setAllKrav] = useState<Krav[]>()
  const tema = codelist.getCodes(ListName.TEMA)

  useEffect(() => {
    (async () => {
      // setLoading(true)
      setAllKrav(await getAllKrav());
      console.log(await getAllKrav())
      // if (processes) {
      //   setDpProcesses(processes)
      // }
      // setLoading(false)
    })()
  }, []);

  return (
    <>
      <CustomizedAccordion>
        {
          codelist.getCodes(ListName.TEMA).map(t => {
            const kraver = allKrav?.filter(k => {
              return k.regelverk.map(r => r.lov.data && r.lov.data.tema).includes(t.code)
            })
            return kraver && kraver.length > 0 ? (
                <CustomizedPanel title={t.shortName} key={`${t.code}_krav_list`}>
                  <KravPanels kravene={kraver}/>
                </CustomizedPanel>
              ) :
              <CustomizedPanel title={t.shortName} key={`${t.code}_krav_list`}>
                <CustomPanelDivider>
                  <Block display="flex" width="100%" marginLeft="24px">
                    <Paragraph4>Ingen krav under utfylling</Paragraph4>
                  </Block>
                </CustomPanelDivider>
              </CustomizedPanel>
          })
        }
      </CustomizedAccordion>
    </>
  )
}
