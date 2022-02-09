import {StatefulPopover} from "baseui/popover";
import {Block} from "baseui/block";
import {Input} from "baseui/input";
import {Button} from "baseui/button";
import {PLACEMENT} from "baseui/tooltip";

export const CustomizedPopoverButton = (props: any) => {
  return (
    <StatefulPopover
      content={() => (
        <Block padding={"20px"}>
          <Button onClick={()=>{
            console.log("API")}}>Tildelt med meg</Button>
        </Block>
      )}
      returnFocus
      autoFocus
      showArrow={true}
      placement={PLACEMENT.bottom}
    >
      <Button {...props}>Click me</Button>
    </StatefulPopover>
  );
}
