import {Block} from 'baseui/block'
import Button from '../common/Button'
import {borderRadius, marginAll} from '../common/Style'
import {HeadingXXLarge} from 'baseui/typography'
import {ettlevColors, maxPageWidth, responsivePaddingExtraLarge} from '../../util/theme'
import CustomizedModal from '../common/CustomizedModal'
import {getTemaMainHeader} from '../../pages/TemaPage'
import {useState} from 'react'
import {EtterlevelseDokumentasjon} from '../../constants'
import {LovCode, TemaCode} from '../../services/Codelist'

type SecondaryHeaderProps = {
  etterlevelseDokumentasjon: EtterlevelseDokumentasjon | undefined
  temaData: TemaCode | undefined
  lovListe: LovCode[]
}
export const SecondaryHeader = ({ etterlevelseDokumentasjon, temaData, lovListe }: SecondaryHeaderProps) => {
  const [isTemaModalOpen, setIsTemaModalOpen] = useState<boolean>(false)

  return (
    <Block width="100%">
      <div className="pt-4 pb-10">
        <Block display="flex" justifyContent="flex-end" width="100%">
          <Button
            variant={'tertiary'}
            onClick={() => setIsTemaModalOpen(true)}
            marginLeft
          >
            Om {temaData?.shortName.toLocaleLowerCase()}, og ansvarlig for tema
          </Button>
        </Block>
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
          <Block width="100%">
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
            <Block marginBottom="55px" marginTop="40px" paddingLeft={responsivePaddingExtraLarge} paddingRight={responsivePaddingExtraLarge}>
              <Block>{getTemaMainHeader(temaData, lovListe, true, () => {}, true, true)}</Block>
              <Block display="flex" justifyContent="flex-end" width="100%" marginTop="38px">
                <Button onClick={() => setIsTemaModalOpen(false)}>Lukk visning</Button>
              </Block>
            </Block>
          </Block>
        </CustomizedModal>
      )}
    </Block>
  )
}
