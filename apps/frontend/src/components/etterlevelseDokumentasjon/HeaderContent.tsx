import { Block } from 'baseui/block'
import { Tag } from 'baseui/tag'
import { LabelSmall, ParagraphXSmall } from 'baseui/typography'
import { ettlevColors } from '../../util/theme'
import { warningAlert } from '../Images'
import { borderColor } from '../common/Style'

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
          <LabelSmall color={ettlevColors.navOransje} $style={{ fontSize: '20px', lineHeight: '18px' }} marginRight="4px">
            {props.kravLength}
          </LabelSmall>
          <ParagraphXSmall $style={{ lineHeight: '18px', marginTop: '0px', marginBottom: '0px' }}>krav</ParagraphXSmall>
        </Block>
      </Tag>
    )}
    {props.documentedLength >= 1 && (props.nyttKravVersjonCounter > 0 || props.nyttKravCounter > 0) && (
      <Block display="flex">
        <img alt="warning icon" src={warningAlert} height="20px" width="20px" style={{ marginRight: '2px' }} />
        <ParagraphXSmall $style={{ lineHeight: '20px', marginTop: '0px', marginBottom: '0px' }}>
          {props.nyttKravCounter > 0 ? (props.nyttKravCounter === 1 ? `${props.nyttKravCounter} nytt krav` : `${props.nyttKravCounter} nye krav`) : ''}
          {props.nyttKravVersjonCounter > 0 && props.nyttKravCounter > 0 && ', '}
          {props.nyttKravVersjonCounter > 0
            ? props.nyttKravVersjonCounter === 1
              ? `${props.nyttKravVersjonCounter} ny versjon`
              : `${props.nyttKravVersjonCounter} nye versjoner`
            : ''}
        </ParagraphXSmall>
      </Block>
    )}
  </Block>
)
