/* TODO USIKKER */
import { Block } from 'baseui/block'
import { HeadingXXLarge } from 'baseui/typography'
import { useState } from 'react'
import { getTemaMainHeader } from '../../pages/TemaPage'
import { TLovCode, TTemaCode } from '../../services/Codelist'
import { ettlevColors, maxPageWidth, responsivePaddingExtraLarge } from '../../util/theme'
import Button from '../common/Button'
import CustomizedModal from '../common/CustomizedModal'
import { borderRadius, marginAll } from '../common/Style'

type TSecondaryHeaderProps = {
  temaData: TTemaCode | undefined
  lovListe: TLovCode[]
}
export const SecondaryHeader = ({ temaData, lovListe }: TSecondaryHeaderProps) => {
  const [isTemaModalOpen, setIsTemaModalOpen] = useState<boolean>(false)

  return (
    <div className="w-full">
      <div className="pt-4 pb-10">
        <div className="flex justify-end w-full">
          <Button
            size="compact"
            $style={{
              fontSize: '18px',
              fontWeight: 600,
              lineHeight: '22px',
              color: ettlevColors.green600,
              textUnderlineOffset: '2px',
              ':hover': { backgroundColor: 'transparent', textDecoration: 'underline 3px' },
            }}
            kind={'tertiary'}
            onClick={() => setIsTemaModalOpen(true)}
            marginLeft
          >
            Om {temaData?.shortName.toLocaleLowerCase()}, og ansvarlig for tema
          </Button>
        </div>
      </div>
      {temaData && (
        <CustomizedModal
          onClose={() => setIsTemaModalOpen(false)}
          isOpen={isTemaModalOpen}
          size="full"
          overrides={{
            Dialog: {
              style: {
                ...borderRadius('0px'),
                ...marginAll('0px'),
                width: '100%',
                maxWidth: maxPageWidth,
              },
            },
          }}
        >
          <div className="w-full">
            <Block
              paddingTop="120px"
              paddingBottom="40px"
              backgroundColor={ettlevColors.green100}
              paddingLeft={responsivePaddingExtraLarge}
              paddingRight={responsivePaddingExtraLarge}
            >
              <HeadingXXLarge marginTop="0px" marginBottom="0px">
                {temaData?.shortName}
              </HeadingXXLarge>
            </Block>
            <Block
              marginBottom="55px"
              marginTop="40px"
              paddingLeft={responsivePaddingExtraLarge}
              paddingRight={responsivePaddingExtraLarge}
            >
              <div>{getTemaMainHeader(temaData, lovListe, true)}</div>
              <div className="flex justify-end w-full mt-9">
                <Button onClick={() => setIsTemaModalOpen(false)}>Lukk visning</Button>
              </div>
            </Block>
          </div>
        </CustomizedModal>
      )}
    </div>
  )
}
