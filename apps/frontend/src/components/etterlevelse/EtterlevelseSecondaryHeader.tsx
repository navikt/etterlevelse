import { Block } from 'baseui/block'
import Button from '../common/Button'
import { borderRadius, marginAll, paddingAll } from '../common/Style'
import { H1, Label3 } from 'baseui/typography'
import { ettlevColors, maxPageWidth, responsivePaddingExtraLarge } from '../../util/theme'
import { angleIcon, page2Icon } from '../Images'
import CustomizedModal from '../common/CustomizedModal'
import { getTemaMainHeader } from '../../pages/TemaPage'
import React, { useState } from 'react'
import { Behandling } from '../../constants'
import { LovCode, TemaCode } from '../../services/Codelist'
import { Section } from '../../pages/EtterlevelseDokumentasjonPage'
import { KravId } from '../../api/KravApi'

type EtterlevelseSecondaryHeaderProps = {
  tab: string
  setTab: React.Dispatch<React.SetStateAction<Section>>
  setNavigatePath: (state: string) => void
  behandling: Behandling | undefined
  temaData: TemaCode | undefined
  kravId: KravId | undefined
  lovListe: LovCode[]
}
export const EtterlevelseSecondaryHeader = ({
  tab,
  setTab,
  setNavigatePath,
  behandling,
  temaData,
  lovListe,
  kravId
}: EtterlevelseSecondaryHeaderProps) => {


  const [isTemaModalOpen, setIsTemaModalOpen] = useState<boolean>(false)

  return (
    <Block width="100%">
      <Block marginTop="19px" width="fit-content">
        <Button
          kind="tertiary"
          onClick={() => {
            if (tab !== 'dokumentasjon') {
              setTab('dokumentasjon')
            }
            setNavigatePath('/behandling/' + behandling?.id)
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
          <Label3
            $style={{
              fontSize: '18px',
              fontWeight: 400,
              lineHeight: '22px',
              color: ettlevColors.green600, textDecoration: 'underline',
              ':hover': {
                color: ettlevColors.green400
              }
            }}>
            Krav til utfylling
          </Label3>
        </Button>
      </Block>

      <Block marginTop="8px">
        <img src={angleIcon} alt="" />{' '}
        <Button
          kind="tertiary"
          onClick={() => {
            if (tab !== 'dokumentasjon') {
              setTab('dokumentasjon')
            }
            setNavigatePath('/behandling/' + behandling?.id + '/' + temaData?.code)
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
          <Label3
            marginLeft="12px"
            $style={{
              fontSize: '18px',
              fontWeight: 400,
              lineHeight: '22px',
              color: ettlevColors.green600, textDecoration: 'underline',
              ':hover': {
                color: ettlevColors.green400
              }
            }}>
            {temaData?.shortName}
          </Label3>
        </Button>
      </Block>

      <Block
        marginTop="0px"
        marginBottom="56px"
        display="flex"
        width="calc(100% - 35px)"
        alignItems="center"
        justifyContent="center"
        marginLeft="35px"
      >
        <Block display="flex" flex="1">
          <img src={angleIcon} alt="" />{' '}
          <Label3 marginLeft="12px" $style={{ fontSize: '24px', fontWeight: 900, lineHeight: '32px', color: ettlevColors.green600, whiteSpace: 'nowrap' }}>
            K{kravId?.kravNummer}.{kravId?.kravVersjon}
          </Label3>
        </Block>


        <Block display="flex" justifyContent="flex-end" width="100%">
          <Button
            startEnhancer={<img src={page2Icon} alt="Om personvern og ansvarlig for tema" />}
            size="compact"
            $style={{
              fontSize: '18px',
              fontWeight: 600,
              lineHeight: '22px',
              color: ettlevColors.green600,
              ':hover': { backgroundColor: 'transparent', textDecoration: 'underline 3px' },
            }}
            kind={'tertiary'}
            onClick={() => setIsTemaModalOpen(true)}
            marginLeft
          >
            Om {temaData?.shortName.toLocaleLowerCase()} og ansvarlig for tema
          </Button>
        </Block>
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
          <Block width="100%">
            <Block paddingTop="120px" paddingBottom="40px" backgroundColor={ettlevColors.green100} paddingLeft={responsivePaddingExtraLarge}
              paddingRight={responsivePaddingExtraLarge}>
              <H1 marginTop="0px" marginBottom="0px">
                {temaData?.shortName}
              </H1>
            </Block>
            <Block marginBottom="55px" marginTop="40px" paddingLeft={responsivePaddingExtraLarge} paddingRight={responsivePaddingExtraLarge}>
              <Block>{getTemaMainHeader(temaData, lovListe, true, () => {
              }, true, true)}</Block>
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