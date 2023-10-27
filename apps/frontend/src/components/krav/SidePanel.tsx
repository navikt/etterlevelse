import {LinkPanel} from "@navikt/ds-react";

export const SidePanel = () => {
  return (
    <LinkPanel href={"/dokumentasjoner"} className={"mx-1 w-52 flex"}>
      <LinkPanel.Title>Dokumentere etterlevelse</LinkPanel.Title>
    </LinkPanel>
  )
}

export default SidePanel
