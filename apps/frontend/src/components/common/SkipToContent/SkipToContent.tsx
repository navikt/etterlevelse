import { Block } from 'baseui/block'
import { LabelSmall } from 'baseui/typography'
import { StyleObject } from 'styletron-react'
import { ettlevColors } from '../../../util/theme'
import CustomizedLink from '../CustomizedLink'
import './SkipToContent.css'

const SkipToContent = () => {
  const style: StyleObject = {
    background: ettlevColors.white,
  }

  return (
    <>
      <Block $style={style} height="100%" className="skip">
        <CustomizedLink href="#content">
          <LabelSmall>Hovedinnhold</LabelSmall>
        </CustomizedLink>
      </Block>
      <Block $style={style} className="skip">
        <CustomizedLink href="#search">
          <LabelSmall>Søk</LabelSmall>
        </CustomizedLink>
      </Block>
    </>
  )
}

export default SkipToContent
