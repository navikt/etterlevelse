import { Block } from 'baseui/block'
import { Tag } from 'baseui/tag'
import { ettlevColors } from '../../util/theme'
import { borderColor } from '../common/Style'
import { Label3, Paragraph4 } from 'baseui/typography'
import React from 'react'
import { warningAlert } from '../Images'

export const HeaderContent = (props: { kravLength: number; documentedLength: number; nyttKravCounter: number; nyttKravVersjonCounter: number }) => (
  <Block marginBottom="33px" display="flex" alignItems="center">
    {props.kravLength > 0 && (
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
    )}
    {props.documentedLength >= 1 && (props.nyttKravVersjonCounter > 0 || props.nyttKravCounter > 0) && (
      <Block display="flex">
        <img alt="" src={warningAlert} height="20px" width="20px" style={{ marginRight: '2px' }} />
        <Paragraph4 $style={{ lineHeight: '20px', marginTop: '0px', marginBottom: '0px' }}>
          {props.nyttKravCounter > 0 ? (props.nyttKravCounter === 1 ? `${props.nyttKravCounter} nytt krav` : `${props.nyttKravCounter} nye krav`) : ''}
          {props.nyttKravVersjonCounter > 0 && props.nyttKravCounter > 0 && ', '}
          {props.nyttKravVersjonCounter > 0
            ? props.nyttKravVersjonCounter === 1
              ? `${props.nyttKravVersjonCounter} ny versjon`
              : `${props.nyttKravVersjonCounter} nye versjoner`
            : ''}
        </Paragraph4>
      </Block>
    )}
  </Block>
)
