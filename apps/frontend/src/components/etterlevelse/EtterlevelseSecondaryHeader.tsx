import { Block } from 'baseui/block'
import { HeadingXXLarge, LabelSmall } from 'baseui/typography'
import React, { useState } from 'react'
import { TKravId } from '../../api/KravApi'
import { IEtterlevelseDokumentasjon } from '../../constants'
import { TSection } from '../../pages/EtterlevelseDokumentasjonPage'
import { getTemaMainHeader } from '../../pages/TemaPage'
import { TLovCode, TTemaCode } from '../../services/Codelist'
import { ettlevColors, maxPageWidth, responsivePaddingExtraLarge } from '../../util/theme'
import { angleIcon } from '../Images'
import Button from '../common/Button'
import CustomizedModal from '../common/CustomizedModal'
import { borderRadius, marginAll, paddingAll } from '../common/Style'

type TEtterlevelseSecondaryHeaderProps = {
  tab: string
  setTab: React.Dispatch<React.SetStateAction<TSection>>
  setNavigatePath: (state: string) => void
  etterlevelseDokumentasjon: IEtterlevelseDokumentasjon | undefined
  temaData: TTemaCode | undefined
  kravId: TKravId | undefined
  lovListe: TLovCode[]
}
export const EtterlevelseSecondaryHeader = ({
  tab,
  setTab,
  setNavigatePath,
  etterlevelseDokumentasjon,
  temaData,
  lovListe,
  kravId,
}: TEtterlevelseSecondaryHeaderProps) => {
  const [isTemaModalOpen, setIsTemaModalOpen] = useState<boolean>(false)

  return (
    <div className="w-full">
      <Block marginTop="19px" width="fit-content">
        <Button
          kind="tertiary"
          onClick={() => {
            if (tab !== 'dokumentasjon') {
              setTab('dokumentasjon')
            }
            setNavigatePath('/dokumentasjon/' + etterlevelseDokumentasjon?.id)
          }}
          $style={{
            ...paddingAll('0px'),
            ':hover': {
              backgroundColor: 'inherit',
            },
            ':focus': {
              backgroundColor: 'inherit',
            },
          }}
        >
          {/* TODO USIKKER */}
          <LabelSmall
            $style={{
              fontSize: '18px',
              fontWeight: 400,
              lineHeight: '22px',
              color: ettlevColors.green600,
              textDecoration: 'underline',
              ':hover': {
                color: ettlevColors.green400,
              },
            }}
          >
            Temaoversikt
          </LabelSmall>
        </Button>
      </Block>

      <div className="mt-2">
        <img src={angleIcon} alt="angle icon" />{' '}
        <Button
          kind="tertiary"
          onClick={() => {
            if (tab !== 'dokumentasjon') {
              setTab('dokumentasjon')
            }
            setNavigatePath(`/dokumentasjon/${etterlevelseDokumentasjon?.id}`)
          }}
          $style={{
            ...paddingAll('0px'),
            ':hover': {
              backgroundColor: 'inherit',
            },
            ':focus': {
              backgroundColor: 'inherit',
            },
          }}
        >
          {/* TODO USIKKER */}
          <LabelSmall
            marginLeft="12px"
            $style={{
              fontSize: '18px',
              fontWeight: 400,
              lineHeight: '22px',
              color: ettlevColors.green600,
              textDecoration: 'underline',
              ':hover': {
                color: ettlevColors.green400,
              },
            }}
          >
            {temaData?.shortName}
          </LabelSmall>
        </Button>
      </div>

      <Block
        marginTop="0px"
        marginBottom="56px"
        display="flex"
        width="calc(100% - 35px)"
        alignItems="center"
        justifyContent="center"
        marginLeft="35px"
      >
        <div className="flex flex-1">
          <img src={angleIcon} alt="angle icon" />{' '}
          <LabelSmall
            marginLeft="12px"
            $style={{
              fontSize: '24px',
              fontWeight: 900,
              lineHeight: '32px',
              color: ettlevColors.green600,
              whiteSpace: 'nowrap',
            }}
          >
            K{kravId?.kravNummer}.{kravId?.kravVersjon}
          </LabelSmall>
        </div>

        <div className="flex justify-end w-full">
          <Button
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
            Om {temaData?.shortName.toLocaleLowerCase()} og ansvarlig for tema
          </Button>
        </div>
      </Block>

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
            {/* TODO USIKKER */}
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
              <Block display="flex" justifyContent="flex-end" width="100%" marginTop="38px">
                <Button onClick={() => setIsTemaModalOpen(false)}>Lukk visning</Button>
              </Block>
            </Block>
          </div>
        </CustomizedModal>
      )}
    </div>
  )
}
