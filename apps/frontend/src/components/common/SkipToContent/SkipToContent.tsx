import {Block, BlockProps} from 'baseui/block'
import {LabelSmall} from 'baseui/typography'
import React from 'react'
import {$StyleProp} from 'styletron-react'
import {ettlevColors} from '../../../util/theme'
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
          <LabelSmall>Hovedinnhold</LabelSmall>
        </CustomizedLink>
      </Block>
      <Block $style={style} id="skip">
        <CustomizedLink href="#search">
          <LabelSmall>Søk</LabelSmall>
        </CustomizedLink>
      </Block>
    </>
  )
}

export default SkipToContent
