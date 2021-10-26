import {codelist, ListName} from "../../services/Codelist";
import {CustomizedAccordion, CustomizedPanel} from "../common/CustomizedAccordion";
import {useEffect} from "react";
import {getAllKrav} from "../../api/KravApi";

export const TemaList = ()=>{
  console.log(codelist.getCodes(ListName.TEMA))
  useEffect(() => {
    (async () => {
      // setLoading(true)
      let kravs = await getAllKrav();
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
        codelist.getCodes(ListName.TEMA).map(t=>{
          return (
            <CustomizedPanel title={t.shortName} key={`${t.code}_krav_list`}>
              <>1</>
            </CustomizedPanel>
          )
        })
      }
      </CustomizedAccordion>
    </>
  )
}
