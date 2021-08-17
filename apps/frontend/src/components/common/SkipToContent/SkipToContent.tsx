import { Block, BlockProps } from 'baseui/block'
import { Label3, Paragraph2 } from 'baseui/typography'
import React from 'react'
import { $StyleProp } from 'styletron-react'
import { ettlevColors } from '../../../util/theme'
import CustomizedLink from '../CustomizedLink'
import './SkipToContent.css'

const SkipToContent = () => {
  const style: $StyleProp<BlockProps> = {
    background: ettlevColors.white,
  }

  return (
    <>
      <Block $style={style} height="100%" id="skip">
        <CustomizedLink href="#content">
          <Label3>Hovedinnhold</Label3>
        </CustomizedLink>
      </Block>
      <Block $style={style} id="skip">
        <CustomizedLink href="#search">
          <Label3>Søk</Label3>
        </CustomizedLink>
      </Block>
    </>
  )
}

export default SkipToContent
