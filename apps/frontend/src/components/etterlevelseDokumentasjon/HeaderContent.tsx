/* TODO USIKKER */
import { Tag } from 'baseui/tag'
import { LabelSmall, ParagraphXSmall } from 'baseui/typography'
import { ettlevColors } from '../../util/theme'
import { warningAlert } from '../Images'
import { borderColor } from '../common/Style'

interface IPropsHeaderContent {
  kravLength: number
  documentedLength: number
  nyttKravCounter: number
  nyttKravVersjonCounter: number
}

export const HeaderContent = ({
  kravLength,
  documentedLength,
  nyttKravCounter,
  nyttKravVersjonCounter,
}: IPropsHeaderContent) => (
  <div className="flex items-center mb-8">
    {kravLength > 0 && (
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
        <div className="flex items-baseline">
          <LabelSmall
            color={ettlevColors.navOransje}
            $style={{ fontSize: '20px', lineHeight: '18px' }}
            marginRight="4px"
          >
            {kravLength}
          </LabelSmall>
          <ParagraphXSmall $style={{ lineHeight: '18px', marginTop: '0px', marginBottom: '0px' }}>
            krav
          </ParagraphXSmall>
        </div>
      </Tag>
    )}
    {documentedLength >= 1 && (nyttKravVersjonCounter > 0 || nyttKravCounter > 0) && (
      <div className="flex">
        <img
          alt="warning icon"
          src={warningAlert}
          height="20px"
          width="20px"
          style={{ marginRight: '2px' }}
        />
        <ParagraphXSmall $style={{ lineHeight: '20px', marginTop: '0px', marginBottom: '0px' }}>
          {nyttKravCounter > 0
            ? nyttKravCounter === 1
              ? `${nyttKravCounter} nytt krav`
              : `${nyttKravCounter} nye krav`
            : ''}
          {nyttKravVersjonCounter > 0 && nyttKravCounter > 0 && ', '}
          {nyttKravVersjonCounter > 0
            ? nyttKravVersjonCounter === 1
              ? `${nyttKravVersjonCounter} ny versjon`
              : `${nyttKravVersjonCounter} nye versjoner`
            : ''}
        </ParagraphXSmall>
      </div>
    )}
  </div>
)
