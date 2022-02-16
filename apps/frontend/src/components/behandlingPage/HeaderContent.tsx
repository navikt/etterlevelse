import {Block} from "baseui/block";
import {Tag} from "baseui/tag";
import {ettlevColors} from "../../util/theme";
import {borderColor} from "../common/Style";
import {Label3, Paragraph4} from "baseui/typography";
import React from "react";

export const HeaderContent = (props: { kravLength: number }) => (
  <Block marginBottom="33px">
    <Tag
      closeable={false}
      overrides={{
        Root: {
          style: {
            backgroundColor: ettlevColors.green50,
            ...borderColor(ettlevColors.green50),
          },
        },
      }}
    >
      <Block display="flex" alignItems="baseline">
        <Label3 color={ettlevColors.navOransje} $style={{ fontSize: '20px', lineHeight: '18px' }} marginRight="4px">
          {props.kravLength}
        </Label3>
        <Paragraph4 $style={{ lineHeight: '18px', marginTop: '0px', marginBottom: '0px' }}>krav</Paragraph4>
      </Block>
    </Tag>
  </Block>
)
